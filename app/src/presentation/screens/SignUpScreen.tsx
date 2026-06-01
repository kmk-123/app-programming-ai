import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuthStore } from '../../application/stores/authStore';
import AuthInput from '../components/AuthInput';
import PrimaryButton from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, loading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (error) {
      Alert.alert('회원가입 실패', error, [{ text: '확인', onPress: clearError }]);
    }
  }, [error]);

  const isValid = displayName.trim() && email.trim() && password.length >= 6;

  const handleSignUp = () => signUp(email.trim(), password, displayName.trim());

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.appTitle}>친구 스케줄 매칭</Text>
      <Text style={styles.screenTitle}>회원가입</Text>

      <AuthInput
        label="이름"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="이름을 입력하세요"
      />
      <AuthInput
        label="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="이메일을 입력하세요"
      />
      <AuthInput
        label="비밀번호 (6자 이상)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="비밀번호를 입력하세요"
      />

      <PrimaryButton
        label="회원가입"
        onPress={handleSignUp}
        loading={loading}
        disabled={!isValid}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>이미 계정이 있으신가요? </Text>
        <Text style={styles.link} onPress={() => navigation.goBack()}>
          로그인
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
    marginBottom: 36,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: { color: '#888', fontSize: 14 },
  link: { color: '#4A90E2', fontSize: 14, fontWeight: '700' },
});
