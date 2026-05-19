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
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted';
}

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'deferred';

export interface Invite {
  id: string;
  fromUserId: string;
  toUserIds: string[];
  date: string;
  responses: Record<string, { status: InviteStatus; reason?: string }>;
  chatRoomId?: string;
}
