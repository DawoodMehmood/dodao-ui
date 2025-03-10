'use client';
import AddByteCollection from '@/components/byteCollection/ByteCollections/AddByteCollection';
import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import SortByteCollectionsModal from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/SortByteCollectionsModal';
import NoByteCollections from '@/components/byteCollection/ByteCollections/NoByteCollections';
import ArrowsUpDown from '@heroicons/react/24/solid/ArrowsUpDownIcon';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { Grid2Cols } from '@dodao/web-core/components/core/grids/Grid2Cols';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function ByteCollectionsGrid({
  byteCollections,
  space,
  byteCollectionsBaseUrl,
  isAdmin,
}: {
  byteCollections?: ByteCollectionSummary[];
  space: SpaceWithIntegrationsDto;
  byteCollectionsBaseUrl: string;
  isAdmin?: boolean | undefined;
}) {
  const router = useRouter();
  const currentPath = usePathname();
  const searchParams = useSearchParams();
  const archived = searchParams.get('archive');
  const isArchived = archived === 'true';

  const sort = searchParams.get('sort');
  const openSort = sort === 'true';

  const byteCollectionsList = isArchived ? byteCollections : byteCollections?.filter((byteCollection) => !byteCollection.archive);
  const handleToggle = () => {
    const newRoute = `${currentPath}?archive=${!isArchived}`;
    router.push(newRoute);
  };

  const handleSort = () => {
    const newRoute = `${currentPath}?sort=${!openSort}`;
    router.push(newRoute);
  };

  // See if there are more than one type of items in the byteCollections
  const showItemTypeBadge: boolean = new Set(byteCollections?.flatMap((bc) => bc.items)?.map((item) => item.type) || []).size > 1;

  return (
    <>
      {isAdmin && (
        <div className="flex justify-end mb-2 items-center gap-x-8">
          <ToggleWithIcon label={'See Archived'} enabled={isArchived} setEnabled={handleToggle} onClickOnLabel={true} />
          <div className="flex align-center mt-4 mb-1 cursor-pointer" onClick={handleSort}>
            <div className="mr-3">
              <ArrowsUpDown
                style={{
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--primary-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                }}
                className="h-6 w-6 cursor-pointer"
                aria-hidden="true"
              />
            </div>
            <div>Sort Collections</div>
          </div>
        </div>
      )}
      {!byteCollectionsList?.length && !isAdmin && <NoByteCollections space={space} />}
      {!!byteCollectionsList?.length && (
        <Grid2Cols>
          {byteCollectionsList?.map((byteCollection, i) => (
            <ByteCollectionsCard
              key={i}
              byteCollection={byteCollection}
              viewByteBaseUrl={`${byteCollectionsBaseUrl}/view/${byteCollection.id}/`}
              space={space}
              isAdmin={isAdmin}
              showArchived={isArchived}
              showItemTypeBadge={showItemTypeBadge}
            />
          ))}
        </Grid2Cols>
      )}
      {isAdmin && <AddByteCollection space={space} />}
      {openSort && <SortByteCollectionsModal byteCollections={byteCollections!} space={space} onClose={handleSort} />}
    </>
  );
}
