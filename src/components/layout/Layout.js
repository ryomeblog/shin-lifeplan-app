import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 pt-[60px]">{children}</main>
    </div>
  );
};

export default Layout;
