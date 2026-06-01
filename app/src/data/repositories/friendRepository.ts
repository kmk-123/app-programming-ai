import { User, FriendRequest } from '../../domain/entities';
import { firestore } from '../firebase/firebaseConfig';

export const friendRepository = {
  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const snapshot = await firestore()
      .collection('users')
      .where('email', '>=', q)
      .where('email', '<=', q + '')
      .limit(10)
      .get();
    return snapshot.docs
      .filter((doc) => doc.id !== currentUserId)
      .map((doc) => ({ id: doc.id, ...doc.data() } as User));
  },

  async sendRequest(from: User, toUserId: string): Promise<void> {
    const existing = await firestore()
      .collection('friend_requests')
      .where('fromUserId', '==', from.id)
      .where('toUserId', '==', toUserId)
      .where('status', '==', 'pending')
      .get();
    if (!existing.empty) return;

    await firestore().collection('friend_requests').add({
      fromUserId: from.id,
      fromDisplayName: from.displayName,
      fromEmail: from.email,
      toUserId,
      status: 'pending',
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  },

  async getIncomingRequests(userId: string): Promise<FriendRequest[]> {
    // Firestore 복합 인덱스: friend_requests (toUserId ASC, status ASC)
    const snapshot = await firestore()
      .collection('friend_requests')
      .where('toUserId', '==', userId)
      .where('status', '==', 'pending')
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FriendRequest));
  },

  async getSentRequestIds(fromUserId: string): Promise<string[]> {
    const snapshot = await firestore()
      .collection('friend_requests')
      .where('fromUserId', '==', fromUserId)
      .where('status', '==', 'pending')
      .get();
    return snapshot.docs.map((doc) => doc.data().toUserId as string);
  },

  async acceptRequest(
    requestId: string,
    currentUser: User,
    friend: Pick<User, 'id' | 'displayName' | 'email'>
  ): Promise<void> {
    const batch = firestore().batch();
    batch.update(firestore().collection('friend_requests').doc(requestId), {
      status: 'accepted',
    });
    batch.set(
      firestore().collection('users').doc(currentUser.id).collection('friends').doc(friend.id),
      { displayName: friend.displayName, email: friend.email }
    );
    batch.set(
      firestore().collection('users').doc(friend.id).collection('friends').doc(currentUser.id),
      { displayName: currentUser.displayName, email: currentUser.email }
    );
    await batch.commit();
  },

  async declineRequest(requestId: string): Promise<void> {
    await firestore()
      .collection('friend_requests')
      .doc(requestId)
      .update({ status: 'declined' });
  },

  async getFriends(userId: string): Promise<User[]> {
    const snapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('friends')
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
  },
};
