import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-gifted-charts";

type TimePeriod = "1 day" | "1 week" | "1 month";

interface DeviceGraphsContentProps {
  deviceId: number;
}

export const DeviceGraphsContent: React.FC<DeviceGraphsContentProps> = ({
  deviceId,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1 day");

  // Mock data generator based on time period
  const chartData = useMemo(() => {
    const periods: Record<TimePeriod, number> = {
      "1 day": 24, // 24 hours
      "1 week": 7, // 7 days
      "1 month": 30, // 30 days
    };

    const dataPoints = periods[selectedPeriod];
    const data = [];

    for (let i = 0; i < dataPoints; i++) {
      // Generate random energy consumption data (in kWh)
      const baseValue = 50;
      const variation = Math.random() * 80 + 10; // Random value between 10-90
      const value = Math.round(baseValue + variation);

      let label = "";
      if (selectedPeriod === "1 day") {
        // Show hours
        label = `${i.toString().padStart(2, "0")}:00`;
      } else if (selectedPeriod === "1 week") {
        // Show days
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        label = days[i % 7];
      } else {
        // Show dates for month
        label = `${i + 1}`;
      }

      data.push({
        value,
        label,
        labelTextStyle: {
          color: "#9CA3AF",
          fontSize: 10,
        },
        frontColor: "#7C3AED",
        gradientColor: "#7C3AED",
      });
    }

    return data;
  }, [selectedPeriod]);

  const timePeriods: TimePeriod[] = ["1 day", "1 week", "1 month"];

  return (
    <ScrollView className="flex-1 px-4 pt-6">
      {/* Filter Buttons */}
      <View className="flex-row gap-2 mb-6">
        {timePeriods.map((period) => (
          <TouchableOpacity
            key={period}
            onPress={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg ${
              selectedPeriod === period
                ? "bg-[#7C3AED]"
                : "bg-gray-800 border border-gray-700"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedPeriod === period ? "text-white" : "text-gray-400"
              }`}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart Container */}
      <View className="bg-gray-800 rounded-2xl p-4 mb-6">
        <Text className="text-white text-lg font-semibold mb-4">
          Energy Consumption ({selectedPeriod})
        </Text>

        <View className="items-center">
          <LineChart
            data={chartData}
            width={300}
            height={200}
            spacing={
              selectedPeriod === "1 day"
                ? 25
                : selectedPeriod === "1 week"
                ? 35
                : 15
            }
            thickness={3}
            color="#7C3AED"
            hideRules
            hideYAxisText={false}
            yAxisColor="#9CA3AF"
            xAxisColor="#9CA3AF"
            yAxisTextStyle={{ color: "#9CA3AF", fontSize: 10 }}
            backgroundColor="transparent"
            curved
            areaChart
            startFillColor="#7C3AED"
            endFillColor="rgba(124, 58, 237, 0.1)"
            startOpacity={0.9}
            endOpacity={0.2}
            hideDataPoints={chartData.length > 20}
            dataPointsColor="#7C3AED"
            dataPointsRadius={3}
            textShiftY={-2}
            textShiftX={-5}
            textFontSize={10}
            textColor="#9CA3AF"
          />
        </View>

        {/* Chart Stats */}
        <View className="mt-6 pt-4 border-t border-gray-700">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-400 text-sm">Average</Text>
            <Text className="text-white text-sm font-semibold">
              {Math.round(
                chartData.reduce((sum, item) => sum + item.value, 0) /
                  chartData.length
              )}{" "}
              kWh
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-400 text-sm">Max</Text>
            <Text className="text-white text-sm font-semibold">
              {Math.max(...chartData.map((item) => item.value))} kWh
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400 text-sm">Min</Text>
            <Text className="text-white text-sm font-semibold">
              {Math.min(...chartData.map((item) => item.value))} kWh
            </Text>
          </View>
        </View>
      </View>

      {/* Additional Info */}
      <View className="bg-gray-800 rounded-2xl p-4">
        <Text className="text-white text-base font-semibold mb-2">
          Energy Usage Overview
        </Text>
        <Text className="text-gray-400 text-sm leading-5">
          This graph shows the energy consumption pattern over the selected time
          period. Use the filters above to view different time ranges.
        </Text>
      </View>
    </ScrollView>
  );
};
