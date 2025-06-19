'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import Enrollees from '@/app/(DashboardLayout)/components/tables/Enrollees';



const SamplePage = () => {
  return (
    <PageContainer title="Hospitals" description="List of all hospitals">
      <DashboardCard >
        {/* <Typography>All Nominees</Typography> */}
        {/* <NomineesTable/> */}
        <Enrollees/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

