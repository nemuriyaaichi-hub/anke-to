import { isAdminAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');
  return <AdminDashboardClient />;
}
