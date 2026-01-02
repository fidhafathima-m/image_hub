import React, { ReactNode } from 'react';
import Header from './Header';
import { Toaster } from 'react-hot-toast';
import { LayoutProps } from '../../types';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
      
      {/* Optional Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-primary-700 font-bold">Image Hub</span>
              <span className="text-gray-500 text-sm">© {new Date().getFullYear()}</span>
            </div>
            <div className="text-gray-600 text-sm">
              <p>Upload, manage, and organize your images effortlessly</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '8px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default Layout;

export const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Dashboard Menu</h3>
              <nav className="space-y-2">
                <a href="/dashboard" className="block p-2 rounded hover:bg-gray-100">Overview</a>
                <a href="/dashboard/images" className="block p-2 rounded hover:bg-gray-100">My Images</a>
                <a href="/dashboard/upload" className="block p-2 rounded hover:bg-gray-100">Upload</a>
                <a href="/dashboard/settings" className="block p-2 rounded hover:bg-gray-100">Settings</a>
              </nav>
            </div>
          </aside>
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};