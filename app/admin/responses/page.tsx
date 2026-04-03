import { isAdminAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ResponsesClient from './ResponsesClient';

export default async function ResponsesPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');
  return <ResponsesClient />;
}
