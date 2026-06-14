import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuthStore } from '../../application/stores/authStore';
import AuthInput from '../components/AuthInput';
import PrimaryButton from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const { resetPassword, loading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (error) {
      Alert.alert('오류', error, [{ text: '확인', onPress: clearError }]);
    }
  }, [error]);

  const handleReset = async () => {
    await resetPassword(email.trim());
    Alert.alert(
      '이메일 전송 완료',
      '비밀번호 재설정 링크를 이메일로 보냈어요. 메일함을 확인해 주세요.',
      [{ text: '확인', onPress: () => navigation.goBack() }],
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.appTitle}>친구 스케줄 매칭</Text>
      <Text style={styles.screenTitle}>비밀번호 재설정</Text>
      <Text style={styles.description}>
        가입하신 이메일 주소를 입력하면{'\n'}재설정 링크를 보내드려요.
      </Text>

      <AuthInput
        label="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="이메일을 입력하세요"
      />

      <PrimaryButton
        label="재설정 링크 보내기"
        onPress={handleReset}
        loading={loading}
        disabled={!email}
      />

      <View style={styles.footer}>
        <Text style={styles.link} onPress={() => navigation.goBack()}>
          로그인으로 돌아가기
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 28,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  appTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 6,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  link: { color: '#4A90E2', fontSize: 14, fontWeight: '700' },
});
