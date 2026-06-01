import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarStackParamList } from '../navigation/CalendarStack';
import { useAuthStore } from '../../application/stores/authStore';
import { useScheduleStore } from '../../application/stores/scheduleStore';
import { useFriendStore } from '../../application/stores/friendStore';
import { computeMarkedDates, getSchedulesForDate } from '../../domain/services/scheduleService';
import { Schedule, User } from '../../domain/entities';

type Props = NativeStackScreenProps<CalendarStackParamList, 'CalendarMain'>;

const TODAY = new Date().toISOString().split('T')[0];

export default function CalendarScreen({ navigation }: Props) {
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const { user, signOut } = useAuthStore();
  const { schedules, loading: scheduleLoading, loadSchedules, removeSchedule } = useScheduleStore();
  const { friends, availability, loadFriends, loadAvailability } = useFriendStore();

  useEffect(() => {
    if (user) {
      loadSchedules(user.id);
      loadFriends(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (friends.length > 0) {
      loadAvailability(friends.map((f) => f.id), selectedDate);
    }
  }, [friends, selectedDate]);

  const baseMarked = computeMarkedDates(schedules);
  const markedDates = {
    ...baseMarked,
    [selectedDate]: {
      ...baseMarked[selectedDate],
      selected: true,
      selectedColor: '#4A90E2',
    },
  };

  const daySchedules = getSchedulesForDate(schedules, selectedDate);

  const handleDelete = (schedule: Schedule) => {
    Alert.alert('일정 삭제', `'${schedule.title}'을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => removeSchedule(schedule.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{user?.displayName ?? ''}님의 캘린더</Text>
        <TouchableOpacity onPress={signOut} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 캘린더 */}
        <Calendar
          current={TODAY}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          theme={{
            todayTextColor: '#4A90E2',
            selectedDayBackgroundColor: '#4A90E2',
            dotColor: '#4A90E2',
            arrowColor: '#4A90E2',
            textMonthFontWeight: '700',
            textDayFontSize: 14,
          }}
        />

        {/* 내 일정 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>{formatDateLabel(selectedDate)}</Text>
          {scheduleLoading ? (
            <ActivityIndicator color="#4A90E2" style={styles.spinner} />
          ) : daySchedules.length === 0 ? (
            <Text style={styles.empty}>이 날은 내 일정이 없어요</Text>
          ) : (
            daySchedules.map((item) => (
              <ScheduleRow key={item.id} schedule={item} onDelete={() => handleDelete(item)} />
            ))
          )}
        </View>

        {/* 친구 가용 현황 */}
        {friends.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>친구 현황</Text>
              <TouchableOpacity
                style={styles.inviteBtn}
                onPress={() => navigation.navigate('Invite', { date: selectedDate })}
              >
                <Text style={styles.inviteBtnText}>모임 잡기</Text>
              </TouchableOpacity>
            </View>
            {friends.map((friend) => (
              <FriendAvailabilityRow
                key={friend.id}
                friend={friend}
                status={availability[friend.id]}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* 일정 추가 FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ScheduleForm')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function ScheduleRow({ schedule, onDelete }: { schedule: Schedule; onDelete: () => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.dot} />
      <Text style={styles.rowTitle}>{schedule.title}</Text>
      {schedule.isRecurring && <Text style={styles.badge}>반복</Text>}
      <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
        <Text style={styles.deleteBtn}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

function FriendAvailabilityRow({
  friend,
  status,
}: {
  friend: User;
  status: 'busy' | 'free' | undefined;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.statusDot, status === 'busy' ? styles.statusBusy : styles.statusFree]} />
      <Text style={styles.rowTitle}>{friend.displayName}</Text>
      <Text style={[styles.statusLabel, status === 'busy' ? styles.statusLabelBusy : styles.statusLabelFree]}>
        {status === 'busy' ? '바쁨' : status === 'free' ? '한가함' : '—'}
      </Text>
    </View>
  );
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  inviteBtn: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  inviteBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  greeting: { fontSize: 16, fontWeight: '700', color: '#222' },
  logoutText: { fontSize: 13, color: '#aaa' },
  scrollContent: { paddingBottom: 100 },
  section: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 12 },
  spinner: { marginTop: 16 },
  empty: { color: '#bbb', textAlign: 'center', paddingVertical: 16, fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4A90E2', marginRight: 12 },
  rowTitle: { flex: 1, fontSize: 15, color: '#333' },
  badge: {
    fontSize: 11,
    color: '#4A90E2',
    borderWidth: 1,
    borderColor: '#4A90E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 10,
  },
  deleteBtn: { fontSize: 14, color: '#ccc' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  statusFree: { backgroundColor: '#34C759' },
  statusBusy: { backgroundColor: '#FF3B30' },
  statusLabel: { fontSize: 13, fontWeight: '600' },
  statusLabelFree: { color: '#34C759' },
  statusLabelBusy: { color: '#FF3B30' },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  fabIcon: { fontSize: 28, color: '#fff', lineHeight: 32 },
});
