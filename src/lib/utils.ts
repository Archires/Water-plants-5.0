import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, eachDayOfInterval, isBefore, isEqual, isAfter, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fisher-Yates Shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const SPECIAL_DATES = [
  "2026-06-14",
  "2026-06-15",
  "2026-06-16",
  "2026-06-17",
  "2026-06-18"
];

// Generate regular day pairs
export function generatePairs(): { id: string; start: string; end: string; display: string }[] {
  const startDate = new Date(2026, 5, 1); // 01/06/2026
  const endDate = new Date(2026, 6, 31); // 31/07/2026

  const allDays = eachDayOfInterval({ start: startDate, end: endDate }).map(d => format(d, 'yyyy-MM-dd'));
  const validDays = allDays.filter(d => !SPECIAL_DATES.includes(d));

  const pairs: { id: string; start: string; end: string; display: string }[] = [];
  
  for (let i = 0; i < validDays.length - 1; i += 2) {
    const start = validDays[i];
    const end = validDays[i + 1];
    
    // Check if they are actually consecutive days 
    // Wait, requirement: "loại bỏ ngày 14->18. Chia thành các cặp ngày liên tiếp."
    // If we use 13/06 and 19/06 as a pair, they are not consecutive.
    // The prompt says: "Sau ngày 13 sẽ tiếp tục: 19/06 - 20/06."
    // This implies 13/06 is skipped because it has no consecutive partner before the gap.
    // Let's implement that logic: if next day is not literally tomorrow, skip to next pair.
    
    const d1 = parseISO(start);
    const d2 = parseISO(end);
    
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 1) {
      pairs.push({
        id: `${start}_${end}`,
        start,
        end,
        display: `${format(d1, 'dd/MM')} - ${format(d2, 'dd/MM')}`
      });
    } else {
      // Not consecutive (e.g. 13/06 and 19/06).
      // We should back up index by 1 so 19/06 can pair with 20/06
      i -= 1;
    }
  }

  return pairs;
}

export function generateShortNames(fullNames: string[]): string[] {
  const shortNames: string[] = [];
  const nameCounts = new Map<string, number>();

  fullNames.forEach(name => {
    const parts = name.trim().split(" ");
    const last = parts[parts.length - 1] || "";
    nameCounts.set(last, (nameCounts.get(last) || 0) + 1);
  });

  fullNames.forEach(name => {
    const parts = name.trim().split(" ");
    const last = parts[parts.length - 1] || "";
    
    if ((nameCounts.get(last) || 0) > 1) {
      // duplicate last name, use first name/surname + last name
      const first = parts.length > 1 ? parts[0] : "";
      shortNames.push(first ? `${first} ${last}` : last);
    } else {
      shortNames.push(last);
    }
  });

  return shortNames;
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}
