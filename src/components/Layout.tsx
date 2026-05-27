import React from 'react';
import { Users, Calendar, AlertCircle, History, Settings, Sun, Moon, LogOut, Shield } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { Toaster } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { isAdmin, theme, toggleRole, toggleTheme } = useAppStore();

  const tabs = [
    { id: 'schedule', name: 'Lịch chính', icon: Calendar },
    { id: 'special', name: 'Đặc biệt (14-18/06)', icon: AlertCircle },
    { id: 'teachers', name: 'Giáo viên', icon: Users },
    { id: 'history', name: 'Lịch sử đổi', icon: History },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full shadow-sm z-10 transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-green-600 dark:text-green-500">Mường Men</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Hệ thống phân lịch trực</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto w-full">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400 font-semibold" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                )}
              >
                <Icon size={18} className={cn(isActive ? "text-green-500" : "")} />
                {tab.name}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-3">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              Giao diện
            </span>
            <span className="text-xs uppercase bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded font-bold">
              {theme === 'light' ? 'Tối' : 'Sáng'}
            </span>
          </button>
          <button 
            onClick={toggleRole}
            className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-3">
              <Shield size={18} className={isAdmin ? "text-blue-500" : "text-slate-400"} />
              Quyền hạn
            </span>
            <span className={cn(
              "text-xs uppercase px-2 py-0.5 rounded font-bold text-white",
              isAdmin ? "bg-blue-500" : "bg-slate-400"
            )}>
              {isAdmin ? 'Admin' : 'View'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col h-full bg-slate-50 dark:bg-[#0f172a]">
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full" id="export-dashboard-target">
          {children}
        </main>
      </div>
    </div>
  );
}
