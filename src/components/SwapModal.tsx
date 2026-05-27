import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { generatePairs } from '../lib/utils';
import { X, ArrowRightLeft, MoveRight } from 'lucide-react';
import { toast } from 'sonner';

interface SwapModalProps {
  teacherId: string | null;
  currentPairId: string | null;
  onClose: () => void;
}

export function SwapModal({ teacherId, currentPairId, onClose }: SwapModalProps) {
  const { teachers, assignments, swapSchedule, changeSchedule } = useAppStore();
  const [mode, setMode] = useState<'swap' | 'move'>('swap');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');

  if (!teacherId || !currentPairId) return null;

  const currentTeacher = teachers.find(t => t.id === teacherId);
  const pairs = generatePairs();
  const currentPairDisplay = pairs.find(p => p.id === currentPairId)?.display;

  // For swap: find other assigned teachers
  const otherAssignedTeachers = assignments
    .filter(a => a.teacherId !== teacherId)
    .map(a => {
      const teacher = teachers.find(t => t.id === a.teacherId);
      const pair = pairs.find(p => p.id === a.pairId);
      return { teacher, pair };
    })
    .filter(x => x.teacher && x.pair);

  // For move: find empty pairs
  const assignedPairIds = assignments.map(a => a.pairId);
  const emptyPairs = pairs.filter(p => !assignedPairIds.includes(p.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error('Vui lòng nhập lý do thay đổi');
    if (!targetId) return toast.error('Vui lòng chọn mục tiêu thay đổi');

    if (mode === 'swap') {
      swapSchedule(teacherId, targetId, reason.trim());
      toast.success('Đã hoán đổi lịch trực thành công');
    } else {
      changeSchedule(teacherId, targetId, reason.trim());
      toast.success('Đã chuyển lịch trực thành công');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Đổi lịch trực</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 mb-1">Đang chọn giáo viên:</p>
            <p className="font-semibold text-slate-800 dark:text-white text-lg">{currentTeacher?.fullName}</p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Lịch hiện tại: {currentPairDisplay}</p>
          </div>

          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
            <button
              type="button"
              onClick={() => { setMode('swap'); setTargetId(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'swap' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <ArrowRightLeft size={16} /> Đổi với người khác
            </button>
            <button
              type="button"
              onClick={() => { setMode('move'); setTargetId(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'move' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <MoveRight size={16} /> Đổi sang ngày trống
            </button>
          </div>

          <div className="space-y-4">
            {mode === 'swap' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 gap-1 mb-1">
                  Chọn giáo viên để hoán đổi
                </label>
                <select 
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="">-- Chọn giáo viên --</option>
                  {otherAssignedTeachers.map(x => (
                    <option key={x.teacher!.id} value={x.teacher!.id}>
                      {x.teacher!.fullName} ({x.pair!.display})
                    </option>
                  ))}
                </select>
                {otherAssignedTeachers.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">Không có giáo viên nào khác đã được phân công để đổi.</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 gap-1 mb-1">
                  Chọn lịch trống mới
                </label>
                <select 
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="">-- Chọn ngày trống --</option>
                  {emptyPairs.map(p => (
                    <option key={p.id} value={p.id}>{p.display}</option>
                  ))}
                </select>
                {emptyPairs.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">Không còn ngày trống nào.</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 gap-1 mb-1">
                Lý do thay đổi <span className="text-red-500">*</span>
              </label>
              <textarea 
                required
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="VD: Nghỉ ốm, bận công tác..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 resize-none h-20"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit"
              disabled={!targetId || !reason.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Xác nhận đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
