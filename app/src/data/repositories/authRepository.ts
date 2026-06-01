import { User } from '../../domain/entities';
import { auth, firestore } from '../firebase/firebaseConfig';

export const authRepository = {
  async signUp(email: string, password: string, displayName: string): Promise<User> {
    const { user } = await auth().createUserWithEmailAndPassword(email, password);
    await user.updateProfile({ displayName });
    await firestore().collection('users').doc(user.uid).set({
      email,
      displayName,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return { id: user.uid, email, displayName };
  },

  async signIn(email: string, password: string): Promise<User> {
    const { user } = await auth().signInWithEmailAndPassword(email, password);
    return {
      id: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? '',
    };
  },

  async signOut(): Promise<void> {
    await auth().signOut();
  },

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return auth().onAuthStateChanged((fbUser) => {
      if (fbUser) {
        callback({
          id: fbUser.uid,
          email: fbUser.email ?? '',
          displayName: fbUser.displayName ?? '',
        });
      } else {
        callback(null);
      }
    });
  },
};
