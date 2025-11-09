import { requireAuth } from '@/lib/auth-utils';

async function HomePage() {
  await requireAuth();

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      protected server component
    </div>
  );
}

export default HomePage;
