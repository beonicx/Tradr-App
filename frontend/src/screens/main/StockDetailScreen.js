import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart } from 'react-native-chart-kit';
import { fetchChartData, fetchStockDetails } from '../../store/slices/marketSlice';
import { addToWatchlist, removeFromWatchlist } from '../../store/slices/watchlistSlice';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const StockDetailScreen = ({ navigation, route }) => {
  const { symbol } = route.params;
  const dispatch = useDispatch();
  const { chartData, stockDetails, liveData } = useSelector((s) => s.market);
  const { items: watchlist } = useSelector((s) => s.watchlist);

  const [timeframe, setTimeframe] = useState('1D');
  const [loading, setLoading] = useState(true);

  const timeframes = [
    { label: '1D', timespan: 'minute', multiplier: 5, days: 1 },
    { label: '1W', timespan: 'hour', multiplier: 1, days: 7 },
    { label: '1M', timespan: 'day', multiplier: 1, days: 30 },
    { label: '3M', timespan: 'day', multiplier: 1, days: 90 },
    { label: '1Y', timespan: 'week', multiplier: 1, days: 365 },
  ];

  const isInWatchlist = watchlist.some((item) => item.symbol === symbol);

  useEffect(() => {
    loadData();
  }, [symbol]);

  useEffect(() => {
    loadChartData();
  }, [timeframe]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      dispatch(fetchStockDetails(symbol)),
      loadChartData(),
    ]);
    setLoading(false);
  };

  const loadChartData = () => {
    const tf = timeframes.find((t) => t.label === timeframe);
    const to = new Date();
    const from = new Date(to.getTime() - tf.days * 24 * 60 * 60 * 1000);
    return dispatch(
      fetchChartData({
        symbol,
        timespan: tf.timespan,
        multiplier: tf.multiplier,
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
      })
    );
  };

  const handleWatchlist = async () => {
    if (isInWatchlist) {
      await dispatch(removeFromWatchlist(symbol));
      Toast.show({ type: 'success', text1: 'Removed from watchlist' });
    } else {
      await dispatch(addToWatchlist(symbol));
      Toast.show({ type: 'success', text1: 'Added to watchlist' });
    }
  };

  const currentPrice = liveData[symbol]?.price || stockDetails[symbol]?.lastPrice || 0;
  const change = liveData[symbol]?.change || 0;
  const changePercent = liveData[symbol]?.changePercent || 0;
  const details = stockDetails[symbol] || {};
  const chart = chartData[symbol] || [];

  const chartLabels = chart.slice(-6).map((d) => {
    const date = new Date(d.t);
    if (timeframe === '1D') return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    if (timeframe === '1W') return `${date.getMonth() + 1}/${date.getDate()}`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const chartValues = chart.map((d) => d.c || 0);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-900 px-6 pt-14 pb-6 border-b border-slate-800">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={handleWatchlist}>
              <Icon
                name={isInWatchlist ? 'star' : 'star-outline'}
                size={28}
                color={isInWatchlist ? '#fbbf24' : '#94a3b8'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Icon name="magnify" size={28} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
        <Text className="text-white text-3xl font-bold mb-1">{symbol}</Text>
        <Text className="text-slate-400 text-base">{details.name || 'Loading...'}</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            <View className="mb-6">
              <Text className="text-white text-4xl font-bold mb-2">{formatCurrency(currentPrice)}</Text>
              <View className="flex-row items-center">
                <Icon
                  name={change >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={20}
                  color={change >= 0 ? '#4ade80' : '#f87171'}
                />
                <Text className={`text-lg font-semibold ml-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(Math.abs(change))} ({changePercent >= 0 ? '+' : ''}
                  {changePercent.toFixed(2)}%)
                </Text>
              </View>
            </View>

            <View className="flex-row mb-4 bg-slate-900 rounded-xl p-1 border border-slate-800">
              {timeframes.map((tf) => (
                <TouchableOpacity
                  key={tf.label}
                  onPress={() => setTimeframe(tf.label)}
                  className={`flex-1 py-2 rounded-lg ${timeframe === tf.label ? 'bg-blue-500' : ''}`}
                >
                  <Text
                    className={`text-center font-semibold text-sm ${
                      timeframe === tf.label ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {tf.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {chartValues.length > 0 ? (
              <View className="bg-slate-900 rounded-2xl p-4 mb-6 border border-slate-800">
                <LineChart
                  data={{
                    labels: chartLabels,
                    datasets: [{ data: chartValues }],
                  }}
                  width={width - 80}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#0f172a',
                    backgroundGradientFrom: '#0f172a',
                    backgroundGradientTo: '#1e293b',
                    decimalPlaces: 2,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: '#3b82f6',
                    },
                  }}
                  bezier
                  style={{ borderRadius: 12 }}
                />
              </View>
            ) : (
              <View className="bg-slate-900 rounded-2xl p-10 items-center mb-6 border border-slate-800">
                <Icon name="chart-line" size={60} color="#475569" />
                <Text className="text-slate-400 mt-4">No chart data available</Text>
              </View>
            )}

            <View className="bg-slate-900 rounded-2xl p-6 mb-6 border border-slate-800">
              <Text className="text-white text-lg font-bold mb-4">Stock Details</Text>
              {details.marketCap && (
                <View className="flex-row justify-between mb-3 pb-3 border-b border-slate-800">
                  <Text className="text-slate-400">Market Cap</Text>
                  <Text className="text-white font-semibold">{formatCurrency(details.marketCap)}</Text>
                </View>
              )}
              {details.open && (
                <View className="flex-row justify-between mb-3 pb-3 border-b border-slate-800">
                  <Text className="text-slate-400">Open</Text>
                  <Text className="text-white font-semibold">{formatCurrency(details.open)}</Text>
                </View>
              )}
              {details.high && (
                <View className="flex-row justify-between mb-3 pb-3 border-b border-slate-800">
                  <Text className="text-slate-400">High</Text>
                  <Text className="text-white font-semibold">{formatCurrency(details.high)}</Text>
                </View>
              )}
              {details.low && (
                <View className="flex-row justify-between mb-3 pb-3 border-b border-slate-800">
                  <Text className="text-slate-400">Low</Text>
                  <Text className="text-white font-semibold">{formatCurrency(details.low)}</Text>
                </View>
              )}
              {details.volume && (
                <View className="flex-row justify-between">
                  <Text className="text-slate-400">Volume</Text>
                  <Text className="text-white font-semibold">
                    {new Intl.NumberFormat('en-IN').format(details.volume)}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => navigation.navigate('Trade', { symbol, currentPrice, tradeType: 'buy' })}
                className="flex-1 bg-green-500 rounded-xl py-4"
              >
                <Text className="text-white text-center font-bold text-lg">BUY</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Trade', { symbol, currentPrice, tradeType: 'sell' })}
                className="flex-1 bg-red-500 rounded-xl py-4"
              >
                <Text className="text-white text-center font-bold text-lg">SELL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default StockDetailScreen;
