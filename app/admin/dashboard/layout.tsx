import Sidebar from '@/components/admin/Sidebar';
import { headers } from 'next/headers';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const userRole = headersList.get('x-user-role') || 'admin';
  const username = headersList.get('x-username') || 'Admin';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={userRole} username={username} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}