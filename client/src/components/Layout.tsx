import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-[#F5F7FA]">
        <Header />
        <main className="px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
