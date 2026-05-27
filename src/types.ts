export interface Teacher {
  id: string;
  fullName: string;
  shortName: string;
}

export interface DayPair {
  id: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  display: string; // e.g., 01/06 - 02/06
}

export interface ScheduleAssignment {
  pairId: string;
  teacherId: string;
  changed?: boolean;
}

export interface SpecialAssignment {
  id: string;
  date: string; // YYYY-MM-DD
  teacherId: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  teacherId: string;
  oldSchedule: string;
  newSchedule: string;
  reason: string;
}

export interface AppState {
  teachers: Teacher[];
  assignments: ScheduleAssignment[];
  specialAssignments: SpecialAssignment[];
  history: HistoryEntry[];
  isAdmin: boolean;
  theme: 'light' | 'dark';
}

export type StoreState = AppState & {
  setTeachers: (teachers: Teacher[]) => void;
  addTeacher: (fullName: string) => void;
  updateTeacher: (id: string, fullName: string) => void;
  removeTeacher: (id: string) => void;
  
  assignSchedule: (assignments: ScheduleAssignment[]) => void;
  clearAssignments: () => void;
  
  swapSchedule: (
    teacher1Id: string, 
    teacher2Id: string, 
    reason: string
  ) => void;
  changeSchedule: (
    teacherId: string, 
    newPairId: string, 
    reason: string
  ) => void;
  
  setSpecialAssignments: (assignments: SpecialAssignment[]) => void;
  addSpecialAssignment: (date: string, teacherId: string) => void;
  removeSpecialAssignment: (id: string) => void;

  toggleRole: () => void;
  toggleTheme: () => void;
  resetData: () => void;
};
