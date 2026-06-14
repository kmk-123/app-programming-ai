import messaging from '@react-native-firebase/messaging';
import { firestore } from '../firebase/firebaseConfig';

export const notificationRepository = {
  async requestPermission(): Promise<boolean> {
    const status = await messaging().requestPermission();
    return (
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL
    );
  },

  async registerToken(userId: string): Promise<void> {
    const token = await messaging().getToken();
    await firestore()
      .collection('users')
      .doc(userId)
      .update({ fcmTokens: firestore.FieldValue.arrayUnion(token) });
  },

  async unregisterToken(userId: string): Promise<void> {
    const token = await messaging().getToken();
    await firestore()
      .collection('users')
      .doc(userId)
      .update({ fcmTokens: firestore.FieldValue.arrayRemove(token) });
  },

  onForegroundMessage(
    callback: (title: string, body: string) => void,
  ): () => void {
    return messaging().onMessage(async (msg) => {
      const title = msg.notification?.title ?? '';
      const body = msg.notification?.body ?? '';
      if (title || body) callback(title, body);
    });
  },

  setBackgroundMessageHandler(): void {
    messaging().setBackgroundMessageHandler(async () => {});
  },
};
