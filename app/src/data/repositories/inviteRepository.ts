import { Invite } from '../../domain/entities';
import { firestore } from '../firebase/firebaseConfig';
import { scheduleRepository } from './scheduleRepository';

export const inviteRepository = {
  async create(
    fromUserId: string,
    fromDisplayName: string,
    toUserIds: string[],
    date: string,
  ): Promise<Invite> {
    const data = {
      fromUserId,
      fromDisplayName,
      toUserIds,
      date,
      responses: {} as Record<string, { status: string; reason?: string }>,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    const ref = await firestore().collection('invites').add(data);
    return { id: ref.id, ...data } as Invite;
  },

  async getReceived(userId: string): Promise<Invite[]> {
    const snapshot = await firestore()
      .collection('invites')
      .where('toUserIds', 'array-contains', userId)
      .get();
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Invite))
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
  },

  async getSent(userId: string): Promise<Invite[]> {
    const snapshot = await firestore()
      .collection('invites')
      .where('fromUserId', '==', userId)
      .get();
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Invite))
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
  },

  async respond(
    inviteId: string,
    fromUserId: string,
    userId: string,
    userName: string,
    status: 'accepted' | 'declined' | 'deferred',
    reason?: string,
  ): Promise<string | null> {
    const entry: { status: string; displayName: string; reason?: string } = { status, displayName: userName };
    if (reason) entry.reason = reason;

    await firestore()
      .collection('invites')
      .doc(inviteId)
      .update({ [`responses.${userId}`]: entry });

    if (status === 'accepted') {
      return this._ensureChatRoom(inviteId, fromUserId, userId, userName);
    }
    return null;
  },

  async _ensureChatRoom(
    inviteId: string,
    fromUserId: string,
    acceptorId: string,
    acceptorName: string,
  ): Promise<string> {
    const inviteSnap = await firestore().collection('invites').doc(inviteId).get();
    const data = inviteSnap.data();
    const date = data?.date ?? '';

    if (data?.chatRoomId) {
      await firestore()
        .collection('chat_rooms')
        .doc(data.chatRoomId)
        .update({
          participantIds: firestore.FieldValue.arrayUnion(acceptorId),
          [`participantNames.${acceptorId}`]: acceptorName,
        });
      // 수락자 일정 추가
      await scheduleRepository.add({
        userId: acceptorId,
        title: '모임',
        isRecurring: false,
        date,
      });
      return data.chatRoomId;
    }

    const inviterSnap = await firestore().collection('users').doc(fromUserId).get();
    const inviterName = inviterSnap.data()?.displayName ?? '알 수 없음';

    const roomRef = await firestore().collection('chat_rooms').add({
      inviteId,
      participantIds: [fromUserId, acceptorId],
      participantNames: { [fromUserId]: inviterName, [acceptorId]: acceptorName },
      date,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    await firestore().collection('invites').doc(inviteId).update({ chatRoomId: roomRef.id });

    // 초대자 + 첫 번째 수락자 일정 동시 추가
    await Promise.all([
      scheduleRepository.add({ userId: fromUserId, title: '모임', isRecurring: false, date }),
      scheduleRepository.add({ userId: acceptorId, title: '모임', isRecurring: false, date }),
    ]);

    return roomRef.id;
  },
};
