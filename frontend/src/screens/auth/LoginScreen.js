import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { login, clearError, clearTwoFactor } from '../../store/slices/authSlice';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error, requiresTwoFactor } = useSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: error });
      dispatch(clearError());
    }
  }, [error]);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Email and password required' });
      return;
    }

    const credentials = { email: email.toLowerCase().trim(), password };
    if (requiresTwoFactor && twoFactorCode) {
      credentials.twoFactorCode = twoFactorCode;
    }

    dispatch(login(credentials));
  };

  const handleBack2FA = () => {
    dispatch(clearTwoFactor());
    setTwoFactorCode('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-950"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6">
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
              <Icon name="chart-line" size={40} color="#fff" />
            </View>
            <Text className="text-4xl font-bold text-white mb-2">TradePro</Text>
            <Text className="text-slate-400 text-base">Real-time Trading Platform</Text>
          </View>

          {!requiresTwoFactor ? (
            <>
              <View className="mb-4">
                <Text className="text-slate-300 mb-2 font-medium">Email</Text>
                <View className="flex-row items-center bg-slate-900 rounded-xl px-4 border border-slate-800">
                  <Icon name="email-outline" size={20} color="#94a3b8" />
                  <TextInput
                    className="flex-1 text-white py-4 px-3"
                    placeholder="Enter your email"
                    placeholderTextColor="#64748b"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-slate-300 mb-2 font-medium">Password</Text>
                <View className="flex-row items-center bg-slate-900 rounded-xl px-4 border border-slate-800">
                  <Icon name="lock-outline" size={20} color="#94a3b8" />
                  <TextInput
                    className="flex-1 text-white py-4 px-3"
                    placeholder="Enter your password"
                    placeholderTextColor="#64748b"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Icon
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View className="mb-6">
              <Text className="text-slate-300 mb-2 font-medium">Two-Factor Authentication</Text>
              <Text className="text-slate-400 mb-4 text-sm">
                Enter the 6-digit code from your authenticator app
              </Text>
              <View className="flex-row items-center bg-slate-900 rounded-xl px-4 border border-slate-800">
                <Icon name="shield-lock-outline" size={20} color="#94a3b8" />
                <TextInput
                  className="flex-1 text-white py-4 px-3 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  placeholderTextColor="#64748b"
                  value={twoFactorCode}
                  onChangeText={setTwoFactorCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              <TouchableOpacity onPress={handleBack2FA} className="mt-4">
                <Text className="text-blue-400 text-center">Back to login</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className={`bg-blue-500 rounded-xl py-4 items-center mb-4 ${
              isLoading ? 'opacity-50' : ''
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {requiresTwoFactor ? 'Verify' : 'Login'}
              </Text>
            )}
          </TouchableOpacity>

          {!requiresTwoFactor && (
            <View className="flex-row justify-center items-center">
              <Text className="text-slate-400">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-blue-400 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
