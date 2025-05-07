import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, Image, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import React, { useState, useRef } from "react";
import { router } from "expo-router";

interface SlideItem {
  id: string;
  title: string;
  description: string;
  image: any;
}

export default function Landing(): React.ReactElement {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);
  const { width } = Dimensions.get("window");

  const slides: SlideItem[] = [
    {
      id: "1",
      title: "Find Trusted Pros",
      description: "Browse top-rated home service providers near you",
      image: require("@/assets/images/features/Gardener.jpg"),
    },
    {
      id: "2",
      title: "Get Instant Quotes",
      description: "Compare prices & pick the best fit for your budget",
      image: require("@/assets/images/features/cleaning2.jpg"),
    },
    {
      id: "3",
      title: "Track & Relax",
      description: "Monitor your booking in real-time until it’s done",
      image: require("@/assets/images/features/Gardener.jpg"),
    },
  ];

  const handleGetStarted = (): void => {
    router.push("/(auth)/login"); // Using Expo Router's navigation
  };

  const handleSlideChange = (index: number): void => {
    setCurrentSlide(index);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  const renderSlide = ({ item }: { item: SlideItem }): React.ReactElement => {
    return (
      <View style={[styles.slide, { width }]}>
        <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    );
  };

  const renderDotIndicator = (): React.ReactElement => {
    return (
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <TouchableOpacity key={index} style={[styles.paginationDot, { backgroundColor: currentSlide === index ? "#3F63C7" : "#D0D0D0" }]} onPress={() => handleSlideChange(index)} />
        ))}
      </View>
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
    }
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <View style={styles.logoInnerCircle}>
            <Image
              source={require("@/assets/images/logo2.png")} // Replace with your actual logo
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
        <Text style={styles.appName}>TravelWith</Text>
      </View> */}

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.carousel}
      />

      {renderDotIndicator()}

      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F3FC",
    justifyContent: "center",
    alignItems: "center",
  },
  logoInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0E7FB",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    tintColor: "#3F63C7",
  },
  appName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginTop: 8,
  },
  carousel: {
    flex: 1,
  },
  slide: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  slideImage: {
    width: 450,
    height: 450,
    marginBottom: 20,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  slideDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 25,
    marginBottom: 10,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: "#3F63C7", // Using the blue color you specified
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 15,
    marginBottom: 80,
    width: "90%",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
