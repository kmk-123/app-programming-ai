import { create } from 'zustand';
import { Schedule } from '../../domain/entities';
import { scheduleRepository } from '../../data/repositories/scheduleRepository';

interface ScheduleState {
  schedules: Schedule[];
  loading: boolean;
  loadSchedules: (userId: string) => Promise<void>;
  addSchedule: (schedule: Omit<Schedule, 'id'>) => Promise<void>;
  removeSchedule: (id: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],
  loading: false,

  loadSchedules: async (userId) => {
    set({ loading: true });
    try {
      const schedules = await scheduleRepository.getByUserId(userId);
      set({ schedules, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addSchedule: async (schedule) => {
    const added = await scheduleRepository.add(schedule);
    set((state) => ({ schedules: [...state.schedules, added] }));
  },

  removeSchedule: async (id) => {
    await scheduleRepository.remove(id);
    set((state) => ({ schedules: state.schedules.filter((s) => s.id !== id) }));
  },
}));
