import { ChatRoom, Message } from '../../domain/entities';
import { firestore } from '../firebase/firebaseConfig';

export const chatRepository = {
  async getRooms(userId: string): Promise<ChatRoom[]> {
    const snapshot = await firestore()
      .collection('chat_rooms')
      .where('participantIds', 'array-contains', userId)
      .get();
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as ChatRoom))
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
  },

  async sendMessage(
    chatRoomId: string,
    senderId: string,
    senderName: string,
    text: string,
  ): Promise<void> {
    await firestore()
      .collection('chat_rooms')
      .doc(chatRoomId)
      .collection('messages')
      .add({
        senderId,
        senderName,
        text,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
  },

  subscribeToMessages(
    chatRoomId: string,
    callback: (messages: Message[]) => void,
  ): () => void {
    return firestore()
      .collection('chat_rooms')
      .doc(chatRoomId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot((snapshot) => {
        const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message));
        callback(messages);
      });
  },
};
