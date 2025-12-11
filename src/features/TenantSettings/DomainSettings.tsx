'use client';

import { Alert, Button, Form, Input, Modal, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { lambdaQuery } from '@/libs/trpc/client/lambda';
import { validateDomain } from '@/server/modules/VercelDomain/validators';

import DomainVerification from './DomainVerification';

const { Text } = Typography;

interface DomainSettingsProps {
  onRefresh?: () => void;
  tenant: {
    domain: string | null;
    domainStatus: 'pending_verification' | 'verified' | null;
    domainVerificationRecords: Array<{ name: string; type: string; value: string }> | null;
    id: string;
  };
}

/**
 * Validate domain format for client-side feedback
 *
 * Note: This provides user-friendly error messages.
 * Server-side validation is the source of truth (validators.ts).
 *
 * @param domain - Domain name to validate
 * @returns Object with validation result and error message if invalid
 */
function validateDomainFormat(domain: string): { error?: string; valid: boolean } {
  if (!domain || domain.trim() === '') {
    return { error: 'Domain is required', valid: false };
  }

  // Use server-side validator for consistency
  if (!validateDomain(domain)) {
    // Provide specific user-friendly messages for common errors
    if (domain.includes('http://') || domain.includes('https://')) {
      return { error: 'Do not include protocol', valid: false };
    }

    if (domain.endsWith('/')) {
      return { error: 'Invalid domain format', valid: false };
    }

    if (domain.includes(' ')) {
      return { error: 'Invalid domain format', valid: false };
    }

    if (domain === 'localhost' || domain.startsWith('localhost:')) {
      return { error: 'Invalid domain format', valid: false };
    }

    // Check for IP addresses
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(domain)) {
      return { error: 'IP addresses not allowed', valid: false };
    }

    // Generic error for other validation failures
    return { error: 'Invalid domain format', valid: false };
  }

  return { valid: true };
}

/**
 * DomainSettings - Custom domain management UI for tenant settings
 *
 * This component allows tenant admins to:
 * - Add custom domains to their tenant
 * - Verify DNS configuration
 * - Remove custom domains
 *
 * Flow:
 * 1. Admin clicks "Add Custom Domain" → Domain input modal appears
 * 2. Domain is validated client-side → Server-side validation via tRPC
 * 3. Domain added to Vercel → DNS verification instructions displayed
 * 4. Admin configures DNS → Clicks "Verify Domain"
 * 5. Domain verified → Middleware routes traffic to tenant
 *
 * @param props - Component props
 * @param props.tenant - Tenant object with domain configuration
 * @param props.onRefresh - Callback to refresh parent component state
 *
 * @example
 * ```tsx
 * <DomainSettings
 *   tenant={tenant}
 *   onRefresh={() => refetch()}
 * />
 * ```
 */
