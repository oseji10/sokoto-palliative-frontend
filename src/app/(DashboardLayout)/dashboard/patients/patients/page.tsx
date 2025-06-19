'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import Patients from '@/app/(DashboardLayout)/components/tables/Patients';


const SamplePage = () => {
  return (
    <PageContainer title="Patients" description="List of all patients">
      <DashboardCard >
        <Patients/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

