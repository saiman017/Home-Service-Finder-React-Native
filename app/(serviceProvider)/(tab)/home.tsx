import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, StatusBar, ActivityIndicator, Dimensions, FlatList } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppDispatch, RootState } from "@/store/store";
import { fetchUserById, selectUserById } from "@/store/slice/user";
import { fetchLocation } from "@/store/slice/location";
import { useServiceOfferSignalR } from "@/hooks/useServiceOfferSignalR";
import { fetchProviderStatistics } from "@/store/slice/serviceProvider";
import Constants from "expo-constants";

const { width } = Dimensions.get("window");
const IMAGE_API_URL = Constants.expoConfig?.extra?.IMAGE_API_URL ?? "default_value";

interface ChartData {
  id: string;
  title: string;
  image: any;
}

const chartData: ChartData[] = [
  {
    id: "1",
    title: "Weekly Earnings",
    image: require("@/assets/images/features/featureImage1.jpeg"),
  },
  {
    id: "2",
    title: "Monthly Earnings",
    image: require("@/assets/images/features/featureImage1.jpeg"),
  },
  {
    id: "3",
    title: "Request Completion Rate",
    image: require("@/assets/images/features/featureImage1.jpeg"),
  },
  {
    id: "4",
    title: "Customer Ratings",
    image: require("@/assets/images/features/featureImage1.jpeg"),
  },
];

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentLocation } = useSelector((state: RootState) => state.location);
  const { userId } = useSelector((state: RootState) => state.auth);
  const currentUser = useSelector(selectUserById) || null;
  const { connected } = useServiceOfferSignalR(userId);
  const { statistics, isLoading } = useSelector((state: RootState) => state.serviceProvider);

  // For chart carousel
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList<ChartData>>(null);

  // Mock data for dashboard stats
  const [stats, setStats] = useState({
    totalEarnings: "$1,250.00",
    totalCompletedRequests: 28,
    todayEarnings: "$120.00",
    todayCompletedRequests: 3,
    isLoading: false,
  });

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
      dispatch(fetchLocation(userId));
      dispatch(fetchProviderStatistics(userId));

      fetchDashboardStats();
    }
  }, [dispatch]);
  console.log(statistics);

  useEffect(() => {
    console.log("Offer SignalR connected:", connected);
  }, [connected]);

  // Simulate fetching dashboard stats
  const fetchDashboardStats = () => {
    setStats({
      ...stats,
      isLoading: true,
    });

    // Simulate API call delay
    setTimeout(() => {
      setStats({
        totalEarnings: "$1,250.00",
        totalCompletedRequests: 28,
        todayEarnings: "$120.00",
        todayCompletedRequests: 3,
        isLoading: false,
      });
    }, 1000);
  };

  // Auto-scroll carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeSlideIndex === chartData.length - 1) {
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
      } else {
        flatListRef.current?.scrollToIndex({
          index: activeSlideIndex + 1,
          animated: true,
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeSlideIndex]);

  const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setActiveSlideIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const goToProfile = () => {
    router.push("/(users)/userProfile");
  };

  const goToLocationSelect = () => {
    router.push("/(users)/(location)/setAddress");
  };

  const displayAddress = currentLocation ? `${currentLocation.address.slice(0, 30)}${currentLocation.address.length > 30 ? "..." : ""}` : "Set your location";

  // Chart Carousel Item
  const renderChartItem = ({ item }: { item: ChartData }) => (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{item.title}</Text>
      <Image source={item.image} style={styles.chartImage} resizeMode="cover" />
    </View>
  );

  // Carousel pagination dots
  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {chartData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === activeSlideIndex ? "#525050" : "#DDDDDD",
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require("@/assets/images/logo2.png")} style={{ width: 115, height: 75 }} resizeMode="contain" />
        </View>
        <TouchableOpacity onPress={goToProfile}>
          {currentUser?.profilePicture ? (
            <Image
              source={{
                uri: `${IMAGE_API_URL}${currentUser.profilePicture}`,
              }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImage}>
              <Text style={styles.initialsText}>{`${currentUser?.firstName?.[0] || ""}${currentUser?.lastName?.[0] || ""}`}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Location Bar */}
      <TouchableOpacity style={styles.locationBar} onPress={goToLocationSelect}>
        <Ionicons name="location" size={13} color="#525050" />
        <Text style={styles.locationText}>{displayAddress}</Text>
        <Ionicons name="chevron-forward" size={13} color="#525050" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Stats Boxes */}
        {stats.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3F63C7" />
          </View>
        ) : (
          <>
            <View style={styles.dashBoard}>
              <View style={styles.statsRow}>
                <View style={[styles.statsBox, styles.totalEarningsBox]}>
                  <Text style={styles.statsTitle}>Total Earnings</Text>
                  <Text style={styles.statsValue}>NPR {statistics?.totalEarnings}</Text>
                  <Ionicons name="cash-outline" size={24} color="#FFFFFF" style={styles.statsIcon} />
                </View>

                <View style={[styles.statsBox, styles.totalCompletedBox]}>
                  <Text style={styles.statsTitle}>Total Completed</Text>
                  <Text style={styles.statsValue}>{statistics?.totalCompletedOffers}</Text>
                  <Ionicons name="checkmark-done-circle-outline" size={24} color="#FFFFFF" style={styles.statsIcon} />
                </View>
              </View>

              {/* Second Row */}
              <View style={styles.statsRow}>
                <View style={[styles.statsBox, styles.todayEarningsBox]}>
                  <Text style={styles.statsTitle}>Today's Earnings</Text>
                  <Text style={styles.statsValue}>NPR {statistics?.totalRevenueToday}</Text>
                  <Ionicons name="today-outline" size={24} color="#FFFFFF" style={styles.statsIcon} />
                </View>

                <View style={[styles.statsBox, styles.todayCompletedBox]}>
                  <Text style={styles.statsTitle}>Today's Completed</Text>
                  <Text style={styles.statsValue}>{statistics?.totalOffersCompletedToday}</Text>
                  <Ionicons name="star-outline" size={24} color="#FFFFFF" style={styles.statsIcon} />
                </View>
              </View>
            </View>
            {/* First Row */}
          </>
        )}

        {/* Chart Section */}
        {/* <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Performance Analytics</Text>
          <FlatList
            ref={flatListRef}
            data={chartData}
            renderItem={renderChartItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            contentContainerStyle={styles.carouselContainer}
          />
          {renderPaginationDots()}
        </View> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    height: 70,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    height: 65,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 6,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  dashBoard: {
    paddingTop: 16,
    paddingHorizontal: 12,
    // marginTop: 10,
    backgroundColor: "#FFFFFF",
    height: 340,
    shadowColor: "#dedede",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    color: "#525050",
  },
  dashboardHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
  },
  dashboardHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  loadingContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  statsBox: {
    width: "48%",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    height: 130,
    position: "relative",
  },
  // Different background colors for each stats box
  totalEarningsBox: {
    backgroundColor: "#4CAF50", // Green
  },
  totalCompletedBox: {
    backgroundColor: "#2196F3", // Blue
  },
  todayEarningsBox: {
    backgroundColor: "#F8C52B", // Yellow
  },
  todayCompletedBox: {
    backgroundColor: "#FF5722", // Orange
  },
  statsTitle: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 10,
    fontWeight: "500",
  },
  statsValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statsIcon: {
    position: "absolute",
    bottom: 12,
    right: 12,
  },
  sectionContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    height: 330,
    shadowColor: "#dedede",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333333",
  },
  carouselContainer: {
    height: 190,
  },
  chartCard: {
    width: width - 32,
    height: 300,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    padding: 10,
    backgroundColor: "#FFFFFF",
    color: "#333333",
  },
  chartImage: {
    width: "100%",
    height: "80%",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    marginBottom: 4,
  },
});
