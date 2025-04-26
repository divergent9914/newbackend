import React from 'react';
import Layout from '@/components/Layout';
import SystemOverview from '@/components/SystemOverview';
import ApiGateway from '@/components/ApiGateway';
import Microservices from '@/components/Microservices';
import OndcIntegration from '@/components/OndcIntegration';
import ServiceMonitoring from '@/components/ServiceMonitoring';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <SystemOverview />
      <ApiGateway />
      <Microservices />
      <OndcIntegration />
      <ServiceMonitoring />
    </Layout>
  );
};

export default Dashboard;
