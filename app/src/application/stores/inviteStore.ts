import { create } from 'zustand';
import { Invite, InviteStatus } from '../../domain/entities';
import { inviteRepository } from '../../data/repositories/inviteRepository';

interface InviteState {
  received: Invite[];
  loading: boolean;
  loadReceived: (userId: string) => Promise<void>;
  sendInvite: (
    fromUserId: string,
    fromDisplayName: string,
    toUserIds: string[],
    date: string,
  ) => Promise<void>;
  respond: (
    invite: Invite,
    userId: string,
    userName: string,
    status: 'accepted' | 'declined' | 'deferred',
    reason?: string,
  ) => Promise<string | null>;
}

export const useInviteStore = create<InviteState>((set) => ({
  received: [],
  loading: false,

  loadReceived: async (userId) => {
    set({ loading: true });
    try {
      const received = await inviteRepository.getReceived(userId);
      set({ received, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  sendInvite: async (fromUserId, fromDisplayName, toUserIds, date) => {
    await inviteRepository.create(fromUserId, fromDisplayName, toUserIds, date);
  },

  respond: async (invite, userId, userName, status, reason) => {
    const chatRoomId = await inviteRepository.respond(
      invite.id,
      invite.fromUserId,
      userId,
      userName,
      status,
      reason,
    );
    set((state) => ({
      received: state.received.map((inv) =>
        inv.id === invite.id
          ? {
              ...inv,
              responses: { ...inv.responses, [userId]: { status: status as InviteStatus, reason } },
              ...(chatRoomId ? { chatRoomId } : {}),
            }
          : inv,
      ),
    }));
    return chatRoomId;
  },
}));
