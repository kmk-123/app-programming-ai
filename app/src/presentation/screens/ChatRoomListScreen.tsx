import { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList } from '../navigation/ChatStack';
import { useAuthStore } from '../../application/stores/authStore';
import { useChatStore } from '../../application/stores/chatStore';
import { ChatRoom } from '../../domain/entities';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatRoomList'>;

export default function ChatRoomListScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const { rooms, loadRooms } = useChatStore();

  useFocusEffect(
    useCallback(() => {
      if (user) loadRooms(user.id);
    }, [user]),
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
  };

  const getRoomTitle = (room: ChatRoom) => {
    return formatDate(room.date) + ' 모임';
  };

  const getParticipantLabel = (room: ChatRoom) => {
    return Object.values(room.participantNames).join(', ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>채팅</Text>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            채팅방이 없어요{'\n'}초대를 수락하면 채팅방이 생성돼요
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              navigation.navigate('Chat', {
                chatRoomId: item.id,
                title: getRoomTitle(item),
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.icon}>
              <Text style={styles.iconText}>💬</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.roomTitle}>{getRoomTitle(item)}</Text>
              <Text style={styles.participants} numberOfLines={1}>
                {getParticipantLabel(item)}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#222' },
  list: { paddingBottom: 40 },
  empty: { color: '#bbb', textAlign: 'center', paddingTop: 60, fontSize: 14, lineHeight: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#f0f5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: { fontSize: 22 },
  info: { flex: 1 },
  roomTitle: { fontSize: 15, fontWeight: '700', color: '#222' },
  participants: { fontSize: 12, color: '#aaa', marginTop: 3 },
  arrow: { fontSize: 20, color: '#ccc', marginLeft: 8 },
});
