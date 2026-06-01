import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FriendsStackParamList } from '../navigation/FriendsStack';
import { useAuthStore } from '../../application/stores/authStore';
import { useFriendStore } from '../../application/stores/friendStore';
import { friendRepository } from '../../data/repositories/friendRepository';
import { User } from '../../domain/entities';

type Props = NativeStackScreenProps<FriendsStackParamList, 'FriendSearch'>;

export default function FriendSearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { friends, sendRequest } = useFriendStore();
  const friendIds = friends.map((f) => f.id);

  useEffect(() => {
    if (user) {
      friendRepository.getSentRequestIds(user.id).then(setSentIds);
    }
  }, [user]);

  const handleSearch = async () => {
    if (!query.trim() || !user) return;
    setSearching(true);
    try {
      const found = await friendRepository.searchUsers(query.trim(), user.id);
      setResults(found);
    } catch {
      Alert.alert('오류', '검색에 실패했습니다.');
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (target: User) => {
    if (!user) return;
    setSendingTo(target.id);
    try {
      await sendRequest(user, target.id);
      setSentIds((prev) => [...prev, target.id]);
    } catch {
      Alert.alert('오류', '친구 요청에 실패했습니다.');
    } finally {
      setSendingTo(null);
    }
  };

  const getButtonState = (targetId: string): 'add' | 'sent' | 'friend' => {
    if (friendIds.includes(targetId)) return 'friend';
    if (sentIds.includes(targetId)) return 'sent';
    return 'add';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'< 뒤로'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>친구 검색</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 검색바 */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="이메일로 검색"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={searching}>
          {searching ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.searchBtnText}>검색</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 결과 */}
      {results.length === 0 && !searching ? (
        <Text style={styles.hint}>이메일 주소로 검색하세요</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const state = getButtonState(item.id);
            return (
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.displayName[0]?.toUpperCase()}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.displayName}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>
                {state === 'friend' ? (
                  <Text style={styles.friendLabel}>친구</Text>
                ) : state === 'sent' ? (
                  <Text style={styles.sentLabel}>요청됨</Text>
                ) : (
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => handleAddFriend(item)}
                    disabled={sendingTo === item.id}
                  >
                    {sendingTo === item.id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.addBtnText}>추가</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !searching ? <Text style={styles.hint}>검색 결과가 없어요</Text> : null
          }
        />
      )}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  back: { fontSize: 15, color: '#4A90E2' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  headerRight: { width: 60 },
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fafafa',
    color: '#111',
  },
  searchBtn: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  hint: { textAlign: 'center', color: '#bbb', marginTop: 40, fontSize: 14 },
  list: { paddingHorizontal: 16, paddingTop: 8 },
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
  addBtn: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    minWidth: 52,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  sentLabel: { fontSize: 13, color: '#aaa' },
  friendLabel: { fontSize: 13, color: '#34C759', fontWeight: '600' },
});
