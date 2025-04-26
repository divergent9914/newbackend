import React from 'react';
import Layout from '@/components/Layout';
import GitHubLoader from '@/components/GitHubLoader';

const GitHubLoaderPage: React.FC = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-darkest mb-2">GitHub Integration</h1>
        <p className="text-neutral-dark">
          Import and integrate external repositories into your microservices architecture
        </p>
      </div>
      <GitHubLoader />
    </Layout>
  );
};

export default GitHubLoaderPage;