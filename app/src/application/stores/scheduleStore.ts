import { create } from 'zustand';
import { Schedule } from '../../domain/entities';

interface ScheduleState {
  schedules: Schedule[];
  setSchedules: (schedules: Schedule[]) => void;
  addSchedule: (schedule: Schedule) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedules: [],
  setSchedules: (schedules) => set({ schedules }),
  addSchedule: (schedule) =>
    set((state) => ({ schedules: [...state.schedules, schedule] })),
}));
