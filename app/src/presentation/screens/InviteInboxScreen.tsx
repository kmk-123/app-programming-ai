import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../application/stores/authStore';
import { useInviteStore } from '../../application/stores/inviteStore';
import { Invite, InviteStatus } from '../../domain/entities';

type RespondAction = 'accepted' | 'declined' | 'deferred';

export default function InviteInboxScreen() {
  const { user } = useAuthStore();
  const { received, loading, loadReceived, respond } = useInviteStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ invite: Invite; action: RespondAction } | null>(null);
  const [reason, setReason] = useState('');
  const [responding, setResponding] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) loadReceived(user.id);
    }, [user]),
  );

  const handleRespond = (invite: Invite, action: RespondAction) => {
    if (action === 'accepted') {
      confirmRespond(invite, action, undefined);
    } else {
      setPendingAction({ invite, action });
      setReason('');
      setModalVisible(true);
    }
  };

  const confirmRespond = async (
    invite: Invite,
    action: RespondAction,
    reasonText: string | undefined,
  ) => {
    if (!user) return;
    setResponding(true);
    try {
      const chatRoomId = await respond(invite, user.id, user.displayName, action, reasonText || undefined);
      if (action === 'accepted' && chatRoomId) {
        Alert.alert('수락 완료', '채팅방이 생성됐어요! 채팅 탭을 확인해보세요.');
      }
    } catch {
      Alert.alert('오류', '처리 중 문제가 발생했습니다.');
    } finally {
      setResponding(false);
      setModalVisible(false);
      setPendingAction(null);
      setReason('');
    }
  };

  const myResponse = (invite: Invite): InviteStatus | null => {
    if (!user) return null;
    return invite.responses?.[user.id]?.status ?? null;
  };

  const pending = received.filter((inv) => !myResponse(inv));
  const responded = received.filter((inv) => !!myResponse(inv));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>초대함</Text>
        {pending.length > 0 && (
          <View style={styles.badge}><Text style={styles.badgeText}>{pending.length}</Text></View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#4A90E2" style={styles.spinner} />
      ) : (
        <FlatList
          data={[...pending, ...responded]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>받은 초대가 없어요</Text>
          }
          renderItem={({ item }) => {
            const status = myResponse(item);
            return (
              <InviteCard
                invite={item}
                myStatus={status}
                onRespond={(action) => handleRespond(item, action)}
                responding={responding}
              />
            );
          }}
        />
      )}

      {/* 거절/보류 사유 모달 */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {pendingAction?.action === 'declined' ? '거절 사유' : '보류 사유'}
            </Text>
            <Text style={styles.modalHint}>사유를 입력하면 초대자에게 전달돼요 (선택)</Text>
            <TextInput
              style={styles.reasonInput}
              value={reason}
              onChangeText={setReason}
              placeholder="예) 시험이 있어서요"
              placeholderTextColor="#ccc"
              multiline
              maxLength={80}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setPendingAction(null);
                }}
              >
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() =>
                  pendingAction &&
                  confirmRespond(pendingAction.invite, pendingAction.action, reason)
                }
                disabled={responding}
              >
                {responding ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmText}>확인</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InviteCard({
  invite,
  myStatus,
  onRespond,
  responding,
}: {
  invite: Invite;
  myStatus: InviteStatus | null;
  onRespond: (action: RespondAction) => void;
  responding: boolean;
}) {
  const d = new Date(invite.date);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dateLabel = `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;

  const statusColors: Record<string, string> = {
    accepted: '#34C759',
    declined: '#FF3B30',
    deferred: '#FF9500',
  };
  const statusLabels: Record<string, string> = {
    accepted: '수락함',
    declined: '거절함',
    deferred: '보류함',
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarSmallText}>
            {invite.fromDisplayName?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardFrom}>
            <Text style={styles.cardFromName}>{invite.fromDisplayName}</Text>님의 초대
          </Text>
          <Text style={styles.cardDate}>{dateLabel}</Text>
        </View>
        {myStatus && (
          <View style={[styles.statusChip, { backgroundColor: statusColors[myStatus] + '22' }]}>
            <Text style={[styles.statusChipText, { color: statusColors[myStatus] }]}>
              {statusLabels[myStatus]}
            </Text>
          </View>
        )}
      </View>

      {!myStatus && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => onRespond('accepted')}
            disabled={responding}
          >
            <Text style={styles.acceptText}>수락</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deferBtn}
            onPress={() => onRespond('deferred')}
            disabled={responding}
          >
            <Text style={styles.deferText}>보류</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => onRespond('declined')}
            disabled={responding}
          >
            <Text style={styles.declineText}>거절</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#222' },
  badge: {
    marginLeft: 8,
    backgroundColor: '#FF3B30',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  spinner: { marginTop: 40 },
  list: { padding: 16, paddingBottom: 40 },
  empty: { color: '#bbb', textAlign: 'center', paddingVertical: 40, fontSize: 14 },

  card: {
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarSmallText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cardFrom: { fontSize: 14, color: '#555' },
  cardFromName: { fontWeight: '700', color: '#222' },
  cardDate: { fontSize: 13, color: '#4A90E2', fontWeight: '600', marginTop: 2 },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusChipText: { fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  deferBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#FF9500',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deferText: { color: '#FF9500', fontWeight: '700', fontSize: 14 },
  declineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#ddd',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineText: { color: '#aaa', fontWeight: '600', fontSize: 14 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    width: '100%',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#222', marginBottom: 4 },
  modalHint: { fontSize: 12, color: '#aaa', marginBottom: 14 },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#222',
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { color: '#aaa', fontSize: 15, fontWeight: '600' },
  confirmBtn: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
