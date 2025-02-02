'use client';

import withSpace from '@/app/withSpace';
import Block from '@/components/app/Block';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import FullPageLoader from '@/components/core/loaders/FullPageLoading';
import RowLoading from '@/components/core/loaders/RowLoading';
import PageWrapper from '@/components/core/page/PageWrapper';
import TimelineDetails from '@/components/timelines/View/TimelineDetailView';
import { SpaceWithIntegrationsFragment, useTimelineDetailsQuery } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TimelinePage = ({ params, space }: { params: { timelineId: string }; space: SpaceWithIntegrationsFragment }) => {
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];
  const router = useRouter();
  const { data, loading } = useTimelineDetailsQuery({ variables: { timelineId: params.timelineId, spaceId: space.id } });

  return (
    <PageWrapper>
      <div className="pt-12">
        <div className="lg:px-6 py-4">
          {data?.timeline && !loading ? (
            <>
              <div className="px-4 md:px-0 mb-5 flex justify-between">
                <Link href="/timelines" className="text-color">
                  <span className="mr-1 font-bold">&#8592;</span>
                  All Timelines
                </Link>
                <div className="ml-3">
                  <PrivateEllipsisDropdown
                    items={threeDotItems}
                    onSelect={(key) => {
                      router.push(`/timelines/edit/${params.timelineId}`);
                    }}
                  />
                </div>
              </div>

              <div>{loading ? <FullPageLoader /> : <TimelineDetails timeline={data?.timeline} space={space} />}</div>
            </>
          ) : (
            <Block slim>
              <RowLoading className="my-2" />
            </Block>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default withSpace(TimelinePage);
