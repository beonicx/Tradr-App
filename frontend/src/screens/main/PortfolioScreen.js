import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchPortfolio } from '../../store/slices/portfolioSlice';

const PortfolioScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { holdings, summary, isLoading } = useSelector((s) => s.portfolio);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchPortfolio());
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchPortfolio());
    setRefreshing(false);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  const formatPercent = (val) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-900 px-6 pt-14 pb-6 border-b border-slate-800">
        <Text className="text-white text-3xl font-bold mb-4">Portfolio</Text>
        <View className="bg-slate-800 rounded-xl p-4">
          <Text className="text-slate-400 text-sm mb-2">Total Value</Text>
          <Text className="text-white text-3xl font-bold mb-3">
            {formatCurrency(summary.totalValue)}
          </Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-slate-400 text-xs">Invested</Text>
              <Text className="text-white text-base font-semibold">
                {formatCurrency(summary.totalInvested)}
              </Text>
            </View>
            <View>
              <Text className="text-slate-400 text-xs">P&L</Text>
              <Text
                className={`text-base font-semibold ${
                  summary.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatCurrency(summary.totalPnL)}
              </Text>
            </View>
            <View>
              <Text className="text-slate-400 text-xs">Returns</Text>
              <Text
                className={`text-base font-semibold ${
                  summary.totalPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatPercent(summary.totalPnLPercent)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {isLoading && holdings.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-slate-400 mt-4">Loading portfolio...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        >
          <View className="px-6 py-6">
            {holdings.length === 0 ? (
              <View className="bg-slate-900 rounded-2xl p-10 items-center border border-slate-800">
                <Icon name="briefcase-outline" size={60} color="#475569" />
                <Text className="text-white text-xl font-bold mt-4 mb-2">No Holdings Yet</Text>
                <Text className="text-slate-400 text-center mb-6">
                  Start trading to build your portfolio
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Search')}
                  className="bg-blue-500 px-8 py-3 rounded-xl"
                >
                  <Text className="text-white font-bold">Search Stocks</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text className="text-slate-400 text-sm mb-4">{holdings.length} Holdings</Text>
                {holdings.map((holding, index) => {
                  const pnl = holding.pnl || 0;
                  const pnlPercent = holding.pnlPercent || 0;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => navigation.navigate('StockDetail', { symbol: holding.symbol })}
                      className="bg-slate-900 rounded-xl p-4 mb-3 border border-slate-800"
                    >
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1">
                          <Text className="text-white text-lg font-bold">{holding.symbol}</Text>
                          <Text className="text-slate-400 text-sm">
                            {holding.quantity} shares @ {formatCurrency(holding.avgPrice)}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-white text-lg font-bold">
                            {formatCurrency(holding.currentValue)}
                          </Text>
                          <Text className="text-slate-400 text-sm">
                            @ {formatCurrency(holding.currentPrice)}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row justify-between items-center pt-3 border-t border-slate-800">
                        <Text className="text-slate-400 text-sm">
                          Invested: {formatCurrency(holding.totalInvested)}
                        </Text>
                        <View className="flex-row items-center">
                          <Icon
                            name={pnl >= 0 ? 'arrow-up' : 'arrow-down'}
                            size={16}
                            color={pnl >= 0 ? '#4ade80' : '#f87171'}
                          />
                          <Text
                            className={`text-base font-bold ml-1 ${
                              pnl >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {formatCurrency(Math.abs(pnl))} ({formatPercent(pnlPercent)})
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default PortfolioScreen;
