export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface Schedule {
  id: string;
  userId: string;
  title: string;
  isRecurring: boolean;
  daysOfWeek?: number[]; // 0=Sun~6=Sat, 고정 스케줄
  date?: string;         // 'YYYY-MM-DD', 일회성 스케줄
  startTime?: string;    // 'HH:MM'
  endTime?: string;      // 'HH:MM'
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted';
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromDisplayName: string;
  fromEmail: string;
  toUserId: string;
}

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'deferred';

export interface Invite {
  id: string;
  fromUserId: string;
  fromDisplayName: string;
  toUserIds: string[];
  date: string;
  responses: Record<string, { status: InviteStatus; reason?: string; displayName?: string }>;
  chatRoomId?: string;
  createdAt?: any;
}

export interface ChatRoom {
  id: string;
  inviteId: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  date: string;
  createdAt?: any;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt?: any;
}
