'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

import Drugs from '@/app/(DashboardLayout)/components/tables/Drugs';


const SamplePage = () => {
  return (
    <PageContainer title="Diseases" description="List of all diseases">
      <DashboardCard >
        <Drugs/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

