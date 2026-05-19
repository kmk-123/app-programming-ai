import { StatusBar } from 'expo-status-bar';
import CalendarScreen from './src/presentation/screens/CalendarScreen';

export default function App() {
  return (
    <>
      <CalendarScreen />
      <StatusBar style="auto" />
    </>
  );
}
