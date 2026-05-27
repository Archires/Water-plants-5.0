import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoreState, Teacher, ScheduleAssignment, SpecialAssignment, HistoryEntry } from '../types';
import { generateId, generateShortNames } from '../lib/utils';
import { generatePairs } from '../lib/utils';

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => ({
      teachers: [],
      assignments: [],
      specialAssignments: [],
      history: [],
      isAdmin: true,
      theme: 'light',

      setTeachers: (teachersList) => {
        const fullNames = teachersList.map(t => t.fullName);
        const shortNames = generateShortNames(fullNames);
        const processed = teachersList.map((t, i) => ({
          ...t,
          shortName: shortNames[i]
        }));
        set({ teachers: processed });
      },

      addTeacher: (fullName) => {
        const newTeacher: Teacher = { id: generateId(), fullName, shortName: '' };
        const newTeachers = [...get().teachers, newTeacher];
        get().setTeachers(newTeachers);
      },

      updateTeacher: (id, fullName) => {
        const newTeachers = get().teachers.map(t => t.id === id ? { ...t, fullName } : t);
        get().setTeachers(newTeachers);
      },

      removeTeacher: (id) => {
        set({
          teachers: get().teachers.filter(t => t.id !== id),
          assignments: get().assignments.filter(a => a.teacherId !== id),
          specialAssignments: get().specialAssignments.filter(sa => sa.teacherId !== id)
        });
      },

      assignSchedule: (newAssignments) => {
        set({ 
          assignments: [...get().assignments, ...newAssignments] 
        });
      },

      clearAssignments: () => {
        set({ assignments: [], history: [] });
      },

      swapSchedule: (teacher1Id, teacher2Id, reason) => {
        const assignments = [...get().assignments];
        const a1Index = assignments.findIndex(a => a.teacherId === teacher1Id);
        const a2Index = assignments.findIndex(a => a.teacherId === teacher2Id);

        if (a1Index > -1 && a2Index > -1) {
          const a1 = { ...assignments[a1Index] };
          const a2 = { ...assignments[a2Index] };
          
          const t1 = get().teachers.find(t => t.id === teacher1Id);
          const t2 = get().teachers.find(t => t.id === teacher2Id);
          
          const pairs = generatePairs();
          const p1Display = pairs.find(p => p.id === a1.pairId)?.display || a1.pairId;
          const p2Display = pairs.find(p => p.id === a2.pairId)?.display || a2.pairId;

          // Perform swap
          assignments[a1Index].pairId = a2.pairId;
          assignments[a1Index].changed = true;
          
          assignments[a2Index].pairId = a1.pairId;
          assignments[a2Index].changed = true;

          const historyEntries: HistoryEntry[] = [
            {
              id: generateId(),
              timestamp: Date.now(),
              teacherId: teacher1Id,
              oldSchedule: p1Display,
              newSchedule: p2Display,
              reason: `Đổi với ${t2?.fullName}. Lý do: ${reason}`
            },
            {
              id: generateId(),
              timestamp: Date.now(),
              teacherId: teacher2Id,
              oldSchedule: p2Display,
              newSchedule: p1Display,
              reason: `Đổi với ${t1?.fullName}. Lý do: ${reason}`
            }
          ];

          set({ 
            assignments, 
            history: [...historyEntries, ...get().history]
          });
        }
      },

      changeSchedule: (teacherId, newPairId, reason) => {
        const assignments = [...get().assignments];
        const index = assignments.findIndex(a => a.teacherId === teacherId);
        
        if (index > -1) {
          const oldPairId = assignments[index].pairId;
          const pairs = generatePairs();
          const pOldDisplay = pairs.find(p => p.id === oldPairId)?.display || oldPairId;
          const pNewDisplay = pairs.find(p => p.id === newPairId)?.display || newPairId;

          assignments[index].pairId = newPairId;
          assignments[index].changed = true;

          const historyEntry: HistoryEntry = {
            id: generateId(),
            timestamp: Date.now(),
            teacherId: teacherId,
            oldSchedule: pOldDisplay,
            newSchedule: pNewDisplay,
            reason
          };

          set({
            assignments,
            history: [historyEntry, ...get().history]
          });
        }
      },

      setSpecialAssignments: (specialAssignments) => {
        set({ specialAssignments });
      },

      addSpecialAssignment: (date, teacherId) => {
        const newAssignment: SpecialAssignment = { id: generateId(), date, teacherId };
        set({ specialAssignments: [...get().specialAssignments, newAssignment] });
      },

      removeSpecialAssignment: (id) => {
        set({ specialAssignments: get().specialAssignments.filter(sa => sa.id !== id) });
      },

      toggleRole: () => set(state => ({ isAdmin: !state.isAdmin })),
      
      toggleTheme: () => set(state => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return { theme: newTheme };
      }),

      resetData: () => set({ 
        teachers: [], 
        assignments: [], 
        specialAssignments: [], 
        history: [] 
      }),
    }),
    {
      name: 'muong-men-schedule-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
    }
  )
);
