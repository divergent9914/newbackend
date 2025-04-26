import React from 'react';
import Layout from '@/components/Layout';
import GitHubLoader from '@/components/GitHubLoader';

const GitHubLoaderPage: React.FC = () => {
  return (
    <Layout>
      <div className="container py-8">
        <GitHubLoader />
      </div>
    </Layout>
  );
};

export default GitHubLoaderPage;