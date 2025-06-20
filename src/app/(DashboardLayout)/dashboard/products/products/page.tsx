'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

import Products from '@/app/(DashboardLayout)/components/tables/Products';



const SamplePage = () => {
  return (
    <PageContainer title="Products" description="List of all products">
      <DashboardCard >
        {/* <Typography>All Nominees</Typography> */}
        {/* <NomineesTable/> */}
        <Products/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

