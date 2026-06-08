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
import { fetchTradeHistory, fetchTradeSummary } from '../../store/slices/tradeSlice';
import { format } from 'date-fns';

const TradeHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { trades, summary, isLoading } = useSelector((s) => s.trade);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    dispatch(fetchTradeHistory());
    dispatch(fetchTradeSummary());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchTradeHistory()), dispatch(fetchTradeSummary())]);
    setRefreshing(false);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  const filteredTrades = filter === 'all' ? trades : trades.filter((t) => t.type === filter);

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-900 px-6 pt-14 pb-6 border-b border-slate-800">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Trade History</Text>
          <View style={{ width: 28 }} />
        </View>
      </View>

      {summary && (
        <View className="px-6 py-4 bg-slate-900 border-b border-slate-800">
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-slate-400 text-xs mb-1">Total Trades</Text>
              <Text className="text-white text-xl font-bold">{summary.totalTrades || 0}</Text>
            </View>
            <View className="items-center">
              <Text className="text-slate-400 text-xs mb-1">Total Volume</Text>
              <Text className="text-white text-xl font-bold">{formatCurrency(summary.totalVolume || 0)}</Text>
            </View>
            <View className="items-center">
              <Text className="text-slate-400 text-xs mb-1">Profit/Loss</Text>
              <Text
                className={`text-xl font-bold ${
                  (summary.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatCurrency(summary.totalPnL || 0)}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View className="px-6 py-4">
        <View className="flex-row bg-slate-900 rounded-xl p-1 border border-slate-800">
          {['all', 'buy', 'sell'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg ${filter === f ? 'bg-blue-500' : ''}`}
            >
              <Text
                className={`text-center font-semibold capitalize ${
                  filter === f ? 'text-white' : 'text-slate-400'
                }`}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading && trades.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        >
          <View className="px-6 pb-6">
            {filteredTrades.length === 0 ? (
              <View className="bg-slate-900 rounded-2xl p-10 items-center border border-slate-800">
                <Icon name="history" size={60} color="#475569" />
                <Text className="text-white text-xl font-bold mt-4 mb-2">No Trades Yet</Text>
                <Text className="text-slate-400 text-center">Your trade history will appear here</Text>
              </View>
            ) : (
              filteredTrades.map((trade, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate('StockDetail', { symbol: trade.symbol })}
                  className="bg-slate-900 rounded-xl p-4 mb-3 border border-slate-800"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-white text-lg font-bold mr-2">{trade.symbol}</Text>
                        <View
                          className={`px-2 py-1 rounded ${
                            trade.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold uppercase ${
                              trade.type === 'buy' ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {trade.type}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-slate-400 text-sm">
                        {trade.quantity} shares @ {formatCurrency(trade.price)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-white text-lg font-bold">
                        {formatCurrency(trade.totalAmount)}
                      </Text>
                      <Text className="text-slate-400 text-xs">
                        {format(new Date(trade.executedAt || trade.createdAt), 'MMM dd, HH:mm')}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between items-center pt-3 border-t border-slate-800">
                    <View className="flex-row items-center">
                      <Icon
                        name={trade.status === 'completed' ? 'check-circle' : 'clock-outline'}
                        size={16}
                        color={trade.status === 'completed' ? '#4ade80' : '#fbbf24'}
                      />
                      <Text
                        className={`text-sm ml-1 capitalize ${
                          trade.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                        }`}
                      >
                        {trade.status}
                      </Text>
                    </View>
                    {trade.orderType && (
                      <Text className="text-slate-400 text-xs uppercase">{trade.orderType}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default TradeHistoryScreen;
