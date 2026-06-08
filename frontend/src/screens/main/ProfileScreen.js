import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { logout } from '../../store/slices/authSlice';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    {
      icon: 'account-edit',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => navigation.navigate('Settings'),
      color: '#3b82f6',
    },
    {
      icon: 'shield-lock',
      title: 'Security',
      subtitle: '2FA, password, login sessions',
      onPress: () => navigation.navigate('Settings'),
      color: '#10b981',
    },
    {
      icon: 'bell',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      onPress: () => navigation.navigate('Notifications'),
      color: '#f59e0b',
    },
    {
      icon: 'file-document',
      title: 'Documents',
      subtitle: 'KYC verification and documents',
      onPress: () => {},
      color: '#8b5cf6',
    },
    {
      icon: 'help-circle',
      title: 'Help & Support',
      subtitle: 'FAQs and customer support',
      onPress: () => {},
      color: '#06b6d4',
    },
    {
      icon: 'information',
      title: 'About',
      subtitle: 'App version and legal information',
      onPress: () => {},
      color: '#64748b',
    },
  ];

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-900 px-6 pt-14 pb-6 border-b border-slate-800">
        <Text className="text-white text-3xl font-bold mb-6">Profile</Text>
        <View className="items-center">
          <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center mb-4">
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-24 h-24 rounded-full" />
            ) : (
              <Text className="text-white text-4xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Text>
            )}
          </View>
          <Text className="text-white text-2xl font-bold mb-1">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-slate-400 text-base mb-2">{user?.email}</Text>
          {user?.kycStatus && (
            <View
              className={`px-4 py-1 rounded-full ${
                user.kycStatus === 'verified' ? 'bg-green-500/20' : 'bg-yellow-500/20'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  user.kycStatus === 'verified' ? 'text-green-400' : 'text-yellow-400'
                }`}
              >
                KYC {user.kycStatus.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              className="bg-slate-900 rounded-xl p-4 mb-3 border border-slate-800"
            >
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon name={item.icon} size={24} color={item.color} />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-white text-base font-semibold">{item.title}</Text>
                  <Text className="text-slate-400 text-sm">{item.subtitle}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500/20 rounded-xl p-4 mt-4 border border-red-500"
          >
            <View className="flex-row items-center justify-center">
              <Icon name="logout" size={24} color="#ef4444" />
              <Text className="text-red-400 text-lg font-bold ml-3">Logout</Text>
            </View>
          </TouchableOpacity>

          <View className="mt-6 items-center">
            <Text className="text-slate-500 text-sm">TradePro v1.0.0</Text>
            <Text className="text-slate-600 text-xs mt-1">© 2024 All rights reserved</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
