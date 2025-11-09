'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import React from 'react';

function LogoutButton() {
  return <Button onClick={() => authClient.signOut()}>Logout</Button>;
}

export default LogoutButton;
