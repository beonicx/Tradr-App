import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { loadUser } from '../store/slices/authSlice';
import socketService from '../services/socketService';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

import DashboardScreen from '../screens/main/DashboardScreen';
import PortfolioScreen from '../screens/main/PortfolioScreen';
import TradeScreen from '../screens/main/TradeScreen';
import WalletScreen from '../screens/main/WalletScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import StockDetailScreen from '../screens/main/StockDetailScreen';
import SearchScreen from '../screens/main/SearchScreen';
import TradeHistoryScreen from '../screens/main/TradeHistoryScreen';
import WatchlistScreen from '../screens/main/WatchlistScreen';
import TransactionHistoryScreen from '../screens/main/TransactionHistoryScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Dashboard: 'view-dashboard-outline',
  Portfolio: 'briefcase-outline',
  Trade: 'swap-horizontal',
  Wallet: 'wallet-outline',
  Profile: 'account-circle-outline',
};

const tabIconsActive = {
  Dashboard: 'view-dashboard',
  Portfolio: 'briefcase',
  Trade: 'swap-horizontal-bold',
  Wallet: 'wallet',
  Profile: 'account-circle',
};

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#0f172a',
        borderTopColor: '#1e293b',
        borderTopWidth: 1,
        paddingBottom: 8,
        paddingTop: 6,
        height: 68,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      tabBarActiveTintColor: '#3b82f6',
      tabBarInactiveTintColor: '#475569',
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
      tabBarIcon: ({ color, focused, size }) => {
        const iconName = focused ? tabIconsActive[route.name] : tabIcons[route.name];
        return <Icon name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Portfolio" component={PortfolioScreen} />
    <Tab.Screen
      name="Trade"
      component={TradeScreen}
      options={{
        tabBarIcon: ({ color, focused }) => (
          <View
            style={{
              position: 'absolute',
              bottom: 20,
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#3b82f6',
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 10,
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
            }}
          >
            <Icon name="swap-horizontal-bold" size={28} color="#fff" />
          </View>
        ),
        tabBarLabel: () => null,
      }}
    />
    <Tab.Screen name="Wallet" component={WalletScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isInitialized } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }
    return () => {};
  }, [isAuthenticated]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="StockDetail" component={StockDetailScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="TradeHistory" component={TradeHistoryScreen} />
            <Stack.Screen name="Watchlist" component={WatchlistScreen} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
