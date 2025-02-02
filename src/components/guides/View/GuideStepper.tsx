import GuideEndRatingModal from '@/components/app/Modal/Guide/GuideEndRatingModal';
import GuideSidebar from '@/components/guides/View/GuideSidebar';
import GuideStepperItem from '@/components/guides/View/GuideStepperItem';
import { useGuideRatings } from '@/components/guides/View/useGuideRatings';
import { UseViewGuideHelper } from '@/components/guides/View/useViewGuide';
import { GuideFragment, Space } from '@/graphql/generated/generated-types';
import React, { useMemo } from 'react';
import styles from './GuideStepper.module.scss';

interface GuideProps {
  viewGuideHelper: UseViewGuideHelper;
  guide: GuideFragment;
  space: Space;
}

const Guide: React.FC<GuideProps> = ({ viewGuideHelper, guide, space }) => {
  const activeStep = useMemo(
    () => guide.steps.find((step) => step.order === viewGuideHelper.activeStepOrder) || guide.steps[0],
    [guide.steps, viewGuideHelper.activeStepOrder]
  );

  const { showEndRatingsModal, setShowEndRatingsModal, setGuideRating, skipGuideRating } = useGuideRatings(space, guide, viewGuideHelper.guideSubmission);

  return (
    <div className="flex">
      <div className={`hidden lg:flex grow flex-col gap-y-5 overflow-hidden px-6 p-4 ${styles.navWrapperDiv}`}>
        <GuideSidebar guide={guide} viewGuideHelper={viewGuideHelper} activeStep={activeStep} />
      </div>
      <div className="w-full flex flex-row overflow-scroll">
        <GuideStepperItem space={space} viewGuideHelper={viewGuideHelper} guide={guide} step={activeStep} />
      </div>

      <GuideEndRatingModal
        open={showEndRatingsModal}
        onClose={() => setShowEndRatingsModal(false)}
        skipGuideRating={skipGuideRating}
        setGuideRating={setGuideRating}
      />
    </div>
  );
};

export default Guide;
