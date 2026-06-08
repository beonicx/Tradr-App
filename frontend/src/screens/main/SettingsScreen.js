import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import api from '../../services/api';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [notifications, setNotifications] = useState({
    trades: true,
    priceAlerts: true,
    news: false,
    marketing: false,
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'All fields are required' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Password must be at least 8 characters' });
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Password changed successfully' });
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to change password',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-900 px-6 pt-14 pb-6 border-b border-slate-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold ml-4">Settings</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          <Text className="text-white text-lg font-bold mb-4">Security</Text>
          <View className="bg-slate-900 rounded-xl border border-slate-800 mb-6">
            <View className="flex-row items-center justify-between p-4 border-b border-slate-800">
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">Two-Factor Authentication</Text>
                <Text className="text-slate-400 text-sm">Add an extra layer of security</Text>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: '#334155', true: '#3b82f6' }}
                thumbColor="#fff"
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowPasswordModal(true)}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">Change Password</Text>
                <Text className="text-slate-400 text-sm">Update your account password</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <Text className="text-white text-lg font-bold mb-4">Notifications</Text>
          <View className="bg-slate-900 rounded-xl border border-slate-800 mb-6">
            <View className="flex-row items-center justify-between p-4 border-b border-slate-800">
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">Trade Notifications</Text>
                <Text className="text-slate-400 text-sm">Alerts for executed trades</Text>
              </View>
              <Switch
                value={notifications.trades}
                onValueChange={() => toggleNotification('trades')}
                trackColor={{ false: '#334155', true: '#3b82f6' }}
                thumbColor="#fff"
              />
            </View>
            <View className="flex-row items-center justify-between p-4 border-b border-slate-800">
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">Price Alerts</Text>
                <Text className="text-slate-400 text-sm">Watchlist price target alerts</Text>
              </View>
              <Switch
                value={notifications.priceAlerts}
                onValueChange={() => toggleNotification('priceAlerts')}
                trackColor={{ false: '#334155', true: '#3b82f6' }}
                thumbColor="#fff"
              />
            </View>
            <View className="flex-row items-center justify-between p-4 border-b border-slate-800">
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">Market News</Text>
                <Text className="text-slate-400 text-sm">Important market updates</Text>
              </View>
              <Switch
                value={notifications.news}
                onValueChange={() => toggleNotification('news')}
                trackColor={{ false: '#334155', true: '#3b82f6' }}
                thumbColor="#fff"
              />
            </View>
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">Promotional</Text>
                <Text className="text-slate-400 text-sm">Marketing and offers</Text>
              </View>
              <Switch
                value={notifications.marketing}
                onValueChange={() => toggleNotification('marketing')}
                trackColor={{ false: '#334155', true: '#3b82f6' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <Text className="text-white text-lg font-bold mb-4">Preferences</Text>
          <View className="bg-slate-900 rounded-xl border border-slate-800 mb-6">
            <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-slate-800">
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">Language</Text>
                <Text className="text-slate-400 text-sm">English (US)</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">Currency</Text>
                <Text className="text-slate-400 text-sm">INR (₹)</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showPasswordModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/80 justify-center items-center px-6">
          <View className="bg-slate-900 rounded-2xl p-6 w-full border border-slate-800">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-2xl font-bold">Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Icon name="close" size={28} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-slate-300 mb-2 font-medium">Current Password</Text>
              <View className="flex-row items-center bg-slate-800 rounded-xl px-4 border border-slate-700">
                <Icon name="lock-outline" size={20} color="#94a3b8" />
                <TextInput
                  className="flex-1 text-white py-3 px-3"
                  placeholder="Enter current password"
                  placeholderTextColor="#64748b"
                  value={passwordData.currentPassword}
                  onChangeText={(v) => setPasswordData((p) => ({ ...p, currentPassword: v }))}
                  secureTextEntry
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-slate-300 mb-2 font-medium">New Password</Text>
              <View className="flex-row items-center bg-slate-800 rounded-xl px-4 border border-slate-700">
                <Icon name="lock-outline" size={20} color="#94a3b8" />
                <TextInput
                  className="flex-1 text-white py-3 px-3"
                  placeholder="Enter new password"
                  placeholderTextColor="#64748b"
                  value={passwordData.newPassword}
                  onChangeText={(v) => setPasswordData((p) => ({ ...p, newPassword: v }))}
                  secureTextEntry
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-slate-300 mb-2 font-medium">Confirm New Password</Text>
              <View className="flex-row items-center bg-slate-800 rounded-xl px-4 border border-slate-700">
                <Icon name="lock-check-outline" size={20} color="#94a3b8" />
                <TextInput
                  className="flex-1 text-white py-3 px-3"
                  placeholder="Re-enter new password"
                  placeholderTextColor="#64748b"
                  value={passwordData.confirmPassword}
                  onChangeText={(v) => setPasswordData((p) => ({ ...p, confirmPassword: v }))}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={isChangingPassword}
              className={`bg-blue-500 rounded-xl py-4 items-center ${isChangingPassword ? 'opacity-50' : ''}`}
            >
              {isChangingPassword ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg">Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsScreen;
