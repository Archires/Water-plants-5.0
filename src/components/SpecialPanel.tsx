import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SPECIAL_DATES } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import { AlertCircle, Plus, Trash2, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export function SpecialPanel() {
  const { teachers, specialAssignments, addSpecialAssignment, removeSpecialAssignment, setSpecialAssignments, isAdmin } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(SPECIAL_DATES[0]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return toast.error('Chỉ admin mới được thao tác');
    if (!selectedTeacherId) return;

    // Check if teacher already has special assignment
    const alreadyAssigned = specialAssignments.find(sa => sa.teacherId === selectedTeacherId);
    if (alreadyAssigned) return toast.error('Giáo viên này đã có lịch trực đặc biệt');

    // Check if date already taken
    const dateTaken = specialAssignments.find(sa => sa.date === selectedDate);
    if (dateTaken) return toast.error('Ngày này đã có người trực');

    addSpecialAssignment(selectedDate, selectedTeacherId);
    setSelectedTeacherId('');
    toast.success('Đã xếp lịch trực đặc biệt');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return toast.error('Chỉ admin mới được upload file');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<any>(ws, { header: 1 });
        
        const newAssignments: { date: string, teacherId: string }[] = [];
        
        data.forEach((row, index) => {
          if (index === 0) return; // skip header (STT, Họ và tên, Ngày trực)
          const name = row[1];
          const dateStr = row[2]; // assuming format 14/06
          if (name && dateStr && typeof name === 'string' && typeof dateStr === 'string') {
             const teacher = teachers.find(t => t.fullName.toLowerCase() === name.toLowerCase().trim());
             // Parse date. E.g "14/06" -> "2026-06-14"
             const [day, month] = dateStr.split('/');
             if (day && month && teacher) {
                 const formattedDate = `2026-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                 if (SPECIAL_DATES.includes(formattedDate)) {
                     newAssignments.push({ date: formattedDate, teacherId: teacher.id });
                 }
             }
          }
        });

        if (newAssignments.length > 0) {
            // override or merge? requirements imply separate module 
            // merge taking care of duplicates
            const current = [...specialAssignments];
            let addedCount = 0;
            newAssignments.forEach(na => {
                if (!current.find(c => c.date === na.date) && !current.find(c => c.teacherId === na.teacherId)) {
                    current.push({
                        id: Math.random().toString(36).substring(2, 9),
                        date: na.date,
                        teacherId: na.teacherId
                    });
                    addedCount++;
                }
            });
            setSpecialAssignments(current);
            toast.success(`Đã thêm ${addedCount} lịch từ Excel`);
        } else {
            toast.warning('Không tìm thấy dữ liệu hợp lệ trong Excel (Cần đúng tên GV và định dạng ngày 14/06)');
        }
      } catch (error) {
        toast.error('Lỗi khi đọc file Excel');
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getTeacher = (id: string) => teachers.find(t => t.id === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Lịch Đặc Biệt <AlertCircle size={24} className="text-amber-500" />
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Các ngày loại khỏi lịch random tự động (14/06 - 18/06)</p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-4 py-2 rounded-lg font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
            >
              <FileSpreadsheet size={18} />
              Upload Excel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isAdmin && (
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Thêm thủ công</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ngày trực
                  </label>
                  <select 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
                  >
                    {SPECIAL_DATES.map(date => {
                      const isTaken = specialAssignments.some(sa => sa.date === date);
                      return (
                        <option key={date} value={date} disabled={isTaken}>
                          {format(parseISO(date), 'dd/MM/yyyy')} {isTaken ? '(Đã có)' : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Giáo viên
                  </label>
                  <select 
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">-- Chọn giáo viên --</option>
                    {teachers.map(t => {
                      const hasSpecial = specialAssignments.some(sa => sa.teacherId === t.id);
                      return (
                        <option key={t.id} value={t.id} disabled={hasSpecial}>
                          {t.fullName} {hasSpecial ? '(Đã phân)' : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={!selectedTeacherId || !selectedDate}
                  className="w-full bg-amber-500 text-white p-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors flex justify-center items-center gap-2 font-medium"
                >
                  <Plus size={18} /> Phân công
                </button>
              </form>
            </div>
          </div>
        )}

        <div className={`grid gap-4 ${isAdmin ? 'lg:col-span-2' : 'col-span-1 md:col-span-2 lg:col-span-3 lg:grid-cols-3'}`}>
          {SPECIAL_DATES.map(date => {
            const assignment = specialAssignments.find(sa => sa.date === date);
            const teacher = assignment ? getTeacher(assignment.teacherId) : null;
            
            return (
              <div 
                key={date}
                className={`p-6 rounded-xl border ${
                  teacher ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 border-dashed'
                } relative`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="font-bold text-lg text-slate-800 dark:text-white">
                    {format(parseISO(date), 'dd/MM/yyyy')}
                  </span>
                  {isAdmin && teacher && (
                    <button 
                      onClick={() => {
                        if (confirm('Xóa phân công này?')) {
                          removeSpecialAssignment(assignment!.id);
                          toast.success('Đã xóa');
                        }
                      }}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {teacher ? (
                  <div>
                    <p className="text-xl font-bold text-amber-700 dark:text-amber-500">{teacher.fullName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 bg-white/50 dark:bg-slate-900/50 inline-block px-2 py-1 rounded">08:00 - 09:00</p>
                  </div>
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 italic mt-4">Chưa phân công</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
