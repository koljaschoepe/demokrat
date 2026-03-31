'use client';

import { CivicHexagon } from '@/components/impact/civic-hexagon';
import { ImpactStats } from '@/components/impact/impact-stats';
import { FeedbackLoop } from '@/components/impact/feedback-loop';
import { WahlkreisContribution } from '@/components/impact/wahlkreis-contribution';

export default function ImpactPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">Meine Wirkung</h1>
      <div className="flex flex-col gap-6">
        <CivicHexagon />
        <ImpactStats />
        <FeedbackLoop />
        <WahlkreisContribution />
      </div>
    </div>
  );
}
