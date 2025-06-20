'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import Cadres from '@/app/(DashboardLayout)/components/tables/Cadres';



const SamplePage = () => {
  return (
    <PageContainer title="Cadres" description="List of all cadres">
      <DashboardCard >
        {/* <Typography>All Nominees</Typography> */}
        {/* <NomineesTable/> */}
        <Cadres/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

