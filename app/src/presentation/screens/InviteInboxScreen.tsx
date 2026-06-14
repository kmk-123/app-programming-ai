import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../application/stores/authStore';
import { useInviteStore } from '../../application/stores/inviteStore';
import { Invite, InviteStatus } from '../../domain/entities';

type RespondAction = 'accepted' | 'declined' | 'deferred';

export default function InviteInboxScreen() {
  const { user } = useAuthStore();
  const { received, sent, loading, loadReceived, loadSent, respond } = useInviteStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ invite: Invite; action: 'declined' } | null>(null);
  const [reason, setReason] = useState('');
  const [responding, setResponding] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadReceived(user.id);
        loadSent(user.id);
      }
    }, [user]),
  );

  const myStatus = (invite: Invite): InviteStatus | null => {
    if (!user) return null;
    return invite.responses?.[user.id]?.status ?? null;
  };

  const pending  = received.filter((inv) => !myStatus(inv));
  const deferred = received.filter((inv) => myStatus(inv) === 'deferred');

  // 거절 or 보류 응답이 하나라도 있는 보낸 초대만 표시
  const sentWithResponses = sent.filter((inv) =>
    Object.values(inv.responses ?? {}).some(
      (r) => r.status === 'declined' || r.status === 'deferred',
    ),
  );

  const handleRespond = (invite: Invite, action: RespondAction) => {
    if (action === 'accepted') {
      confirmRespond(invite, 'accepted', undefined);
    } else if (action === 'declined') {
      setPendingAction({ invite, action: 'declined' });
      setReason('');
      setModalVisible(true);
    } else {
      confirmRespond(invite, 'deferred', undefined);
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
      ) : pending.length === 0 && deferred.length === 0 && sentWithResponses.length === 0 ? (
        <Text style={styles.empty}>받은 초대가 없어요</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {/* 미응답 */}
          {pending.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>미응답</Text>
              {pending.map((inv) => (
                <InviteCard
                  key={inv.id}
                  invite={inv}
                  mode="pending"
                  onAccept={() => handleRespond(inv, 'accepted')}
                  onDefer={() => handleRespond(inv, 'deferred')}
                  onDecline={() => handleRespond(inv, 'declined')}
                  responding={responding}
                />
              ))}
            </>
          )}

          {/* 보류중 */}
          {deferred.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>보류중</Text>
              {deferred.map((inv) => (
                <InviteCard
                  key={inv.id}
                  invite={inv}
                  mode="deferred"
                  onAccept={() => handleRespond(inv, 'accepted')}
                  onDecline={() => handleRespond(inv, 'declined')}
                  responding={responding}
                />
              ))}
            </>
          )}

          {/* 보낸 초대 응답 */}
          {sentWithResponses.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>보낸 초대 응답</Text>
              {sentWithResponses.map((inv) => (
                <SentInviteCard key={inv.id} invite={inv} />
              ))}
            </>
          )}
        </ScrollView>
      )}

      {/* 거절 사유 모달 */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>거절 사유</Text>
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
                onPress={() => { setModalVisible(false); setPendingAction(null); }}
              >
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() =>
                  pendingAction && confirmRespond(pendingAction.invite, 'declined', reason)
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
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function InviteCard({
  invite,
  mode,
  onAccept,
  onDefer,
  onDecline,
  responding,
}: {
  invite: Invite;
  mode: 'pending' | 'deferred';
  onAccept?: () => void;
  onDefer?: () => void;
  onDecline?: () => void;
  responding: boolean;
}) {
  const d = new Date(invite.date);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dateLabel = `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;

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
        {mode === 'deferred' && (
          <View style={[styles.statusChip, { backgroundColor: '#FF950022' }]}>
            <Text style={[styles.statusChipText, { color: '#FF9500' }]}>보류중</Text>
          </View>
        )}
      </View>

      {mode === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} disabled={responding}>
            <Text style={styles.acceptText}>수락</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deferBtn} onPress={onDefer} disabled={responding}>
            <Text style={styles.deferText}>보류</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.declineBtn} onPress={onDecline} disabled={responding}>
            <Text style={styles.declineText}>거절</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'deferred' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} disabled={responding}>
            <Text style={styles.acceptText}>수락</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.declineBtn} onPress={onDecline} disabled={responding}>
            <Text style={styles.declineText}>거절</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function SentInviteCard({ invite }: { invite: Invite }) {
  const d = new Date(invite.date);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dateLabel = `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;

  const statusLabel: Record<string, string> = { declined: '거절', deferred: '보류' };
  const statusColor: Record<string, string> = { declined: '#FF3B30', deferred: '#FF9500' };

  const noteworthyResponses = Object.values(invite.responses ?? {}).filter(
    (r) => r.status === 'declined' || r.status === 'deferred',
  );

  return (
    <View style={styles.card}>
      <Text style={styles.cardDate}>{dateLabel} 모임</Text>
      {noteworthyResponses.map((r, i) => (
        <View key={i} style={styles.responseRow}>
          <Text style={[styles.responseStatus, { color: statusColor[r.status] }]}>
            {r.displayName ?? '알 수 없음'} · {statusLabel[r.status]}
          </Text>
          {r.reason ? (
            <Text style={styles.responseReason}>"{r.reason}"</Text>
          ) : null}
        </View>
      ))}
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
  empty: { color: '#bbb', textAlign: 'center', paddingTop: 60, fontSize: 14 },
  list: { padding: 16, paddingBottom: 40 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },

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

  responseRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  responseStatus: { fontSize: 14, fontWeight: '700' },
  responseReason: { fontSize: 13, color: '#888', marginTop: 3, fontStyle: 'italic' },
});
