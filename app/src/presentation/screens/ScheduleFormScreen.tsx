import { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

type DropdownTarget = { side: 'start' | 'end'; type: 'h' | 'm' } | null;

export default function ScheduleFormScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [dropdown, setDropdown] = useState<DropdownTarget>(null);
  const [saving, setSaving] = useState(false);

  const { user } = useAuthStore();
  const { addSchedule } = useScheduleStore();

  const toggleDay = (dow: number) => {
    setSelectedDays((prev) =>
      prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow],
    );
  };

  const isValid = title.trim().length > 0 && (isRecurring ? selectedDays.length > 0 : true);

  const handleSave = async () => {
    if (!user || !isValid) return;
    setSaving(true);
    try {
      await addSchedule({
        userId: user.id,
        title: title.trim(),
        isRecurring,
        startTime,
        endTime,
        ...(isRecurring ? { daysOfWeek: selectedDays } : { date: selectedDate }),
      });
      navigation.goBack();
    } catch {
      Alert.alert('오류', '일정 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  // ── 드롭다운 helpers ───────────────────────────────────────
  const dropItems = dropdown?.type === 'h' ? HOURS : MINUTES;

  const dropCurrent = (() => {
    if (!dropdown) return 0;
    const t = dropdown.side === 'start' ? startTime : endTime;
    return parseInt(t.split(':')[dropdown.type === 'h' ? 0 : 1], 10);
  })();

  const handleDropdownSelect = (val: number) => {
    if (!dropdown) return;
    const valStr = String(val).padStart(2, '0');
    const setter = dropdown.side === 'start' ? setStartTime : setEndTime;
    const time  = dropdown.side === 'start' ? startTime : endTime;
    const [h, m] = time.split(':');
    setter(dropdown.type === 'h' ? `${valStr}:${m}` : `${h}:${valStr}`);
    setDropdown(null);
  };

  const adjustTime = (side: 'start' | 'end', type: 'h' | 'm', delta: number) => {
    const setter = side === 'start' ? setStartTime : setEndTime;
    const time  = side === 'start' ? startTime : endTime;
    const [h, m] = time.split(':');
    if (type === 'h') {
      setter(`${String((parseInt(h) + delta + 24) % 24).padStart(2, '0')}:${m}`);
    } else {
      setter(`${h}:${String((parseInt(m) + delta + 60) % 60).padStart(2, '0')}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>일정 추가</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <AuthInput
            label="일정 이름"
            value={title}
            onChangeText={setTitle}
            placeholder="예: 헬스, 수업, 알바"
            maxLength={30}
          />

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
                    <Text style={[styles.dayText, selectedDays.includes(i) && styles.dayTextActive]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedDays.length === 0 && <Text style={styles.hint}>요일을 하나 이상 선택하세요</Text>}
            </View>
          )}

          {!isRecurring && (
            <View style={styles.section}>
              <Text style={styles.label}>날짜 선택</Text>
              <Calendar
                current={TODAY}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={{ [selectedDate]: { selected: true, selectedColor: '#4A90E2' } }}
                theme={{ todayTextColor: '#4A90E2', arrowColor: '#4A90E2', textMonthFontWeight: '700' }}
              />
              <Text style={styles.selectedDateText}>선택된 날짜: {formatDate(selectedDate)}</Text>
            </View>
          )}

          {/* 시간 설정 */}
          <View style={styles.section}>
            <Text style={styles.label}>시간</Text>
            <View style={styles.timeRow}>
              <TimeUnit
                label="시작"
                value={startTime}
                onAdjust={(type, d) => adjustTime('start', type, d)}
                onTap={(type) => setDropdown({ side: 'start', type })}
              />
              <Text style={styles.timeSep}>~</Text>
              <TimeUnit
                label="종료"
                value={endTime}
                onAdjust={(type, d) => adjustTime('end', type, d)}
                onTap={(type) => setDropdown({ side: 'end', type })}
              />
            </View>
          </View>

          <PrimaryButton label="저장" onPress={handleSave} loading={saving} disabled={!isValid} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 드롭다운 모달 */}
      <Modal visible={!!dropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.dropOverlay} onPress={() => setDropdown(null)} activeOpacity={1}>
          <View style={styles.dropCard}>
            <Text style={styles.dropTitle}>
              {dropdown?.type === 'h' ? '시 선택' : '분 선택'}
            </Text>
            <FlatList
              data={dropItems}
              keyExtractor={(item) => String(item)}
              style={styles.dropList}
              initialScrollIndex={Math.max(0, dropCurrent - 3)}
              getItemLayout={(_, index) => ({ length: 44, offset: 44 * index, index })}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item === dropCurrent;
                return (
                  <TouchableOpacity
                    style={[styles.dropItem, isSelected && styles.dropItemSelected]}
                    onPress={() => handleDropdownSelect(item)}
                  >
                    <Text style={[styles.dropItemText, isSelected && styles.dropItemTextSelected]}>
                      {String(item).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function TimeUnit({
  label,
  value,
  onAdjust,
  onTap,
}: {
  label: string;
  value: string;
  onAdjust: (type: 'h' | 'm', delta: number) => void;
  onTap: (type: 'h' | 'm') => void;
}) {
  const [h, m] = value.split(':');
  return (
    <View style={styles.timeUnit}>
      <Text style={styles.timeUnitLabel}>{label}</Text>
      <View style={styles.timeUnitRow}>
        {/* 시 */}
        <View style={styles.timeDigitCol}>
          <TouchableOpacity onPress={() => onAdjust('h', 1)} style={styles.arrow}>
            <Text style={styles.arrowText}>▲</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onTap('h')} style={styles.timeValueBox}>
            <Text style={styles.timeValueText}>{h}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onAdjust('h', -1)} style={styles.arrow}>
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.timeColon}>:</Text>

        {/* 분 */}
        <View style={styles.timeDigitCol}>
          <TouchableOpacity onPress={() => onAdjust('m', 1)} style={styles.arrow}>
            <Text style={styles.arrowText}>▲</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onTap('m')} style={styles.timeValueBox}>
            <Text style={styles.timeValueText}>{m}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onAdjust('m', -1)} style={styles.arrow}>
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fafafa' },
  toggleActive: { backgroundColor: '#4A90E2' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#888' },
  toggleTextActive: { color: '#fff' },
  section: { marginBottom: 20 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  dayBtn: {
    flex: 1, aspectRatio: 1, borderRadius: 50, borderWidth: 1, borderColor: '#ddd',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa',
  },
  dayBtnActive: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  dayText: { fontSize: 14, fontWeight: '600', color: '#888' },
  dayTextActive: { color: '#fff' },
  hint: { fontSize: 12, color: '#bbb', marginTop: 8 },
  selectedDateText: { fontSize: 13, color: '#4A90E2', fontWeight: '600', textAlign: 'center', marginTop: 10 },

  // 시간 피커
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  timeSep: { fontSize: 22, color: '#ccc', marginTop: 20 },
  timeUnit: { alignItems: 'center' },
  timeUnitLabel: { fontSize: 12, color: '#aaa', fontWeight: '600', marginBottom: 6 },
  timeUnitRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeDigitCol: { alignItems: 'center' },
  arrow: { paddingHorizontal: 10, paddingVertical: 5 },
  arrowText: { fontSize: 12, color: '#4A90E2', fontWeight: '700' },
  timeValueBox: {
    width: 52,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f5ff',
  },
  timeValueText: { fontSize: 26, fontWeight: '700', color: '#222', letterSpacing: 1 },
  timeColon: { fontSize: 26, fontWeight: '300', color: '#aaa', marginBottom: 2 },

  // 드롭다운
  dropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#aaa',
    textAlign: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropList: { maxHeight: 220 },
  dropItem: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropItemSelected: { backgroundColor: '#f0f5ff' },
  dropItemText: { fontSize: 18, color: '#555' },
  dropItemTextSelected: { fontSize: 20, fontWeight: '700', color: '#4A90E2' },
});
