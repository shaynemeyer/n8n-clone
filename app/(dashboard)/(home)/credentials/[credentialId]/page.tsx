import { requireAuth } from '@/lib/auth-utils';
import React from 'react';

interface PageProps {
  params: Promise<{
    credentialId: string;
  }>;
}

async function CredentialDetailPage({ params }: PageProps) {
  await requireAuth();

  const { credentialId } = await params;
  return <div>Credential id: {credentialId}</div>;
}

export default CredentialDetailPage;
