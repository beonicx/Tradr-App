import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { searchStocks, clearSearch } from '../../store/slices/marketSlice';

const SearchScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { searchResults, isSearching } = useSelector((s) => s.market);
  const [query, setQuery] = useState('');

  useEffect(() => {
    return () => {
      dispatch(clearSearch());
    };
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => {
        dispatch(searchStocks(query));
      }, 500);
      return () => clearTimeout(timer);
    } else {
      dispatch(clearSearch());
    }
  }, [query]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-900 px-6 pt-14 pb-6 border-b border-slate-800">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold ml-4">Search Stocks</Text>
        </View>
        <View className="flex-row items-center bg-slate-800 rounded-xl px-4 border border-slate-700">
          <Icon name="magnify" size={24} color="#94a3b8" />
          <TextInput
            className="flex-1 text-white py-4 px-3 text-lg"
            placeholder="Search by symbol or name..."
            placeholderTextColor="#64748b"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon name="close-circle" size={24} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {isSearching ? (
            <View className="py-10">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-slate-400 text-center mt-4">Searching...</Text>
            </View>
          ) : query.length === 0 ? (
            <View className="bg-slate-900 rounded-2xl p-10 items-center border border-slate-800">
              <Icon name="file-search-outline" size={80} color="#475569" />
              <Text className="text-white text-xl font-bold mt-4 mb-2">Search Stocks</Text>
              <Text className="text-slate-400 text-center">
                Enter a stock symbol or company name to start searching
              </Text>
            </View>
          ) : query.length < 2 ? (
            <View className="bg-slate-900 rounded-2xl p-10 items-center border border-slate-800">
              <Icon name="information-outline" size={60} color="#475569" />
              <Text className="text-slate-400 text-center mt-4">
                Type at least 2 characters to search
              </Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View className="bg-slate-900 rounded-2xl p-10 items-center border border-slate-800">
              <Icon name="alert-circle-outline" size={60} color="#475569" />
              <Text className="text-white text-xl font-bold mt-4 mb-2">No Results Found</Text>
              <Text className="text-slate-400 text-center">
                No stocks found matching "{query}"
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-slate-400 text-sm mb-4">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </Text>
              {searchResults.map((stock, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate('StockDetail', { symbol: stock.symbol })}
                  className="bg-slate-900 rounded-xl p-4 mb-3 border border-slate-800"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-white text-lg font-bold">{stock.symbol}</Text>
                      <Text className="text-slate-400 text-sm" numberOfLines={2}>
                        {stock.name}
                      </Text>
                    </View>
                    {stock.lastPrice && (
                      <View className="items-end ml-4">
                        <Text className="text-white text-lg font-bold">
                          {formatCurrency(stock.lastPrice)}
                        </Text>
                        {stock.change !== undefined && (
                          <View className="flex-row items-center mt-1">
                            <Icon
                              name={stock.change >= 0 ? 'arrow-up' : 'arrow-down'}
                              size={14}
                              color={stock.change >= 0 ? '#4ade80' : '#f87171'}
                            />
                            <Text
                              className={`text-sm font-semibold ml-1 ${
                                stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {stock.changePercent?.toFixed(2)}%
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                  {stock.type && (
                    <View className="flex-row items-center mt-2">
                      <View className="bg-slate-800 px-3 py-1 rounded-full">
                        <Text className="text-slate-300 text-xs uppercase">{stock.type}</Text>
                      </View>
                      {stock.market && (
                        <View className="bg-slate-800 px-3 py-1 rounded-full ml-2">
                          <Text className="text-slate-300 text-xs uppercase">{stock.market}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SearchScreen;
