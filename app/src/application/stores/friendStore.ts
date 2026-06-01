import { create } from 'zustand';
import { User, FriendRequest } from '../../domain/entities';
import { friendRepository } from '../../data/repositories/friendRepository';
import { scheduleRepository } from '../../data/repositories/scheduleRepository';
import { getSchedulesForDate } from '../../domain/services/scheduleService';

interface FriendState {
  friends: User[];
  requests: FriendRequest[];
  availability: Record<string, 'busy' | 'free'>;
  loading: boolean;
  loadFriends: (userId: string) => Promise<void>;
  loadRequests: (userId: string) => Promise<void>;
  sendRequest: (from: User, toUserId: string) => Promise<void>;
  acceptRequest: (requestId: string, currentUser: User, req: FriendRequest) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  loadAvailability: (friendIds: string[], date: string) => Promise<void>;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  requests: [],
  availability: {},
  loading: false,

  loadFriends: async (userId) => {
    set({ loading: true });
    try {
      const friends = await friendRepository.getFriends(userId);
      set({ friends, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  loadRequests: async (userId) => {
    const requests = await friendRepository.getIncomingRequests(userId);
    set({ requests });
  },

  sendRequest: async (from, toUserId) => {
    await friendRepository.sendRequest(from, toUserId);
  },

  acceptRequest: async (requestId, currentUser, req) => {
    await friendRepository.acceptRequest(requestId, currentUser, {
      id: req.fromUserId,
      displayName: req.fromDisplayName,
      email: req.fromEmail,
    });
    set((state) => ({
      requests: state.requests.filter((r) => r.id !== requestId),
      friends: [
        ...state.friends,
        { id: req.fromUserId, displayName: req.fromDisplayName, email: req.fromEmail },
      ],
    }));
  },

  declineRequest: async (requestId) => {
    await friendRepository.declineRequest(requestId);
    set((state) => ({ requests: state.requests.filter((r) => r.id !== requestId) }));
  },

  loadAvailability: async (friendIds, date) => {
    if (friendIds.length === 0) {
      set({ availability: {} });
      return;
    }
    const allSchedules = await scheduleRepository.getByUserIds(friendIds);
    const availability: Record<string, 'busy' | 'free'> = {};
    for (const friendId of friendIds) {
      const friendSchedules = allSchedules.filter((s) => s.userId === friendId);
      availability[friendId] = getSchedulesForDate(friendSchedules, date).length > 0 ? 'busy' : 'free';
    }
    set({ availability });
  },
}));
