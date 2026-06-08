import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

const NotificationsScreen = ({ navigation }) => {
  const [notifications] = useState([
    {
      id: 1,
      type: 'trade',
      title: 'Trade Executed',
      message: 'Your buy order for AAPL has been executed successfully',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      icon: 'check-circle',
      color: '#4ade80',
    },
    {
      id: 2,
      type: 'alert',
      title: 'Price Alert',
      message: 'TSLA has reached your target price of $250',
      timestamp: new Date(Date.now() - 7200000),
      read: false,
      icon: 'bell-ring',
      color: '#f59e0b',
    },
    {
      id: 3,
      type: 'deposit',
      title: 'Deposit Successful',
      message: '₹10,000 has been added to your wallet',
      timestamp: new Date(Date.now() - 86400000),
      read: true,
      icon: 'wallet-plus',
      color: '#3b82f6',
    },
    {
      id: 4,
      type: 'market',
      title: 'Market Update',
      message: 'Market is now open for trading',
      timestamp: new Date(Date.now() - 172800000),
      read: true,
      icon: 'chart-line',
      color: '#8b5cf6',
    },
  ]);

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-900 px-6 pt-14 pb-6 border-b border-slate-800">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Notifications</Text>
          <TouchableOpacity>
            <Text className="text-blue-400 font-semibold">Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {notifications.length === 0 ? (
            <View className="bg-slate-900 rounded-2xl p-10 items-center border border-slate-800">
              <Icon name="bell-outline" size={80} color="#475569" />
              <Text className="text-white text-xl font-bold mt-4 mb-2">No Notifications</Text>
              <Text className="text-slate-400 text-center">
                You're all caught up! Check back later for updates
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-slate-400 text-sm mb-4">
                {notifications.filter((n) => !n.read).length} unread notifications
              </Text>
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  className={`rounded-xl p-4 mb-3 border ${
                    notification.read
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <View className="flex-row items-start">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${notification.color}20` }}
                    >
                      <Icon name={notification.icon} size={24} color={notification.color} />
                    </View>
                    <View className="flex-1 ml-4">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-white text-base font-semibold flex-1">
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <View className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
                        )}
                      </View>
                      <Text className="text-slate-400 text-sm mb-2">{notification.message}</Text>
                      <Text className="text-slate-500 text-xs">
                        {format(notification.timestamp, 'MMM dd, HH:mm')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;
