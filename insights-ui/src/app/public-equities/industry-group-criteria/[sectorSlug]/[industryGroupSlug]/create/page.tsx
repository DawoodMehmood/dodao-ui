import CriteriaTable from '@/components/criteria/CriteriaTable';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { IndustryGroupCriteria } from '@/types/criteria/criteria';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons'; // Adjust the import path as needed
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export default async function CustomCriteriaPage({ params }: { params: Promise<{ sectorSlug: string; industryGroupSlug: string }> }) {
  const { sectorSlug, industryGroupSlug } = await params;

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: `Industry Group Criteria Table`,
      href: `/public-equities/industry-group-criteria`,
      current: false,
    },
    {
      name: `Create`,
      href: `/public-equities/industry-group-criteria/${sectorSlug}/${industryGroupSlug}/create`,
      current: true,
    },
  ];
  const customCriteriaUrl = `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/${sectorSlug}/${industryGroupSlug}/custom-criteria.json`;
  let customCriteriaData;
  const response = await fetch(customCriteriaUrl);
  if (response.status === 200) {
    customCriteriaData = (await response.json()) as IndustryGroupCriteria;
  }

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <CriteriaTable sectorSlug={sectorSlug} industryGroupSlug={industryGroupSlug} customCriteria={customCriteriaData} />
    </PageWrapper>
  );
}