const DomainSettings = ({ tenant, onRefresh }: DomainSettingsProps) => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // tRPC mutations
  const addDomain = lambdaQuery.domain.add.useMutation({
    onError: (error) => {
      const message = error?.message || 'Failed to add domain';
      setValidationError(message);
    },
    onSuccess: () => {
      setIsAddModalOpen(false);
      form.resetFields();
      setValidationError(null);
      onRefresh?.();
    },
  });

  const verifyDomain = lambdaQuery.domain.verify.useMutation({
    onError: (error) => {
      console.error('Verification failed:', error);
    },
    onSuccess: () => {
      onRefresh?.();
    },
  });

  const removeDomain = lambdaQuery.domain.remove.useMutation({
    onError: (error) => {
      console.error('Remove failed:', error);
    },
    onSuccess: () => {
      setIsRemoveModalOpen(false);
      onRefresh?.();
    },
  });

  const handleAddDomain = async () => {
    const domain = form.getFieldValue('domain');

    // Client-side validation
    const validation = validateDomainFormat(domain);
    if (!validation.valid) {
      setValidationError(validation.error!);
      return;
    }

    setValidationError(null);

    // Call API
    await addDomain.mutateAsync({
      domain: domain.trim(),
      tenantId: tenant.id,
    });
  };

  const handleVerifyDomain = async () => {
    await verifyDomain.mutateAsync({
      tenantId: tenant.id,
    });
  };

  const handleRemoveDomain = async () => {
    await removeDomain.mutateAsync({
      tenantId: tenant.id,
    });
  };

  // Determine current state
  const hasNoDomain = !tenant.domain;
  const isPending = tenant.domainStatus === 'pending_verification';
  const isVerified = tenant.domainStatus === 'verified';
  // Handle edge case: domain exists but status is null (legacy data or direct DB entry)
  const needsStatusUpdate = tenant.domain && !tenant.domainStatus;

  return (
    <Flexbox gap={24}>
      {/* Status Section */}
      {hasNoDomain && (
        <Alert
          message={t('tenant.domain.noDomain', 'No custom domain configured')}
          showIcon
          type="info"
        />
      )}

      {/* Domain exists but status is null - needs verification */}
      {needsStatusUpdate && (
        <Flexbox gap={16}>
          <Alert
            message={
              <Flexbox gap={8}>
                <Text>
                  {t('tenant.domain.domainConfigured', `Domain Configured: ${tenant.domain}`)}
                </Text>
                <div data-status="needs_verification">
                  <Text type="warning">
                    {t('tenant.domain.statusNeedsVerification', 'Needs Verification')}
                  </Text>
                </div>
              </Flexbox>
            }
            showIcon
            type="info"
          />

          <Button
            disabled={verifyDomain.isPending}
            loading={verifyDomain.isPending}
            onClick={handleVerifyDomain}
            type="primary"
          >
            {t('tenant.domain.verifyButton', 'Verify Domain')}
          </Button>

          <Button danger onClick={() => setIsRemoveModalOpen(true)}>
            {t('tenant.domain.removeButton', 'Remove Domain')}
          </Button>
        </Flexbox>
      )}

      {isPending && (
        <Flexbox gap={16}>
          <Alert
            message={
              <Flexbox gap={8}>
                <Text>
                  {t(
                    'tenant.domain.pendingVerification',
                    `Domain: ${tenant.domain} - Pending Verification`,
                  )}
                </Text>
                <div data-status="pending_verification">
                  <Text type="warning">
                    {t('tenant.domain.statusPending', 'Pending Verification')}
                  </Text>
                </div>
              </Flexbox>
            }
            showIcon
            type="warning"
          />

          {tenant.domainVerificationRecords && (
            <DomainVerification records={tenant.domainVerificationRecords} />
          )}

          <Button
            disabled={verifyDomain.isPending}
            loading={verifyDomain.isPending}
            onClick={handleVerifyDomain}
            type="primary"
          >
            {t('tenant.domain.verifyButton', 'Verify Domain')}
          </Button>
        </Flexbox>
      )}

      {isVerified && (
        <Flexbox gap={16}>
          <Alert
            message={
              <Flexbox gap={8}>
                <Text>{t('tenant.domain.verified', `Domain Verified: ${tenant.domain}`)}</Text>
                <div data-status="verified">
                  <Text type="success">{t('tenant.domain.statusVerified', 'Verified')}</Text>
                </div>
              </Flexbox>
            }
            showIcon
            type="success"
          />

          <Button danger onClick={() => setIsRemoveModalOpen(true)}>
            {t('tenant.domain.removeButton', 'Remove Domain')}
          </Button>
        </Flexbox>
      )}

      {/* Add Domain Button (only show if no domain) */}
      {hasNoDomain && (
        <Button onClick={() => setIsAddModalOpen(true)} type="primary">
          {t('tenant.domain.addButton', 'Add Custom Domain')}
        </Button>
      )}

      {/* Add Domain Modal */}
      <Modal
        footer={null}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
          setValidationError(null);
        }}
        open={isAddModalOpen}
        title={t('tenant.domain.addModalTitle', 'Add Custom Domain')}
      >
        <Form form={form} layout="vertical" onFinish={handleAddDomain}>
          <Form.Item
            label={t('tenant.domain.domainLabel', 'Domain Name')}
            name="domain"
            rules={[{ message: t('tenant.domain.required', 'Domain is required'), required: true }]}
          >
            <Input
              onChange={() => setValidationError(null)}
              placeholder={t('tenant.domain.placeholder', 'example.com')}
            />
          </Form.Item>

          {validationError && <Alert message={validationError} showIcon type="error" />}

          <Flexbox gap={8} horizontal justify="flex-end" style={{ marginTop: 16 }}>
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
                form.resetFields();
                setValidationError(null);
              }}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button htmlType="submit" loading={addDomain.isPending} type="primary">
              {t('tenant.domain.addSubmit', 'Add Domain')}
            </Button>
          </Flexbox>
        </Form>
      </Modal>

      {/* Remove Domain Confirmation Modal */}
      <Modal
        footer={null}
        onCancel={() => setIsRemoveModalOpen(false)}
        open={isRemoveModalOpen}
        title={t('tenant.domain.removeModalTitle', 'Remove Domain')}
      >
        <Flexbox gap={16}>
          <Text>
            {t('tenant.domain.removeConfirm', 'Are you sure you want to remove this domain?')}
          </Text>

          <Flexbox gap={8} horizontal justify="flex-end">
            <Button onClick={() => setIsRemoveModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              danger
              loading={removeDomain.isPending}
              onClick={handleRemoveDomain}
              type="primary"
            >
              {t('tenant.domain.confirmRemove', 'Confirm')}
            </Button>
          </Flexbox>
        </Flexbox>
      </Modal>

      {/* Success Messages (displayed via mutation callbacks) */}
      {verifyDomain.isSuccess && verifyDomain.data?.verified && (
        <Alert
          closable
          message={t('tenant.domain.verifySuccess', 'Domain Verified')}
          showIcon
          type="success"
        />
      )}

      {removeDomain.isSuccess && (
        <Alert
          closable
          message={t('tenant.domain.removeSuccess', 'Domain Removed')}
          showIcon
          type="success"
        />
      )}
    </Flexbox>
  );
};

export default DomainSettings;
