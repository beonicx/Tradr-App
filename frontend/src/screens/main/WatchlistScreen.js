import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { fetchWatchlist, removeFromWatchlist } from '../../store/slices/watchlistSlice';

const WatchlistScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((s) => s.watchlist);
  const { liveData } = useSelector((s) => s.market);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchWatchlist());
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchWatchlist());
    setRefreshing(false);
  };

  const handleRemove = async (symbol) => {
    await dispatch(removeFromWatchlist(symbol));
    Toast.show({ type: 'success', text1: 'Removed from watchlist' });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-900 px-6 pt-14 pb-6 border-b border-slate-800">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Watchlist</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Icon name="plus" size={28} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && items.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        >
          <View className="px-6 py-6">
            {items.length === 0 ? (
              <View className="bg-slate-900 rounded-2xl p-10 items-center border border-slate-800">
                <Icon name="star-outline" size={80} color="#475569" />
                <Text className="text-white text-xl font-bold mt-4 mb-2">No Watchlist Items</Text>
                <Text className="text-slate-400 text-center mb-6">
                  Add stocks to your watchlist to track them easily
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Search')}
                  className="bg-blue-500 px-8 py-3 rounded-xl"
                >
                  <Text className="text-white font-bold">Search Stocks</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text className="text-slate-400 text-sm mb-4">{items.length} stocks in watchlist</Text>
                {items.map((item, index) => {
                  const live = liveData[item.symbol] || {};
                  const price = live.price || item.lastPrice || 0;
                  const change = live.change || 0;
                  const changePercent = live.changePercent || 0;

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => navigation.navigate('StockDetail', { symbol: item.symbol })}
                      className="bg-slate-900 rounded-xl p-4 mb-3 border border-slate-800"
                    >
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <Text className="text-white text-lg font-bold mr-2">{item.symbol}</Text>
                            <Icon name="star" size={16} color="#fbbf24" />
                          </View>
                          {item.companyName && (
                            <Text className="text-slate-400 text-sm" numberOfLines={1}>
                              {item.companyName}
                            </Text>
                          )}
                        </View>
                        <View className="items-end ml-4">
                          <Text className="text-white text-lg font-bold">{formatCurrency(price)}</Text>
                          <View className="flex-row items-center mt-1">
                            <Icon
                              name={change >= 0 ? 'arrow-up' : 'arrow-down'}
                              size={14}
                              color={change >= 0 ? '#4ade80' : '#f87171'}
                            />
                            <Text
                              className={`text-sm font-semibold ml-1 ${
                                change >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {formatCurrency(Math.abs(change))} ({changePercent >= 0 ? '+' : ''}
                              {changePercent.toFixed(2)}%)
                            </Text>
                          </View>
                        </View>
                      </View>

                      {item.alertEnabled && item.targetPrice && (
                        <View className="mt-3 pt-3 border-t border-slate-800">
                          <View className="flex-row items-center">
                            <Icon name="bell" size={14} color="#fbbf24" />
                            <Text className="text-slate-400 text-xs ml-2">
                              Alert at {formatCurrency(item.targetPrice)}
                            </Text>
                          </View>
                        </View>
                      )}

                      <View className="flex-row gap-2 mt-3 pt-3 border-t border-slate-800">
                        <TouchableOpacity
                          onPress={() => navigation.navigate('Trade', { symbol: item.symbol, currentPrice: price })}
                          className="flex-1 bg-blue-500 rounded-lg py-2"
                        >
                          <Text className="text-white text-center font-semibold text-sm">Trade</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleRemove(item.symbol);
                          }}
                          className="flex-1 bg-red-500/20 rounded-lg py-2 border border-red-500"
                        >
                          <Text className="text-red-400 text-center font-semibold text-sm">Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default WatchlistScreen;
