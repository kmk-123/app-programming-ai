import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarStackParamList } from '../navigation/CalendarStack';
import { useAuthStore } from '../../application/stores/authStore';
import { useScheduleStore } from '../../application/stores/scheduleStore';
import AuthInput from '../components/AuthInput';
import PrimaryButton from '../components/PrimaryButton';

type Props = NativeStackScreenProps<CalendarStackParamList, 'ScheduleForm'>;

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const TODAY = new Date().toISOString().split('T')[0];

export default function ScheduleFormScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [saving, setSaving] = useState(false);

  const { user } = useAuthStore();
  const { addSchedule } = useScheduleStore();

  const toggleDay = (dow: number) => {
    setSelectedDays((prev) =>
      prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow]
    );
  };

  const isValid =
    title.trim().length > 0 && (isRecurring ? selectedDays.length > 0 : true);

  const handleSave = async () => {
    if (!user || !isValid) return;
    setSaving(true);
    try {
      await addSchedule({
        userId: user.id,
        title: title.trim(),
        isRecurring,
        ...(isRecurring
          ? { daysOfWeek: selectedDays }
          : { date: selectedDate }),
      });
      navigation.goBack();
    } catch {
      Alert.alert('오류', '일정 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>일정 추가</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        {/* 일정 이름 */}
        <AuthInput
          label="일정 이름"
          value={title}
          onChangeText={setTitle}
          placeholder="예: 헬스, 수업, 알바"
          maxLength={30}
        />

        {/* 종류 토글 */}
        <Text style={styles.label}>종류</Text>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, isRecurring && styles.toggleActive]}
            onPress={() => setIsRecurring(true)}
          >
            <Text style={[styles.toggleText, isRecurring && styles.toggleTextActive]}>
              고정 (매주 반복)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !isRecurring && styles.toggleActive]}
            onPress={() => setIsRecurring(false)}
          >
            <Text style={[styles.toggleText, !isRecurring && styles.toggleTextActive]}>
              일회성
            </Text>
          </TouchableOpacity>
        </View>

        {/* 고정 — 요일 다중 선택 */}
        {isRecurring && (
          <View style={styles.section}>
            <Text style={styles.label}>반복 요일</Text>
            <View style={styles.dayRow}>
              {DAY_LABELS.map((day, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.dayBtn, selectedDays.includes(i) && styles.dayBtnActive]}
                  onPress={() => toggleDay(i)}
                >
                  <Text
                    style={[styles.dayText, selectedDays.includes(i) && styles.dayTextActive]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {selectedDays.length === 0 && (
              <Text style={styles.hint}>요일을 하나 이상 선택하세요</Text>
            )}
          </View>
        )}

        {/* 일회성 — 날짜 선택 */}
        {!isRecurring && (
          <View style={styles.section}>
            <Text style={styles.label}>날짜 선택</Text>
            <Calendar
              current={TODAY}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: '#4A90E2' },
              }}
              theme={{
                todayTextColor: '#4A90E2',
                arrowColor: '#4A90E2',
                textMonthFontWeight: '700',
              }}
            />
            <Text style={styles.selectedDateText}>
              선택된 날짜: {formatDate(selectedDate)}
            </Text>
          </View>
        )}

        <PrimaryButton
          label="저장"
          onPress={handleSave}
          loading={saving}
          disabled={!isValid}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
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
  cancel: { fontSize: 16, color: '#888' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  headerRight: { width: 40 },
  body: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10, marginTop: 4 },
  toggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  toggleActive: { backgroundColor: '#4A90E2' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#888' },
  toggleTextActive: { color: '#fff' },
  section: { marginBottom: 20 },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  dayBtnActive: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  dayText: { fontSize: 14, fontWeight: '600', color: '#888' },
  dayTextActive: { color: '#fff' },
  hint: { fontSize: 12, color: '#bbb', marginTop: 8 },
  selectedDateText: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
});
