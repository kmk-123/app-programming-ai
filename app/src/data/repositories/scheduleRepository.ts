import { Schedule } from '../../domain/entities';
import { firestore } from '../firebase/firebaseConfig';

export const scheduleRepository = {
  async getByUserId(userId: string): Promise<Schedule[]> {
    const snapshot = await firestore()
      .collection('schedules')
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Schedule));
  },

  async add(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
    const ref = await firestore().collection('schedules').add(schedule);
    return { id: ref.id, ...schedule };
  },

  async remove(id: string): Promise<void> {
    await firestore().collection('schedules').doc(id).delete();
  },

  async getByUserIds(userIds: string[]): Promise<Schedule[]> {
    if (userIds.length === 0) return [];
    const all: Schedule[] = [];
    for (let i = 0; i < userIds.length; i += 30) {
      const chunk = userIds.slice(i, i + 30);
      const snapshot = await firestore()
        .collection('schedules')
        .where('userId', 'in', chunk)
        .get();
      snapshot.docs.forEach((doc) => all.push({ id: doc.id, ...doc.data() } as Schedule));
    }
    return all;
  },
};
