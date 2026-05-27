import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Search, Upload, Plus, Trash2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export function TeachersPanel() {
  const { teachers, addTeacher, removeTeacher, setTeachers, isAdmin } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTeachers = teachers.filter(t => 
    t.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return toast.error('Chỉ admin mới được thêm giáo viên');
    if (newName.trim()) {
      addTeacher(newName.trim());
      setNewName('');
      toast.success('Đã thêm giáo viên');
    }
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
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws, { header: 1 });
        
        const newTeachers: string[] = [];
        // Start from row 1 (skip header if we assume first row is STT, Họ và tên)
        data.forEach((row, index) => {
          if (index === 0) return; // skip header
          const name = row[1]; // assuming second column is name
          if (name && typeof name === 'string') {
            newTeachers.push(name.trim());
          }
        });

        if (newTeachers.length > 0) {
          // Add them avoiding duplicates maybe? Or just replace/add.
          // Let's just add to existing or set new. Prompt says: "Cho phép upload file Excel danh sách giáo viên."
          // I will just add them.
          const currentNames = teachers.map(t => t.fullName);
          const toAdd = newTeachers.filter(n => !currentNames.includes(n));
          
          if (toAdd.length === 0) {
            toast.info('Không có giáo viên mới nào để thêm');
          } else {
             const allNames = [...currentNames, ...toAdd];
             // we need to set all with shortNames handled
             const updatedObjects = allNames.map((name, i) => ({
                 id: teachers[i]?.id || Math.random().toString(36).substring(2, 9),
                 fullName: name,
                 shortName: '' // store will handle this
             }));
             setTeachers(updatedObjects);
             toast.success(`Đã thêm ${toAdd.length} giáo viên từ Excel`);
          }
        }
      } catch (error) {
        toast.error('Lỗi khi đọc file Excel');
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Quản lý Giáo viên</h2>
          <p className="text-slate-500 dark:text-slate-400">Tổng số: {teachers.length} giáo viên</p>
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
              className="flex items-center gap-2 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-4 py-2 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
            >
              <FileSpreadsheet size={18} />
              Upload Excel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adds and Search */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Tìm kiếm</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Nhập tên giáo viên..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Thêm thủ công</h3>
              <form onSubmit={handleAdd} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Họ và tên..." 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-green-500/50"
                />
                <button 
                  type="submit"
                  disabled={!newName.trim()}
                  className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 dark:text-white">Danh sách</h3>
            <span className="text-sm text-slate-500 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded bg-white dark:bg-slate-800">
              {filteredTeachers.length} kết quả
            </span>
          </div>
          
          <div className="flex-1 overflow-auto p-2">
            {filteredTeachers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                <Users size={48} className="mb-4 opacity-50" />
                <p>Không tìm thấy giáo viên nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                {filteredTeachers.map((teacher, idx) => (
                  <div 
                    key={teacher.id} 
                    className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{teacher.fullName}</p>
                        <p className="text-xs text-slate-500">Tên hiển thị: {teacher.shortName}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa ${teacher.fullName}?`)) {
                            removeTeacher(teacher.id);
                            toast.success('Đã xóa giáo viên');
                          }
                        }}
                        className="text-red-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
