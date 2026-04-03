import SurveyClient from './SurveyClient';

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  return <SurveyClient step={parseInt(step)} />;
}
