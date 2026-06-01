import { useEffect } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CalendarStack from './CalendarStack';
import FriendsStack from './FriendsStack';
import ChatStack from './ChatStack';
import InviteInboxScreen from '../screens/InviteInboxScreen';
import { useAuthStore } from '../../application/stores/authStore';
import { useInviteStore } from '../../application/stores/inviteStore';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { user } = useAuthStore();
  const { received, loadReceived } = useInviteStore();

  useEffect(() => {
    if (user) loadReceived(user.id);
  }, [user]);

  const pendingCount = user
    ? received.filter((inv) => !inv.responses?.[user.id]).length
    : 0;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#bbb',
        tabBarStyle: { borderTopColor: '#f0f0f0' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="CalendarTab"
        component={CalendarStack}
        options={{
          tabBarLabel: '캘린더',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="FriendsTab"
        component={FriendsStack}
        options={{
          tabBarLabel: '친구',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="InviteTab"
        component={InviteInboxScreen}
        options={{
          tabBarLabel: '초대함',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>✉️</Text>,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStack}
        options={{
          tabBarLabel: '채팅',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💬</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
