'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

import Ministries from '@/app/(DashboardLayout)/components/tables/Ministries';



const SamplePage = () => {
  return (
    <PageContainer title="Ministries" description="List of all ministries">
      <DashboardCard >
        {/* <Typography>All Nominees</Typography> */}
        {/* <NomineesTable/> */}
        <Ministries/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

