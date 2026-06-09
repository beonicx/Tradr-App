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
import { register, clearError } from '../../store/slices/authSlice';

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((s) => s.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (error) {
      Toast.show({ type: 'error', text1: 'Registration Failed', text2: error });
      dispatch(clearError());
    }
  }, [error]);

  const handleRegister = async () => {
    const { firstName, lastName, email, password, confirmPassword, phone } = formData;

    console.log('📝 Register button pressed');
    console.log('Form data:', { firstName, lastName, email, phone: phone || '(empty)' });

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'All fields except phone are required' });
      return;
    }

    if (password.length < 8) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Password must be at least 8 characters' });
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password must contain uppercase, lowercase, and number',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Passwords do not match' });
      return;
    }

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
    };

    // Only include phone if it's not empty
    // Backend validation requires valid phone format if present
    if (phone && phone.trim()) {
      userData.phone = phone.trim();
    }

    console.log('✅ Validation passed, dispatching register action');
    console.log('   User data:', {
      ...userData,
      password: '[HIDDEN]',
    });
    dispatch(register(userData));
  };


  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-950"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6 py-8">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
              <Icon name="chart-line" size={40} color="#fff" />
            </View>
            <Text className="text-3xl font-bold text-white mb-2">Create Account</Text>
            <Text className="text-slate-400 text-base">Join TradePro today</Text>
          </View>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-slate-300 mb-2 font-medium">First Name</Text>
              <View className="flex-row items-center bg-slate-900 rounded-xl px-4 border border-slate-800">
                <TextInput
                  className="flex-1 text-white py-3"
                  placeholder="First"
                  placeholderTextColor="#64748b"
                  value={formData.firstName}
                  onChangeText={(v) => updateField('firstName', v)}
                />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-slate-300 mb-2 font-medium">Last Name</Text>
              <View className="flex-row items-center bg-slate-900 rounded-xl px-4 border border-slate-800">
                <TextInput
                  className="flex-1 text-white py-3"
                  placeholder="Last"
                  placeholderTextColor="#64748b"
                  value={formData.lastName}
                  onChangeText={(v) => updateField('lastName', v)}
                />
              </View>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-slate-300 mb-2 font-medium">Email</Text>
            <View className="flex-row items-center bg-slate-900 rounded-xl px-4 border border-slate-800">
              <Icon name="email-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-3 px-3"
                placeholder="Enter your email"
                placeholderTextColor="#64748b"
                value={formData.email}
                onChangeText={(v) => updateField('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-slate-300 mb-2 font-medium">Phone (Optional)</Text>
            <View className="flex-row items-center bg-slate-900 rounded-xl px-4 border border-slate-800">
              <Icon name="phone-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-3 px-3"
                placeholder="Enter your phone"
                placeholderTextColor="#64748b"
                value={formData.phone}
                onChangeText={(v) => updateField('phone', v)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-slate-300 mb-2 font-medium">Password</Text>
            <View className="flex-row items-center bg-slate-900 rounded-xl px-4 border border-slate-800">
              <Icon name="lock-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-3 px-3"
                placeholder="Min 8 chars with uppercase, lowercase, number"
                placeholderTextColor="#64748b"
                value={formData.password}
                onChangeText={(v) => updateField('password', v)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-300 mb-2 font-medium">Confirm Password</Text>
            <View className="flex-row items-center bg-slate-900 rounded-xl px-4 border border-slate-800">
              <Icon name="lock-check-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-3 px-3"
                placeholder="Re-enter your password"
                placeholderTextColor="#64748b"
                value={formData.confirmPassword}
                onChangeText={(v) => updateField('confirmPassword', v)}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Icon
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            className={`bg-blue-500 rounded-xl py-4 items-center mb-4 ${isLoading ? 'opacity-50' : ''}`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Create Account</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center">
            <Text className="text-slate-400">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-blue-400 font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
