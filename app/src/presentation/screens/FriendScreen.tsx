import { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FriendsStackParamList } from '../navigation/FriendsStack';
import { useAuthStore } from '../../application/stores/authStore';
import { useFriendStore } from '../../application/stores/friendStore';
import { User, FriendRequest } from '../../domain/entities';

type Props = NativeStackScreenProps<FriendsStackParamList, 'FriendsMain'>;

export default function FriendScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const { friends, requests, loading, loadFriends, loadRequests, acceptRequest, declineRequest } =
    useFriendStore();

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadFriends(user.id);
        loadRequests(user.id);
      }
    }, [user])
  );

  const handleAccept = (req: FriendRequest) => {
    if (user) acceptRequest(req.id, user, req);
  };

  const handleDecline = (req: FriendRequest) => {
    declineRequest(req.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>친구</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FriendSearch')}>
          <Text style={styles.searchBtn}>+ 친구 추가</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#4A90E2" style={styles.spinner} />
      ) : (
        <FlatList
          data={[]}
          ListHeaderComponent={
            <>
              {/* 받은 요청 */}
              {requests.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>받은 요청 {requests.length}</Text>
                  {requests.map((req) => (
                    <RequestRow
                      key={req.id}
                      request={req}
                      onAccept={() => handleAccept(req)}
                      onDecline={() => handleDecline(req)}
                    />
                  ))}
                </View>
              )}

              {/* 친구 목록 */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>친구 {friends.length}</Text>
                {friends.length === 0 ? (
                  <Text style={styles.empty}>아직 친구가 없어요{'\n'}+ 친구 추가로 검색해보세요</Text>
                ) : (
                  friends.map((friend) => <FriendRow key={friend.id} friend={friend} />)
                )}
              </View>
            </>
          }
          renderItem={null}
          keyExtractor={() => ''}
        />
      )}
    </SafeAreaView>
  );
}

function RequestRow({
  request,
  onAccept,
  onDecline,
}: {
  request: FriendRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{request.fromDisplayName[0]?.toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{request.fromDisplayName}</Text>
        <Text style={styles.email}>{request.fromEmail}</Text>
      </View>
      <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
        <Text style={styles.acceptText}>수락</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.declineBtn} onPress={onDecline}>
        <Text style={styles.declineText}>거절</Text>
      </TouchableOpacity>
    </View>
  );
}

function FriendRow({ friend }: { friend: User }) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{friend.displayName[0]?.toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{friend.displayName}</Text>
        <Text style={styles.email}>{friend.email}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#222' },
  searchBtn: { fontSize: 14, color: '#4A90E2', fontWeight: '700' },
  spinner: { marginTop: 40 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#aaa', marginBottom: 8, letterSpacing: 0.5 },
  empty: { color: '#bbb', textAlign: 'center', paddingVertical: 24, fontSize: 14, lineHeight: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#222' },
  email: { fontSize: 12, color: '#aaa', marginTop: 2 },
  acceptBtn: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  acceptText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  declineBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  declineText: { color: '#aaa', fontSize: 13 },
});
