import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

const MarketStatusBadge = ({ status }) => {
  const pulse = useRef(new Animated.Value(1)).current;

  const isOpen = status?.market === 'open' || status?.serverTime;

  useEffect(() => {
    if (isOpen) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }
  }, [isOpen]);

  if (!status) return null;

  return (
    <View className="flex-row items-center">
      <Animated.View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: isOpen ? '#4ade80' : '#f87171',
          transform: [{ scale: isOpen ? pulse : 1 }],
          marginRight: 8,
        }}
      />
      <Text className={`text-sm font-semibold ${isOpen ? 'text-green-400' : 'text-red-400'}`}>
        {isOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
      </Text>
    </View>
  );
};

export default MarketStatusBadge;
