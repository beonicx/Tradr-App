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
import { fetchTransactions } from '../../store/slices/walletSlice';
import { format } from 'date-fns';

const TransactionHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { transactions, isLoading } = useSelector((s) => s.wallet);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = () => {
    const params = filter !== 'all' ? { type: filter } : {};
    dispatch(fetchTransactions(params));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return { name: 'arrow-down-circle', color: '#4ade80' };
      case 'withdrawal':
        return { name: 'arrow-up-circle', color: '#f87171' };
      case 'trade_debit':
        return { name: 'minus-circle', color: '#f87171' };
      case 'trade_credit':
        return { name: 'plus-circle', color: '#4ade80' };
      default:
        return { name: 'swap-horizontal-circle', color: '#3b82f6' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-900 px-6 pt-14 pb-6 border-b border-slate-800">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Transactions</Text>
          <View style={{ width: 28 }} />
        </View>
      </View>

      <View className="px-6 py-4">
        <View className="flex-row bg-slate-900 rounded-xl p-1 border border-slate-800">
          {['all', 'deposit', 'withdrawal'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg ${filter === f ? 'bg-blue-500' : ''}`}
            >
              <Text
                className={`text-center font-semibold text-sm capitalize ${
                  filter === f ? 'text-white' : 'text-slate-400'
                }`}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading && transactions.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        >
          <View className="px-6 pb-6">
            {transactions.length === 0 ? (
              <View className="bg-slate-900 rounded-2xl p-10 items-center border border-slate-800">
                <Icon name="receipt-text-outline" size={60} color="#475569" />
                <Text className="text-white text-xl font-bold mt-4 mb-2">No Transactions</Text>
                <Text className="text-slate-400 text-center">Your transaction history will appear here</Text>
              </View>
            ) : (
              transactions.map((txn, index) => {
                const icon = getTransactionIcon(txn.type);
                const isCredit = ['deposit', 'trade_credit'].includes(txn.type);
                return (
                  <View key={index} className="bg-slate-900 rounded-xl p-4 mb-3 border border-slate-800">
                    <View className="flex-row items-start">
                      <View className="w-12 h-12 bg-slate-800 rounded-full items-center justify-center">
                        <Icon name={icon.name} size={24} color={icon.color} />
                      </View>
                      <View className="flex-1 ml-4">
                        <View className="flex-row justify-between items-start mb-1">
                          <View className="flex-1">
                            <Text className="text-white text-base font-semibold capitalize">
                              {txn.type.replace('_', ' ')}
                            </Text>
                            {txn.description && (
                              <Text className="text-slate-400 text-sm">{txn.description}</Text>
                            )}
                          </View>
                          <Text
                            className={`text-lg font-bold ${isCredit ? 'text-green-400' : 'text-red-400'}`}
                          >
                            {isCredit ? '+' : '-'}
                            {formatCurrency(Math.abs(txn.amount))}
                          </Text>
                        </View>
                        <View className="flex-row justify-between items-center mt-2">
                          <Text className="text-slate-500 text-xs">
                            {format(new Date(txn.createdAt), 'MMM dd, yyyy HH:mm')}
                          </Text>
                          <View className="flex-row items-center">
                            <View
                              className={`w-2 h-2 rounded-full mr-2 ${
                                txn.status === 'completed'
                                  ? 'bg-green-400'
                                  : txn.status === 'pending'
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                              }`}
                            />
                            <Text className={`text-xs capitalize ${getStatusColor(txn.status)}`}>
                              {txn.status}
                            </Text>
                          </View>
                        </View>
                        {txn.razorpayPaymentId && (
                          <Text className="text-slate-500 text-xs mt-2">
                            Payment ID: {txn.razorpayPaymentId}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default TransactionHistoryScreen;
