import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FriendScreen from '../screens/FriendScreen';
import FriendSearchScreen from '../screens/FriendSearchScreen';

export type FriendsStackParamList = {
  FriendsMain: undefined;
  FriendSearch: undefined;
};

const Stack = createNativeStackNavigator<FriendsStackParamList>();

export default function FriendsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FriendsMain" component={FriendScreen} />
      <Stack.Screen name="FriendSearch" component={FriendSearchScreen} />
    </Stack.Navigator>
  );
}
