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
import { fetchTopMovers, fetchMarketStatus } from '../../store/slices/marketSlice';
import { fetchWallet } from '../../store/slices/walletSlice';
import MarketStatusBadge from '../../components/MarketStatusBadge';
import StockCard from '../../components/StockCard';
import PortfolioChart from '../../components/PortfolioChart';

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { summary, holdings, isLoading: portfolioLoading } = useSelector((s) => s.portfolio);
  const { gainers, losers, marketStatus } = useSelector((s) => s.market);
  const { balance } = useSelector((s) => s.wallet);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    dispatch(fetchPortfolio());
    dispatch(fetchTopMovers());
    dispatch(fetchMarketStatus());
    dispatch(fetchWallet());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchPortfolio()),
      dispatch(fetchTopMovers()),
      dispatch(fetchMarketStatus()),
      dispatch(fetchWallet()),
    ]);
    setRefreshing(false);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  const formatPercent = (val) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-900 px-6 pt-14 pb-6 border-b border-slate-800">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-slate-400 text-sm">Welcome back,</Text>
            <Text className="text-white text-2xl font-bold">{user?.firstName || 'Trader'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <View className="w-12 h-12 bg-slate-800 rounded-full items-center justify-center">
              <Icon name="bell-outline" size={24} color="#94a3b8" />
            </View>
          </TouchableOpacity>
        </View>
        <MarketStatusBadge status={marketStatus} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
      >
        <View className="px-6 py-6">
          <View className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 mb-6">
            <Text className="text-blue-200 text-sm mb-2">Portfolio Value</Text>
            <Text className="text-white text-4xl font-bold mb-4">
              {formatCurrency(summary.totalValue)}
            </Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-blue-200 text-xs mb-1">Total P&L</Text>
                <Text
                  className={`text-lg font-bold ${
                    summary.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(summary.totalPnL)}
                </Text>
              </View>
              <View>
                <Text className="text-blue-200 text-xs mb-1">P&L %</Text>
                <Text
                  className={`text-lg font-bold ${
                    summary.totalPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatPercent(summary.totalPnLPercent)}
                </Text>
              </View>
              <View>
                <Text className="text-blue-200 text-xs mb-1">Wallet</Text>
                <Text className="text-white text-lg font-bold">{formatCurrency(balance)}</Text>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between mb-6">
            <TouchableOpacity
              onPress={() => navigation.navigate('Wallet')}
              className="flex-1 bg-slate-900 rounded-xl p-4 mr-2 border border-slate-800"
            >
              <Icon name="wallet" size={28} color="#3b82f6" />
              <Text className="text-white font-semibold mt-2">Add Funds</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Search')}
              className="flex-1 bg-slate-900 rounded-xl p-4 ml-2 border border-slate-800"
            >
              <Icon name="magnify" size={28} color="#3b82f6" />
              <Text className="text-white font-semibold mt-2">Search Stocks</Text>
            </TouchableOpacity>
          </View>

          {holdings.length > 0 && (
            <View className="mb-6">
              <Text className="text-white text-lg font-bold mb-4">Portfolio Performance</Text>
              <PortfolioChart holdings={holdings} />
            </View>
          )}

          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">Top Gainers</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text className="text-blue-400 text-sm">See all</Text>
              </TouchableOpacity>
            </View>
            {gainers.length === 0 ? (
              <View className="bg-slate-900 rounded-xl p-6 items-center border border-slate-800">
                <Icon name="chart-line" size={40} color="#475569" />
                <Text className="text-slate-400 mt-2">No data available</Text>
              </View>
            ) : (
              gainers.slice(0, 5).map((stock, idx) => (
                <StockCard
                  key={idx}
                  stock={stock}
                  onPress={() => navigation.navigate('StockDetail', { symbol: stock.symbol })}
                />
              ))
            )}
          </View>

          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">Top Losers</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text className="text-blue-400 text-sm">See all</Text>
              </TouchableOpacity>
            </View>
            {losers.length === 0 ? (
              <View className="bg-slate-900 rounded-xl p-6 items-center border border-slate-800">
                <Icon name="chart-line-variant" size={40} color="#475569" />
                <Text className="text-slate-400 mt-2">No data available</Text>
              </View>
            ) : (
              losers.slice(0, 5).map((stock, idx) => (
                <StockCard
                  key={idx}
                  stock={stock}
                  onPress={() => navigation.navigate('StockDetail', { symbol: stock.symbol })}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
