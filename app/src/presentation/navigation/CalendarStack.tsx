import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalendarScreen from '../screens/CalendarScreen';
import ScheduleFormScreen from '../screens/ScheduleFormScreen';
import InviteScreen from '../screens/InviteScreen';

export type CalendarStackParamList = {
  CalendarMain: undefined;
  ScheduleForm: undefined;
  Invite: { date: string };
};

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export default function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarMain" component={CalendarScreen} />
      <Stack.Screen
        name="ScheduleForm"
        component={ScheduleFormScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="Invite"
        component={InviteScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
