import { create } from 'zustand';
import { ChatRoom, Message } from '../../domain/entities';
import { chatRepository } from '../../data/repositories/chatRepository';

interface ChatState {
  rooms: ChatRoom[];
  messages: Message[];
  loadRooms: (userId: string) => Promise<void>;
  subscribeMessages: (chatRoomId: string) => () => void;
  sendMessage: (chatRoomId: string, senderId: string, senderName: string, text: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  messages: [],

  loadRooms: async (userId) => {
    const rooms = await chatRepository.getRooms(userId);
    set({ rooms });
  },

  subscribeMessages: (chatRoomId) => {
    return chatRepository.subscribeToMessages(chatRoomId, (messages) => {
      set({ messages });
    });
  },

  sendMessage: async (chatRoomId, senderId, senderName, text) => {
    await chatRepository.sendMessage(chatRoomId, senderId, senderName, text);
  },

  clearMessages: () => set({ messages: [] }),
}));
