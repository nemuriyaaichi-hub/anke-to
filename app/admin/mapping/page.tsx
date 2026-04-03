import { isAdminAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MappingClient from './MappingClient';

export default async function MappingPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');
  return <MappingClient />;
}
