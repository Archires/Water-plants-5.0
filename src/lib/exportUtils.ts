import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToExcel = (teachers: any[], assignments: any[], specialAssignments: any[], pairs: any[], history: any[]) => {
  // 1. Teachers Sheet
  const teachersWS = XLSX.utils.json_to_sheet(teachers.map((t, i) => ({
    'STT': i + 1,
    'Họ và tên': t.fullName,
    'Tên hiển thị': t.shortName
  })));

  // 2. Main Schedule Sheet
  const scheduleData = pairs.map(p => {
    const matched = assignments.find(a => a.pairId === p.id);
    const teacher = matched ? teachers.find(t => t.id === matched.teacherId)?.fullName : 'Trống';
    return {
      'Ngày trực': p.display,
      'Khung giờ': '08:00 - 09:00',
      'Người trực': teacher || '',
      'Đã đổi lịch': matched?.changed ? 'Có' : ''
    };
  });
  const scheduleWS = XLSX.utils.json_to_sheet(scheduleData);

  // 3. Special Schedule Sheet
  const specialData = specialAssignments.map(sa => {
    const teacher = teachers.find(t => t.id === sa.teacherId)?.fullName;
    return {
      'Ngày trực': sa.date,
      'Khung giờ': '08:00 - 09:00',
      'Người trực': teacher || ''
    };
  });
  // Sort by date manually or use strings, ISO works fine sorting
  specialData.sort((a,b) => a['Ngày trực'].localeCompare(b['Ngày trực']));
  const specialWS = XLSX.utils.json_to_sheet(specialData);

  // 4. History Sheet
  const historyData = history.map(h => {
    const teacher = teachers.find(t => t.id === h.teacherId)?.fullName;
    return {
      'Thời gian': new Date(h.timestamp).toLocaleString(),
      'Giáo viên': teacher || '',
      'Lịch cũ': h.oldSchedule,
      'Lịch mới': h.newSchedule,
      'Lý do': h.reason
    };
  });
  const historyWS = XLSX.utils.json_to_sheet(historyData);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, teachersWS, 'Danh sách GV');
  XLSX.utils.book_append_sheet(wb, scheduleWS, 'Lịch trực');
  XLSX.utils.book_append_sheet(wb, specialWS, 'Lịch đặc biệt');
  XLSX.utils.book_append_sheet(wb, historyWS, 'Lịch sử đổi');

  XLSX.writeFile(wb, 'LichTruc_MuongMen.xlsx');
};

export const exportToPDF = async (targetId: string) => {
  const element = document.getElementById(targetId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    // A4 specs
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('LichTruc_MuongMen.pdf');
  } catch (err) {
    console.error('PDF Export Error:', err);
    throw err;
  }
};
