import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const PortfolioChart = ({ holdings }) => {
  if (!holdings || holdings.length === 0) {
    return null;
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const chartData = holdings
    .filter((h) => h.currentValue > 0)
    .slice(0, 8)
    .map((holding, index) => ({
      name: holding.symbol,
      value: holding.currentValue,
      color: colors[index % colors.length],
      legendFontColor: '#94a3b8',
      legendFontSize: 12,
    }));

  if (chartData.length === 0) {
    return null;
  }

  return (
    <View className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
      <Text className="text-white text-base font-bold mb-4">Holdings Distribution</Text>
      <PieChart
        data={chartData}
        width={width - 80}
        height={200}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

export default PortfolioChart;
