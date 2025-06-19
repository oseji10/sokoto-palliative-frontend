'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

import ProductPerformance from '../../components/dashboard/ProductPerformance';

import PricelistProducts from '../../components/tables/PricelistProducts';
import RequestItems from '../../components/tables/RequestItems';


const SamplePage = () => {
  return (
    <PageContainer title="Drugs Prices" description="Prices for drugs">
      <DashboardCard >
        <RequestItems/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

