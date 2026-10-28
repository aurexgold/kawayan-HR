import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 flex flex-col flex-1 w-full min-w-0">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-8 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
