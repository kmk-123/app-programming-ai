import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalendarScreen from '../screens/CalendarScreen';
import ScheduleFormScreen from '../screens/ScheduleFormScreen';

export type CalendarStackParamList = {
  CalendarMain: undefined;
  ScheduleForm: undefined;
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
    </Stack.Navigator>
  );
}
