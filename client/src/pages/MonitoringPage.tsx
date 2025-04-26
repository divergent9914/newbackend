import React from 'react';
import Layout from '@/components/Layout';
import ServiceMonitoring from '@/components/ServiceMonitoring';

const MonitoringPage: React.FC = () => {
  return (
    <Layout>
      <ServiceMonitoring />
    </Layout>
  );
};

export default MonitoringPage;
