import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList } from '../navigation/ChatStack';
import { useAuthStore } from '../../application/stores/authStore';
import { useChatStore } from '../../application/stores/chatStore';
import { Message } from '../../domain/entities';

type Props = NativeStackScreenProps<ChatStackParamList, 'Chat'>;

export default function ChatScreen({ navigation, route }: Props) {
  const { chatRoomId, title } = route.params;
  const { user } = useAuthStore();
  const { messages, subscribeMessages, sendMessage, clearMessages } = useChatStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const unsubscribe = subscribeMessages(chatRoomId);
    return () => {
      unsubscribe();
      clearMessages();
    };
  }, [chatRoomId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !user || sending) return;
    setSending(true);
    setText('');
    try {
      await sendMessage(chatRoomId, user.id, user.displayName, trimmed);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (msg: Message) => {
    if (!msg.createdAt?.seconds) return '';
    const d = new Date(msg.createdAt.seconds * 1000);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.msgList}
          ListEmptyComponent={
            <Text style={styles.empty}>아직 메시지가 없어요. 첫 메시지를 보내보세요!</Text>
          }
          renderItem={({ item }) => {
            const isMine = item.senderId === user?.id;
            return (
              <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                <Text style={[styles.senderName, isMine ? styles.senderNameMine : null]}>
                  {item.senderName || '알 수 없음'}
                </Text>
                <View style={[styles.bubbleBody, isMine ? styles.bubbleBodyMine : styles.bubbleBodyOther]}>
                  <Text style={[styles.msgText, isMine ? styles.msgTextMine : styles.msgTextOther]}>
                    {item.text}
                  </Text>
                </View>
                <Text style={[styles.time, isMine ? styles.timeRight : styles.timeLeft]}>
                  {formatTime(item)}
                </Text>
              </View>
            );
          }}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="메시지 입력..."
            placeholderTextColor="#ccc"
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  back: { fontSize: 26, color: '#4A90E2', fontWeight: '400', marginRight: 8, lineHeight: 28 },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: '#222' },
  msgList: { padding: 12, paddingBottom: 8 },
  empty: { color: '#bbb', textAlign: 'center', paddingVertical: 40, fontSize: 13 },

  bubble: { marginBottom: 10 },
  bubbleMine: { alignItems: 'flex-end' },
  bubbleOther: { alignItems: 'flex-start' },
  senderName: { fontSize: 11, color: '#aaa', marginBottom: 3, marginLeft: 4 },
  senderNameMine: { textAlign: 'right', marginLeft: 0, marginRight: 4 },
  bubbleBody: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleBodyMine: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 4,
  },
  bubbleBodyOther: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  msgText: { fontSize: 15, lineHeight: 21 },
  msgTextMine: { color: '#fff' },
  msgTextOther: { color: '#222' },
  time: { fontSize: 10, color: '#bbb', marginTop: 3 },
  timeRight: { marginRight: 4 },
  timeLeft: { marginLeft: 4 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#f9fafb',
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#c0d8f5' },
  sendIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
