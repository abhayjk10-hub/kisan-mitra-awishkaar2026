'use client';

import PageContainer from '@/components/shared/PageContainer';
import GovernmentProcurementSection from '@/components/farmer/GovernmentProcurementSection';

export default function ProcurementPage() {
  return (
    <PageContainer>
      <div className="py-6 sm:py-8 max-w-6xl mx-auto">
        <GovernmentProcurementSection />
      </div>
    </PageContainer>
  );
}

