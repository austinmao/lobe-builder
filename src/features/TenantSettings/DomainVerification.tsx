'use client';

import { CheckCircleOutlined, CopyOutlined } from '@ant-design/icons';
import { Alert, Button, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const { Text, Paragraph } = Typography;

interface DomainVerificationProps {
  records: Array<{
    name: string;
    type: string;
    value: string;
  }>;
}

/**
 * DomainVerification - DNS verification instructions display
 *
 * This component displays DNS records that need to be configured
 * for custom domain verification. It shows:
 * - TXT records for domain ownership verification
 * - CNAME records for routing traffic to Vercel
 *
 * Each record includes a copy button for easy clipboard access.
 *
 * @param props - Component props
 * @param props.records - Array of DNS verification records from Vercel API
 *
 * @example
 * ```tsx
 * <DomainVerification
 *   records={[
 *     { type: 'TXT', name: '_vercel', value: 'vc-domain-verify=...' }
 *   ]}
 * />
 * ```
 */
const DomainVerification = ({ records }: DomainVerificationProps) => {
  const { t } = useTranslation('setting');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Flexbox gap={16}>
      <Text strong style={{ fontSize: 16 }}>
        {t('tenant.domain.configureDNS', 'Configure DNS Records')}
      </Text>

      <Paragraph type="secondary">
        {t(
          'tenant.domain.dnsInstructions',
          'Add the following DNS records to your domain provider to verify ownership:',
        )}
      </Paragraph>

      {/* TXT Record */}
      {records
        .filter((r) => r.type === 'TXT')
        .map((record, index) => (
          <Alert
            key={`txt-${index}`}
            message={
              <Flexbox gap={12}>
                <Text strong>{t('tenant.domain.txtRecord', 'TXT Record')}</Text>
                <Flexbox gap={4}>
                  <Text type="secondary">{t('tenant.domain.recordType', 'Type')}:</Text>
                  <Text code>TXT</Text>
                </Flexbox>
                <Flexbox gap={4}>
                  <Text type="secondary">{t('tenant.domain.recordName', 'Name')}:</Text>
                  <Text code>{record.name}</Text>
                  <Button
                    icon={copiedIndex === index ? <CheckCircleOutlined /> : <CopyOutlined />}
                    onClick={() => handleCopy(record.name, index)}
                    size="small"
                  >
                    {copiedIndex === index
                      ? t('tenant.domain.copied', 'Copied')
                      : t('tenant.domain.copy', 'Copy')}
                  </Button>
                </Flexbox>
                <Flexbox gap={4}>
                  <Text type="secondary">{t('tenant.domain.recordValue', 'Value')}:</Text>
                  <Text code style={{ wordBreak: 'break-all' }}>
                    {record.value}
                  </Text>
                  <Button
                    icon={copiedIndex === index + 100 ? <CheckCircleOutlined /> : <CopyOutlined />}
                    onClick={() => handleCopy(record.value, index + 100)}
                    size="small"
                  >
                    {copiedIndex === index + 100
                      ? t('tenant.domain.copied', 'Copied')
                      : t('tenant.domain.copy', 'Copy')}
                  </Button>
                </Flexbox>
              </Flexbox>
            }
            showIcon
            type="info"
          />
        ))}

      {/* CNAME Record */}
      <Alert
        message={
          <Flexbox gap={12}>
            <Text strong>{t('tenant.domain.cnameRecord', 'CNAME Record')}</Text>
            <Paragraph type="secondary">
              {t(
                'tenant.domain.cnameInstructions',
                'After TXT verification, add this CNAME record to point your domain to Vercel:',
              )}
            </Paragraph>
            <Flexbox gap={4}>
              <Text type="secondary">{t('tenant.domain.recordType', 'Type')}:</Text>
              <Text code>CNAME</Text>
            </Flexbox>
            <Flexbox gap={4}>
              <Text type="secondary">{t('tenant.domain.recordName', 'Name')}:</Text>
              <Text code>@</Text>
              {t('tenant.domain.or', ' or ')}
              <Text code>www</Text>
            </Flexbox>
            <Flexbox gap={4}>
              <Text type="secondary">{t('tenant.domain.recordValue', 'Value')}:</Text>
              <Text code>cname.vercel-dns.com</Text>
              <Button
                icon={copiedIndex === 1000 ? <CheckCircleOutlined /> : <CopyOutlined />}
                onClick={() => handleCopy('cname.vercel-dns.com', 1000)}
                size="small"
              >
                {copiedIndex === 1000
                  ? t('tenant.domain.copied', 'Copied')
                  : t('tenant.domain.copy', 'Copy')}
              </Button>
            </Flexbox>
          </Flexbox>
        }
        showIcon
        type="info"
      />
    </Flexbox>
  );
};

export default DomainVerification;
