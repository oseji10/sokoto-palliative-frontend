'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

import Requests from '@/app/(DashboardLayout)/components/tables/Request';


const SamplePage = () => {
  return (
    <PageContainer title="Diseases" description="List of all diseases">
      <DashboardCard >
        <Requests/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

