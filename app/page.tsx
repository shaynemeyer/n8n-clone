import { requireAuth } from '@/lib/auth-utils';
import LogoutButton from './logout';

async function HomePage() {
  await requireAuth();

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center gap-4 flex-col">
      <div>protected server component</div>

      <div>
        <LogoutButton />
      </div>
    </div>
  );
}

export default HomePage;
