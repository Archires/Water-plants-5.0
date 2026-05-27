import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import { Clock, ArrowRight } from 'lucide-react';

export function HistoryPanel() {
  const { history, teachers } = useAppStore();

  const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.fullName || 'Không rõ';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Lịch sử thay đổi</h2>
          <p className="text-slate-500 dark:text-slate-400">Xem lại các thay đổi cập nhật do Admin thực hiện</p>
        </div>
        <div className="text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300">
          Tổng cộng: <strong>{history.length}</strong> thay đổi
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 flex flex-col items-center">
          <Clock size={48} className="mb-4 opacity-30" />
          <p>Chưa có lịch sử thay đổi nào.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm">
                  <th className="py-3 px-4 font-semibold">Thời gian</th>
                  <th className="py-3 px-4 font-semibold">Giáo viên</th>
                  <th className="py-3 px-4 font-semibold text-center">Thay đổi</th>
                  <th className="py-3 px-4 font-semibold">Lý do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {format(new Date(entry.timestamp), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {getTeacherName(entry.teacherId)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-600 dark:text-slate-400 line-through decoration-red-400">
                          {entry.oldSchedule}
                        </span>
                        <ArrowRight size={14} className="text-slate-400" />
                        <span className="bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-blue-600 dark:text-blue-400 font-medium border border-blue-100 dark:border-blue-800/50">
                          {entry.newSchedule}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate" title={entry.reason}>
                      {entry.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
