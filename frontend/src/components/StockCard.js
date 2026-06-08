import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';

const StockCard = ({ stock, onPress }) => {
  const symbol = stock?.ticker || stock?.symbol || '';
  const liveData = useSelector((s) => s.market.liveData[symbol]);
  const flashAnim = useRef(new Animated.Value(0)).current;

  const ticker = stock?.ticker || stock?.symbol || '';
  const name = stock?.name || stock?.companyName || ticker;
  const livePrice = liveData?.price;
  const snapshotDay = stock?.day;
  const prevDay = stock?.prevDay;

  const displayPrice = livePrice || snapshotDay?.c || stock?.lastPrice || 0;
  const prevClose = prevDay?.c || snapshotDay?.o || displayPrice;
  const change = displayPrice - prevClose;
  const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
  const isPositive = change >= 0;

  useEffect(() => {
    if (livePrice) {
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
      ]).start();
    }
  }, [livePrice]);

  const bgColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(15, 23, 42, 1)', isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'],
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(
      val
    );
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Animated.View
        className="bg-slate-900 rounded-xl p-4 mb-3 border border-slate-800"
        style={{ backgroundColor: bgColor }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 bg-blue-500/20 rounded-full items-center justify-center mr-3">
              <Text className="text-blue-400 font-bold text-lg">{ticker.slice(0, 3)}</Text>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-white text-base font-bold mr-2">{ticker}</Text>
                {liveData && (
                  <View className="bg-green-500/20 px-2 py-0.5 rounded">
                    <Text className="text-green-400 text-xs font-bold">LIVE</Text>
                  </View>
                )}
              </View>
              <Text className="text-slate-400 text-sm" numberOfLines={1}>
                {name.length > 25 ? name.slice(0, 25) + '...' : name}
              </Text>
            </View>
          </View>

          <View className="items-end ml-4">
            <Text className="text-white text-lg font-bold">{formatCurrency(displayPrice)}</Text>
            <View className="flex-row items-center">
              <Icon
                name={isPositive ? 'arrow-up' : 'arrow-down'}
                size={14}
                color={isPositive ? '#4ade80' : '#f87171'}
              />
              <Text className={`text-sm font-semibold ml-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}
                {changePercent.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default StockCard;
