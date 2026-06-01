import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarStackParamList } from '../navigation/CalendarStack';
import { useAuthStore } from '../../application/stores/authStore';
import { useFriendStore } from '../../application/stores/friendStore';
import { useInviteStore } from '../../application/stores/inviteStore';

type Props = NativeStackScreenProps<CalendarStackParamList, 'Invite'>;

export default function InviteScreen({ navigation, route }: Props) {
  const { date } = route.params;
  const { user } = useAuthStore();
  const { friends, availability, loadAvailability } = useFriendStore();
  const { sendInvite } = useInviteStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (friends.length > 0) {
      loadAvailability(friends.map((f) => f.id), date);
    }
  }, [date]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (!user || selected.size === 0) return;
    setSending(true);
    try {
      await sendInvite(user.id, user.displayName, Array.from(selected), date);
      Alert.alert('초대 발송 완료', `${selected.size}명에게 초대를 보냈어요!`);
      navigation.goBack();
    } catch {
      Alert.alert('오류', '초대 발송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const d = new Date(date);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dateLabel = `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.back}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{dateLabel} 모임 초대</Text>
        <View style={{ width: 32 }} />
      </View>

      <Text style={styles.hint}>초대할 친구를 선택하세요</Text>

      <FlatList
        data={friends}
        keyExtractor={(f) => f.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>친구가 없어요{'\n'}친구 탭에서 추가해보세요</Text>}
        renderItem={({ item }) => {
          const status = availability[item.id];
          const isSelected = selected.has(item.id);
          return (
            <TouchableOpacity
              style={[styles.row, isSelected && styles.rowSelected]}
              onPress={() => toggle(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.displayName[0]?.toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.displayName}</Text>
                <Text style={[styles.statusText, status === 'busy' ? styles.busy : styles.free]}>
                  {status === 'busy' ? '이 날 바쁨' : '한가함'}
                </Text>
              </View>
              <View style={[styles.check, isSelected && styles.checkSelected]}>
                {isSelected && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.sendBtn, (selected.size === 0 || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={selected.size === 0 || sending}
          activeOpacity={0.85}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendText}>
              {selected.size > 0 ? `${selected.size}명에게 초대 보내기` : '친구를 선택하세요'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  back: { fontSize: 18, color: '#aaa', fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '700', color: '#222' },
  hint: { fontSize: 13, color: '#aaa', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  list: { paddingHorizontal: 16, paddingBottom: 120 },
  empty: { color: '#bbb', textAlign: 'center', paddingVertical: 40, fontSize: 14, lineHeight: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  rowSelected: { backgroundColor: '#f0f5ff' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#222' },
  statusText: { fontSize: 12, marginTop: 3, fontWeight: '500' },
  free: { color: '#34C759' },
  busy: { color: '#FF3B30' },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sendBtn: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#c0d8f5' },
  sendText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
