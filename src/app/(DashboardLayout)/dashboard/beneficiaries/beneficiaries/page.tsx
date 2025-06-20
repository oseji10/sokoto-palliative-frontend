'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import Beneficiaries from '@/app/(DashboardLayout)/components/tables/Beneficiaries';



const SamplePage = () => {
  return (
    <PageContainer title="Beneficiaries" description="List of all beneficiaries">
      <DashboardCard >
        {/* <Typography>All Nominees</Typography> */}
        {/* <NomineesTable/> */}
        <Beneficiaries/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

