import { isAdminAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RadarClient from './RadarClient';

export default async function RadarPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');
  return <RadarClient />;
}
