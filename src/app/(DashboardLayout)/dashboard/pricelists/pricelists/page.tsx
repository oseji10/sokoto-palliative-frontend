'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

import Pricelists from '@/app/(DashboardLayout)/components/tables/Pricelist';


const SamplePage = () => {
  return (
    <PageContainer title="Diseases" description="List of all diseases">
      <DashboardCard >
        <Pricelists/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

