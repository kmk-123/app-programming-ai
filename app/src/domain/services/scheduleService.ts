import { Schedule } from '../entities';

type MarkedDates = Record<string, { marked: boolean; dotColor: string }>;

export function computeMarkedDates(schedules: Schedule[]): MarkedDates {
  const result: MarkedDates = {};

  // 일회성 스케줄 — 날짜 직접 마킹
  schedules
    .filter((s) => !s.isRecurring && s.date)
    .forEach((s) => {
      result[s.date!] = { marked: true, dotColor: '#4A90E2' };
    });

  // 고정 스케줄 — 전후 1년 범위로 요일 확장
  const recurring = schedules.filter((s) => s.isRecurring && s.daysOfWeek?.length);
  if (recurring.length > 0) {
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    start.setDate(1);
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay();
      if (recurring.some((s) => s.daysOfWeek!.includes(dow))) {
        const dateStr = d.toISOString().split('T')[0];
        result[dateStr] = { marked: true, dotColor: '#4A90E2' };
      }
    }
  }

  return result;
}

export function getSchedulesForDate(schedules: Schedule[], dateStr: string): Schedule[] {
  const dow = new Date(dateStr).getDay();
  return schedules.filter((s) => {
    if (s.isRecurring && s.daysOfWeek?.includes(dow)) return true;
    if (!s.isRecurring && s.date === dateStr) return true;
    return false;
  });
}
