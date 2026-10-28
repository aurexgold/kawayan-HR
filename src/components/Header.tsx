import { Bell, Search, Menu } from 'lucide-react';

export function Header({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center text-slate-500 max-w-sm w-full">
        <button className="lg:hidden text-slate-500 hover:text-slate-700 mr-4 shrink-0" onClick={onOpenSidebar}>
          <Menu className="w-5 h-5" />
        </button>
        <Search className="w-4 h-4 mr-2 shrink-0 hidden sm:block" />
        <input 
          type="text" 
          placeholder="Search employees, payroll..." 
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 hidden sm:block"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-slate-600 relative mr-2">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-white pointer-events-none"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm shrink-0">
          AD
        </div>
      </div>
    </header>
  );
}
