/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { TeachersPanel } from './components/TeachersPanel';
import { SchedulePanel } from './components/SchedulePanel';
import { SpecialPanel } from './components/SpecialPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { SwapModal } from './components/SwapModal';
import { Download, FileDown, Printer } from 'lucide-react';
import { exportToExcel, exportToPDF } from './lib/exportUtils';
import { useAppStore } from './store/useAppStore';
import { generatePairs } from './lib/utils';
import { toast } from 'sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [swapData, setSwapData] = useState<{ teacherId: string; pairId: string } | null>(null);

  const { teachers, assignments, specialAssignments, history } = useAppStore();

  const handleExportExcel = () => {
    try {
      const pairs = generatePairs();
      exportToExcel(teachers, assignments, specialAssignments, pairs, history);
      toast.success('Đã xuất báo cáo Excel');
    } catch (e) {
      toast.error('Lỗi khi xuất Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.info('Đang tạo PDF, vui lòng đợi...');
      // export-dashboard-target is the ID of the main content wrapper inside Layout.tsx
      await exportToPDF('export-dashboard-target');
      toast.success('Đã xuất báo cáo PDF');
    } catch (e) {
      toast.error('Lỗi khi xuất PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Trường Mường Men</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Phần mềm quản lý phân công lịch tưới cây tự động</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportExcel}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium border border-slate-200 dark:border-slate-700"
          >
            <Download size={18} /> Excel
          </button>
          <button 
            onClick={handleExportPDF}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium border border-slate-200 dark:border-slate-700"
          >
            <FileDown size={18} /> PDF
          </button>
          <button 
            onClick={handlePrint}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium border border-slate-200 dark:border-slate-700"
          >
            <Printer size={18} /> In
          </button>
        </div>
      </div>

      <div className="pb-20">
        {activeTab === 'teachers' && <TeachersPanel />}
        {activeTab === 'schedule' && (
          <SchedulePanel 
            onSwapRequest={(teacherId, pairId) => setSwapData({ teacherId, pairId })} 
          />
        )}
        {activeTab === 'special' && <SpecialPanel />}
        {activeTab === 'history' && <HistoryPanel />}
      </div>

      {swapData && (
        <SwapModal 
          teacherId={swapData.teacherId} 
          currentPairId={swapData.pairId} 
          onClose={() => setSwapData(null)} 
        />
      )}
    </Layout>
  );
}
