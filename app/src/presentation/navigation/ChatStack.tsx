import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatRoomListScreen from '../screens/ChatRoomListScreen';
import ChatScreen from '../screens/ChatScreen';

export type ChatStackParamList = {
  ChatRoomList: undefined;
  Chat: { chatRoomId: string; title: string };
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatRoomList" component={ChatRoomListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
