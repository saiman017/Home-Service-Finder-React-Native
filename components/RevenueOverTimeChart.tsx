import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchProviderRevenue } from "@/store/slice/serviceProvider";

// Props including providerId which may be null
interface RevenueOverTimeChartProps {
  providerId: string | null;
}

type GroupBy = "day" | "week" | "month";
const TAB_OPTIONS: { label: string; value: GroupBy }[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

const screenWidth = Dimensions.get("window").width - 32;

export default function RevenueOverTimeChart({ providerId }: RevenueOverTimeChartProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [groupBy, setGroupBy] = useState<GroupBy>("day");

  // Select revenue state by provider
  const { revenue, revenueLoading, revenueError } = useSelector((state: RootState) => state.serviceProvider);

  // Fetch revenue when providerId or groupBy changes
  useEffect(() => {
    if (providerId) {
      dispatch(fetchProviderRevenue({ providerId, groupBy }));
    }
  }, [dispatch, providerId, groupBy]);

  // Loading or no provider yet
  if (!providerId) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loadingText}>No provider specified</Text>
      </View>
    );
  }

  if (revenueLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#465FFF" />
        <Text style={styles.loadingText}>Loading revenue...</Text>
      </View>
    );
  }

  if (revenueError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{revenueError}</Text>
      </View>
    );
  }

  const labels = revenue.map((d) => d.period);
  const values = revenue.map((d) => d.amount);

  // If not enough points or no variation, show placeholder
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const noVariation = values.length < 2 || maxVal === minVal;

  if (noVariation) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loadingText}>Not enough data to plot.</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0 as const,
    color: (opacity = 1) => `rgba(70,95,255,${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#465FFF" },
    style: { borderRadius: 8 },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Revenue Over Time</Text>
        <View style={styles.tabGroup}>
          {TAB_OPTIONS.map((tab) => (
            <TouchableOpacity key={tab.value} style={[styles.tab, groupBy === tab.value && styles.activeTab]} onPress={() => setGroupBy(tab.value)}>
              <Text style={[styles.tabText, groupBy === tab.value && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <LineChart
        data={{ labels, datasets: [{ data: values }] }}
        width={screenWidth}
        height={230}
        chartConfig={chartConfig}
        style={{ marginVertical: 8 }}
        bezier
        withInnerLines={false}
        withVerticalLines={false}
        withHorizontalLines={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    paddingHorizontal: 5,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FEFEFE",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  tabGroup: {
    flexDirection: "row",
  },
  tab: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  activeTab: {
    backgroundColor: "#465FFF",
  },
  tabText: {
    fontSize: 12,
    color: "#333",
  },
  activeTabText: {
    color: "#fff",
  },
  loaderContainer: {
    height: 260,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    height: 260,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
  },
});
