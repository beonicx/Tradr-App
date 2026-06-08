import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import Toast from 'react-native-toast-message';
import {
  fetchWallet,
  createDepositOrder,
  verifyDeposit,
  clearError,
} from '../../store/slices/walletSlice';

const WalletScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { balance, availableBalance, totalDeposited, totalWithdrawn, isLoading, isDepositing, error } =
    useSelector((s) => s.wallet);
  const { user } = useSelector((s) => s.auth);

  const [showDeposit, setShowDeposit] = useState(false);
  const [amount, setAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const quickAmounts = [500, 1000, 5000, 10000];

  useEffect(() => {
    dispatch(fetchWallet());
  }, []);

  useEffect(() => {
    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error });
      dispatch(clearError());
    }
  }, [error]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchWallet());
    setRefreshing(false);
  };

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);

    if (!depositAmount || depositAmount < 100) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Minimum deposit is ₹100' });
      return;
    }

    try {
      const orderResult = await dispatch(createDepositOrder(depositAmount)).unwrap();

      const options = {
        description: 'Add funds to trading wallet',
        image: 'https://your-app-logo-url.com/logo.png',
        currency: 'INR',
        key: orderResult.razorpayKeyId,
        amount: orderResult.amount,
        name: 'TradePro',
        order_id: orderResult.orderId,
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        },
        theme: { color: '#3b82f6' },
      };

      RazorpayCheckout.open(options)
        .then(async (data) => {
          const verifyData = {
            razorpayOrderId: data.razorpay_order_id,
            razorpayPaymentId: data.razorpay_payment_id,
            razorpaySignature: data.razorpay_signature,
            amount: depositAmount,
          };

          await dispatch(verifyDeposit(verifyData)).unwrap();
          Toast.show({
            type: 'success',
            text1: 'Deposit Successful',
            text2: `₹${depositAmount} added to your wallet`,
          });
          setAmount('');
          setShowDeposit(false);
          dispatch(fetchWallet());
        })
        .catch((error) => {
          Toast.show({ type: 'error', text1: 'Payment Failed', text2: error.description || 'Please try again' });
        });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message || 'Failed to create order' });
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-900 px-6 pt-14 pb-6 border-b border-slate-800">
        <Text className="text-white text-3xl font-bold mb-4">Wallet</Text>
        <View className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6">
          <Text className="text-blue-200 text-sm mb-2">Available Balance</Text>
          <Text className="text-white text-4xl font-bold mb-4">{formatCurrency(availableBalance)}</Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-blue-200 text-xs mb-1">Total Deposited</Text>
              <Text className="text-white text-base font-semibold">{formatCurrency(totalDeposited)}</Text>
            </View>
            <View>
              <Text className="text-blue-200 text-xs mb-1">Total Withdrawn</Text>
              <Text className="text-white text-base font-semibold">{formatCurrency(totalWithdrawn)}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
      >
        <View className="px-6 py-6">
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={() => setShowDeposit(true)}
              className="flex-1 bg-green-500 rounded-xl py-4 flex-row items-center justify-center"
            >
              <Icon name="plus-circle" size={24} color="#fff" />
              <Text className="text-white font-bold text-lg ml-2">Add Funds</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('TransactionHistory')}
              className="flex-1 bg-slate-800 rounded-xl py-4 flex-row items-center justify-center border border-slate-700"
            >
              <Icon name="history" size={24} color="#94a3b8" />
              <Text className="text-white font-bold text-lg ml-2">History</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-slate-900 rounded-2xl p-6 mb-6 border border-slate-800">
            <Text className="text-white text-lg font-bold mb-4">Quick Actions</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Trade')}
              className="flex-row items-center bg-slate-800 rounded-xl p-4 mb-3 border border-slate-700"
            >
              <View className="w-12 h-12 bg-blue-500/20 rounded-full items-center justify-center">
                <Icon name="swap-horizontal" size={24} color="#3b82f6" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-white font-semibold text-base">Start Trading</Text>
                <Text className="text-slate-400 text-sm">Buy and sell stocks</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Portfolio')}
              className="flex-row items-center bg-slate-800 rounded-xl p-4 border border-slate-700"
            >
              <View className="w-12 h-12 bg-purple-500/20 rounded-full items-center justify-center">
                <Icon name="briefcase" size={24} color="#a855f7" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-white font-semibold text-base">View Portfolio</Text>
                <Text className="text-slate-400 text-sm">Check your holdings</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <Text className="text-white text-lg font-bold mb-4">Payment Information</Text>
            <View className="flex-row items-center mb-3">
              <Icon name="shield-check" size={20} color="#4ade80" />
              <Text className="text-slate-300 ml-3">Secure payments via Razorpay</Text>
            </View>
            <View className="flex-row items-center mb-3">
              <Icon name="lock" size={20} color="#4ade80" />
              <Text className="text-slate-300 ml-3">256-bit SSL encryption</Text>
            </View>
            <View className="flex-row items-center">
              <Icon name="lightning-bolt" size={20} color="#4ade80" />
              <Text className="text-slate-300 ml-3">Instant deposit confirmation</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showDeposit} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/80 justify-center items-center px-6">
          <View className="bg-slate-900 rounded-2xl p-6 w-full border border-slate-800">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-2xl font-bold">Add Funds</Text>
              <TouchableOpacity onPress={() => setShowDeposit(false)}>
                <Icon name="close" size={28} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-slate-300 mb-2 font-medium">Enter Amount</Text>
              <View className="flex-row items-center bg-slate-800 rounded-xl px-4 border border-slate-700">
                <Icon name="currency-inr" size={24} color="#94a3b8" />
                <TextInput
                  className="flex-1 text-white py-4 px-3 text-2xl"
                  placeholder="0"
                  placeholderTextColor="#64748b"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
              </View>
              <Text className="text-slate-400 text-sm mt-2">Minimum deposit: ₹100</Text>
            </View>

            <View className="mb-6">
              <Text className="text-slate-300 mb-3 font-medium">Quick Select</Text>
              <View className="flex-row flex-wrap gap-2">
                {quickAmounts.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => setAmount(amt.toString())}
                    className="bg-slate-800 px-6 py-3 rounded-xl border border-slate-700"
                  >
                    <Text className="text-white font-semibold">₹{amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleDeposit}
              disabled={isDepositing}
              className={`bg-green-500 rounded-xl py-4 items-center ${isDepositing ? 'opacity-50' : ''}`}
            >
              {isDepositing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg">Proceed to Payment</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center justify-center mt-4">
              <Icon name="shield-check" size={16} color="#4ade80" />
              <Text className="text-slate-400 text-sm ml-2">Secured by Razorpay</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WalletScreen;
