import { isAdminAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import QuestionsClient from './QuestionsClient';

export default async function QuestionsPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');
  return <QuestionsClient />;
}
