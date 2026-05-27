import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { generatePairs, shuffleArray } from '../lib/utils';
import { CalendarDays, Shuffle, RotateCcw, AlertTriangle, ArrowRightLeft, Users, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function SchedulePanel({ 
  onSwapRequest 
}: { 
  onSwapRequest: (teacherId: string, pairId: string) => void 
}) {
  const { teachers, assignments, assignSchedule, clearAssignments, isAdmin } = useAppStore();
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const pairs = generatePairs();

  const assignedTeacherIds = assignments.map(a => a.teacherId);
  const unassignedTeachers = teachers.filter(t => !assignedTeacherIds.includes(t.id));
  
  const assignedPairIds = assignments.map(a => a.pairId);
  const availablePairs = pairs.filter(p => !assignedPairIds.includes(p.id));

  const handleRandomize = async () => {
    if (!isAdmin) return toast.error('Chỉ admin mới được thao tác');
    if (unassignedTeachers.length === 0) return toast.info('Tất cả giáo viên đã có lịch');
    if (availablePairs.length === 0) return toast.error('Không còn ngày trống để phân công');

    setIsRandomizing(true);
    setProgress(0);

    // AI Fisher-Yates shuffle
    const shuffledTeachers = shuffleArray(unassignedTeachers);
    const shuffledPairs = shuffleArray(availablePairs);

    const matchCount = Math.min(shuffledTeachers.length, shuffledPairs.length);
    const newAssignments: any[] = [];

    // Simulate animation delay for better UX
    for (let i = 0; i < matchCount; i++) {
        await new Promise(r => setTimeout(r, 100)); // 100ms per assignment for visual effect
        newAssignments.push({
            pairId: shuffledPairs[i].id,
            teacherId: shuffledTeachers[i].id,
            changed: false
        });
        setProgress(Math.round(((i + 1) / matchCount) * 100));
    }

    assignSchedule(newAssignments);
    setIsRandomizing(false);

    toast.success('Đã phân công toàn bộ lịch trực thành công!', {
      description: `Đã phân công: ${matchCount} GV. Còn lại trống: ${availablePairs.length - matchCount} cặp ngày.`,
      duration: 5000
    });

    if (shuffledTeachers.length > shuffledPairs.length) {
      toast.warning('Không đủ cặp ngày để phân công toàn bộ giáo viên!');
    }
  };

  const handleReset = () => {
    if (!isAdmin) return;
    if (confirm('Bạn có chắc chắn muốn xóa TẤT CẢ phân công lịch chính? Thao tác này không thể hoàn tác.')) {
        clearAssignments();
        toast.success('Đã xóa toàn bộ lịch trực');
    }
  };

  const completedRatio = teachers.length > 0 ? assignments.length / teachers.length : 0;
  const isCompleted = teachers.length > 0 && unassignedTeachers.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Lịch trực chính
            {isCompleted && (
              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 px-2 py-1 rounded font-bold uppercase">
                Hoàn thành
              </span>
            )}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Thời gian: 01/06 - 31/07 (Khung giờ: 08:00 - 09:00)</p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <button 
              onClick={handleReset}
              disabled={isRandomizing || assignments.length === 0}
              className="flex items-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 px-4 py-2 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={18} />
              Reset
            </button>
            <button 
              onClick={handleRandomize}
              disabled={isRandomizing || unassignedTeachers.length === 0 || availablePairs.length === 0}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isRandomizing ? <RefreshCw size={18} className="animate-spin" /> : <Shuffle size={18} />}
              Random Toàn Bộ
            </button>
          </div>
        )}
      </div>

      {unassignedTeachers.length > 0 && teachers.length > 0 && unassignedTeachers.length > availablePairs.length && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3 text-amber-800 dark:text-amber-400">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Cảnh báo thiếu ngày</h4>
            <p className="text-sm">Có {unassignedTeachers.length} giáo viên chưa có lịch nhưng chỉ còn {availablePairs.length} cặp ngày khả dụng.</p>
          </div>
        </div>
      )}

      {/* Stats & Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Giáo viên</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{teachers.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Đã phân công</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{assignments.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Chưa phân công</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{unassignedTeachers.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Ngày trống</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{availablePairs.length}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between text-sm mb-2 font-medium">
          <span className="text-slate-600 dark:text-slate-400">Tiến độ phân công</span>
          <span className="text-blue-600 dark:text-blue-400">{Math.round(completedRatio * 100)}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${isRandomizing ? progress : completedRatio * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Primary Generator Display */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {/* Month separation strategy maybe... simple list for now */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 min-h-[400px] overflow-auto">
          {pairs.map((pair) => {
            const assignment = assignments.find(a => a.pairId === pair.id);
            const teacher = assignment ? teachers.find(t => t.id === assignment.teacherId) : null;
            
            return (
              <motion.div 
                key={pair.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative p-4 rounded-xl border ${
                  teacher 
                    ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/50 shadow-sm' 
                    : 'bg-slate-100 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 border-dashed'
                } transition-all duration-300 hover:shadow-md`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <CalendarDays size={16} className="text-slate-400" />
                    {pair.display}
                  </div>
                  {assignment?.changed && (
                    <span title="Lịch đã được đổi" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <RefreshCw size={10} /> ĐổI
                    </span>
                  )}
                </div>

                {teacher ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{teacher.shortName}</span>
                    <span className="text-xs text-slate-400">{teacher.fullName}</span>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-700/50 w-max px-2 py-1 rounded">08:00 - 09:00</div>
                    
                    {isAdmin && (
                      <button 
                         onClick={() => onSwapRequest(teacher.id, pair.id)}
                         className="absolute bottom-3 right-3 p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                         title="Đổi lịch"
                      >
                         <ArrowRightLeft size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center">
                    <span className="text-sm text-slate-400 font-medium">Trống</span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
