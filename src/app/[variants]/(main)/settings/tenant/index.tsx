'use client';

import { Alert, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import DomainSettings from '@/features/TenantSettings/DomainSettings';
import { lambdaQuery } from '@/libs/trpc/client/lambda';

// Hardcoded tenant slug for development
// In production, this would come from user's session/context
const TENANT_SLUG = 'ceremonia';

const TenantSettings = () => {
  const { t } = useTranslation('setting');

  // Fetch tenant data via tRPC
  const { data, isLoading, error, refetch } = lambdaQuery.domain.getTenant.useQuery(
    { slug: TENANT_SLUG },
    {
      retry: false,
    },
  );

  const tenant = data?.tenant;

  // Debug logging - separate logs for clarity
  console.log('[TenantSettings] isLoading:', isLoading);
  console.log('[TenantSettings] error:', error?.message || 'none');
  console.log('[TenantSettings] data:', data);
  console.log('[TenantSettings] tenant:', tenant);

  if (isLoading) {
    return (
      <Flexbox gap={24} padding={24} style={{ maxWidth: '1024px', width: '100%' }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Flexbox>
    );
  }

  if (error) {
    return (
      <Flexbox gap={24} style={{ maxWidth: '1024px', width: '100%' }}>
        <Alert
          description={error.message || 'Failed to load tenant settings'}
          message="Error"
          showIcon
          type="error"
        />
      </Flexbox>
    );
  }

  return (
    <Flexbox gap={24} style={{ maxWidth: '1024px', width: '100%' }}>
      <h1>{t('tenant.title', 'Tenant Settings')}</h1>
      {tenant ? (
        <DomainSettings onRefresh={() => refetch()} tenant={tenant} />
      ) : (
        <Alert
          description={`No tenant found for slug "${TENANT_SLUG}". Check browser console for query state.`}
          message="Tenant Not Found"
          showIcon
          type="warning"
        />
      )}
    </Flexbox>
  );
};

TenantSettings.displayName = 'TenantSettings';

export default TenantSettings;
