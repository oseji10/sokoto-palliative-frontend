'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';



import Diseases from '@/app/(DashboardLayout)/components/tables/Diseases';


const SamplePage = () => {
  return (
    <PageContainer title="Diseases" description="List of all diseases">
      <DashboardCard >
        <Diseases/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

