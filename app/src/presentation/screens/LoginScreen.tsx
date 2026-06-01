import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuthStore } from '../../application/stores/authStore';
import AuthInput from '../components/AuthInput';
import PrimaryButton from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (error) {
      Alert.alert('로그인 실패', error, [{ text: '확인', onPress: clearError }]);
    }
  }, [error]);

  const handleLogin = () => signIn(email.trim(), password);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.appTitle}>친구 스케줄 매칭</Text>
      <Text style={styles.screenTitle}>로그인</Text>

      <AuthInput
        label="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="이메일을 입력하세요"
      />
      <AuthInput
        label="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="비밀번호를 입력하세요"
      />

      <PrimaryButton
        label="로그인"
        onPress={handleLogin}
        loading={loading}
        disabled={!email || !password}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>계정이 없으신가요? </Text>
        <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
          회원가입
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
