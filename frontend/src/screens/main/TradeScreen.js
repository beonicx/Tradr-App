import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { executeTrade, clearError } from '../../store/slices/tradeSlice';
import { fetchWallet } from '../../store/slices/walletSlice';
import { fetchPortfolio } from '../../store/slices/portfolioSlice';
import { searchStocks } from '../../store/slices/marketSlice';

const TradeScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { balance } = useSelector((s) => s.wallet);
  const { isExecuting, error, lastTrade } = useSelector((s) => s.trade);
  const { searchResults, isSearching } = useSelector((s) => s.market);
  const { holdings } = useSelector((s) => s.portfolio);

  const [tradeType, setTradeType] = useState('buy');
  const [symbol, setSymbol] = useState(route.params?.symbol || '');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(route.params?.currentPrice?.toString() || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchPortfolio());
  }, []);

  useEffect(() => {
    if (route.params?.symbol) {
      setSymbol(route.params.symbol);
      if (route.params.currentPrice) {
        setPrice(route.params.currentPrice.toString());
      }
    }
  }, [route.params]);

  useEffect(() => {
    if (error) {
      Toast.show({ type: 'error', text1: 'Trade Failed', text2: error });
      dispatch(clearError());
    }
  }, [error]);

  useEffect(() => {
    if (lastTrade) {
      Toast.show({
        type: 'success',
        text1: 'Trade Executed',
        text2: `${lastTrade.type.toUpperCase()} ${lastTrade.quantity} shares of ${lastTrade.symbol}`,
      });
      dispatch(fetchWallet());
      dispatch(fetchPortfolio());
      setQuantity('');
      setShowConfirm(false);
    }
  }, [lastTrade]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        dispatch(searchStocks(searchQuery));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const handleSearch = (stock) => {
    setSymbol(stock.symbol);
    setPrice(stock.lastPrice?.toString() || '');
    setShowSearch(false);
    setSearchQuery('');
  };

  const calculateTotal = () => {
    const p = parseFloat(price) || 0;
    const q = parseFloat(quantity) || 0;
    return p * q;
  };

  const getMaxQuantity = () => {
    if (tradeType === 'buy') {
      const p = parseFloat(price) || 0;
      return p > 0 ? Math.floor(balance / p) : 0;
    } else {
      const holding = holdings.find((h) => h.symbol === symbol.toUpperCase());
      return holding?.quantity || 0;
    }
  };

  const handleTrade = () => {
    if (!symbol.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please select a stock' });
      return;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter valid quantity' });
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter valid price' });
      return;
    }

    const total = calculateTotal();
    if (tradeType === 'buy' && total > balance) {
      Toast.show({ type: 'error', text1: 'Insufficient Balance', text2: 'Please add funds to wallet' });
      return;
    }

    if (tradeType === 'sell') {
      const holding = holdings.find((h) => h.symbol === symbol.toUpperCase());
      if (!holding || holding.quantity < parseFloat(quantity)) {
        Toast.show({ type: 'error', text1: 'Insufficient Shares', text2: 'You do not own enough shares' });
        return;
      }
    }

    setShowConfirm(true);
  };

  const confirmTrade = () => {
    dispatch(
      executeTrade({
        symbol: symbol.toUpperCase(),
        type: tradeType,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        orderType: 'market',
      })
    );
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-900 px-6 pt-14 pb-6 border-b border-slate-800">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-3xl font-bold">Trade</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TradeHistory')}>
            <Icon name="history" size={28} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          <View className="flex-row mb-6 bg-slate-900 rounded-xl p-1 border border-slate-800">
            <TouchableOpacity
              onPress={() => setTradeType('buy')}
              className={`flex-1 py-3 rounded-lg ${tradeType === 'buy' ? 'bg-green-500' : ''}`}
            >
              <Text
                className={`text-center font-bold ${tradeType === 'buy' ? 'text-white' : 'text-slate-400'}`}
              >
                BUY
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTradeType('sell')}
              className={`flex-1 py-3 rounded-lg ${tradeType === 'sell' ? 'bg-red-500' : ''}`}
            >
              <Text
                className={`text-center font-bold ${tradeType === 'sell' ? 'text-white' : 'text-slate-400'}`}
              >
                SELL
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="text-slate-300 mb-2 font-medium">Stock Symbol</Text>
            <TouchableOpacity
              onPress={() => setShowSearch(true)}
              className="flex-row items-center bg-slate-900 rounded-xl px-4 py-4 border border-slate-800"
            >
              <Icon name="magnify" size={20} color="#94a3b8" />
              <Text className={`flex-1 ml-3 ${symbol ? 'text-white' : 'text-slate-500'}`}>
                {symbol || 'Search and select stock'}
              </Text>
              <Icon name="chevron-right" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="text-slate-300 mb-2 font-medium">Price per Share</Text>
            <View className="flex-row items-center bg-slate-900 rounded-xl px-4 border border-slate-800">
              <Icon name="currency-inr" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-4 px-3 text-lg"
                placeholder="0.00"
                placeholderTextColor="#64748b"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-slate-300 font-medium">Quantity</Text>
              <Text className="text-slate-400 text-sm">
                Max: {getMaxQuantity()} {tradeType === 'buy' ? 'shares' : 'available'}
              </Text>
            </View>
            <View className="flex-row items-center bg-slate-900 rounded-xl px-4 border border-slate-800">
              <Icon name="counter" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-4 px-3 text-lg"
                placeholder="0"
                placeholderTextColor="#64748b"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity onPress={() => setQuantity(getMaxQuantity().toString())}>
                <Text className="text-blue-400 font-semibold">MAX</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-800">
            <View className="flex-row justify-between mb-3">
              <Text className="text-slate-400">Total Amount</Text>
              <Text className="text-white text-xl font-bold">{formatCurrency(calculateTotal())}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-400">Wallet Balance</Text>
              <Text className="text-white font-semibold">{formatCurrency(balance)}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleTrade}
            disabled={isExecuting}
            className={`rounded-xl py-4 items-center ${
              tradeType === 'buy' ? 'bg-green-500' : 'bg-red-500'
            } ${isExecuting ? 'opacity-50' : ''}`}
          >
            {isExecuting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {tradeType === 'buy' ? 'BUY' : 'SELL'} {symbol || 'STOCK'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showSearch} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/80">
          <View className="flex-1 mt-20 bg-slate-900 rounded-t-3xl">
            <View className="flex-row items-center px-6 py-4 border-b border-slate-800">
              <TouchableOpacity onPress={() => setShowSearch(false)}>
                <Icon name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold ml-4">Search Stocks</Text>
            </View>
            <View className="px-6 py-4">
              <View className="flex-row items-center bg-slate-800 rounded-xl px-4 border border-slate-700">
                <Icon name="magnify" size={20} color="#94a3b8" />
                <TextInput
                  className="flex-1 text-white py-3 px-3"
                  placeholder="Search by symbol or name..."
                  placeholderTextColor="#64748b"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
              </View>
            </View>
            <ScrollView className="flex-1 px-6">
              {isSearching ? (
                <View className="py-10">
                  <ActivityIndicator size="large" color="#3b82f6" />
                </View>
              ) : searchResults.length > 0 ? (
                searchResults.map((stock, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSearch(stock)}
                    className="bg-slate-800 rounded-xl p-4 mb-3 border border-slate-700"
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className="text-white text-lg font-bold">{stock.symbol}</Text>
                        <Text className="text-slate-400 text-sm">{stock.name}</Text>
                      </View>
                      {stock.lastPrice && (
                        <Text className="text-white font-semibold">{formatCurrency(stock.lastPrice)}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              ) : searchQuery.length >= 2 ? (
                <Text className="text-slate-400 text-center py-10">No stocks found</Text>
              ) : (
                <Text className="text-slate-400 text-center py-10">Type to search stocks</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showConfirm} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/80 justify-center items-center px-6">
          <View className="bg-slate-900 rounded-2xl p-6 w-full border border-slate-800">
            <Text className="text-white text-2xl font-bold mb-4 text-center">Confirm Trade</Text>
            <View className="bg-slate-800 rounded-xl p-4 mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-400">Type</Text>
                <Text
                  className={`font-bold ${tradeType === 'buy' ? 'text-green-400' : 'text-red-400'}`}
                >
                  {tradeType.toUpperCase()}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-400">Symbol</Text>
                <Text className="text-white font-semibold">{symbol.toUpperCase()}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-400">Quantity</Text>
                <Text className="text-white font-semibold">{quantity} shares</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-400">Price</Text>
                <Text className="text-white font-semibold">{formatCurrency(parseFloat(price))}</Text>
              </View>
              <View className="border-t border-slate-700 my-2" />
              <View className="flex-row justify-between">
                <Text className="text-slate-300 font-semibold">Total</Text>
                <Text className="text-white text-xl font-bold">{formatCurrency(calculateTotal())}</Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowConfirm(false)}
                className="flex-1 bg-slate-800 rounded-xl py-3"
              >
                <Text className="text-white text-center font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmTrade}
                disabled={isExecuting}
                className={`flex-1 rounded-xl py-3 ${
                  tradeType === 'buy' ? 'bg-green-500' : 'bg-red-500'
                } ${isExecuting ? 'opacity-50' : ''}`}
              >
                {isExecuting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-semibold">Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TradeScreen;
