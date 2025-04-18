import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { router } from "expo-router";

export default function Landing() {
  const handleGetStarted = () => {
    router.push("/(auth)/login"); // Using Expo Router's navigation
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saiman Landing</Text>
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
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  button: {
    backgroundColor: "#000000",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});

// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   FlatList,
//   Image,
//   NativeSyntheticEvent,
//   NativeScrollEvent,
// } from "react-native";
// import React, { useState, useRef } from "react";
// import { router } from "expo-router";

// interface SlideItem {
//   id: string;
//   title: string;
//   description: string;
//   image: any; // Changed from string to any for pre-required images
// }

// export default function Landing() {
//   const [currentSlide, setCurrentSlide] = useState<number>(0);
//   const flatListRef = useRef<FlatList<SlideItem>>(null);
//   const { width } = Dimensions.get("window");

//   // Pre-require the images directly in the slides array
//   const slides: SlideItem[] = [
//     {
//       id: "1",
//       title: "Welcome to Saiman",
//       description: "Your personal digital companion for daily tasks",
//       image: require("@/assets/images/Home_Service_Finder_Logo.png"),
//     },
//     {
//       id: "2",
//       title: "Powerful Features",
//       description:
//         "Discover a suite of tools designed to make your life easier",
//       image: require("@/assets/images/Home_Service_Finder_Logo.png"),
//     },
//     {
//       id: "3",
//       title: "Get Started Now",
//       description: "Join our community and experience the difference",
//       image: require("@/assets/images/Home_Service_Finder_Logo.png"),
//     },
//   ];

//   const handleGetStarted = (): void => {
//     router.push("/(auth)/login");
//   };

//   const handleSlideChange = (index: number): void => {
//     setCurrentSlide(index);
//     flatListRef.current?.scrollToIndex({
//       index,
//       animated: true,
//     });
//   };

//   const renderSlide = ({ item }: { item: SlideItem }): React.ReactElement => {
//     return (
//       <View style={[styles.slide, { width }]}>
//         <Image
//           source={item.image} // Fixed: using pre-required image directly
//           style={styles.slideImage}
//           resizeMode="contain"
//         />
//         <Text style={styles.slideTitle}>{item.title}</Text>
//         <Text style={styles.slideDescription}>{item.description}</Text>
//       </View>
//     );
//   };

//   const renderDotIndicator = (): React.ReactElement => {
//     return (
//       <View style={styles.pagination}>
//         {slides.map((_, index) => (
//           <TouchableOpacity
//             key={index}
//             style={[
//               styles.paginationDot,
//               { opacity: currentSlide === index ? 1 : 0.3 },
//             ]}
//             onPress={() => handleSlideChange(index)}
//           />
//         ))}
//       </View>
//     );
//   };

//   const handleScroll = (
//     event: NativeSyntheticEvent<NativeScrollEvent>
//   ): void => {
//     const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
//     if (slideIndex !== currentSlide) {
//       setCurrentSlide(slideIndex);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <FlatList
//         ref={flatListRef}
//         data={slides}
//         renderItem={renderSlide}
//         keyExtractor={(item) => item.id}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         onMomentumScrollEnd={handleScroll}
//         style={styles.carousel}
//       />

//       {renderDotIndicator()}

//       <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
//         <Text style={styles.buttonText}>Get Started</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f5f5f5",
//   },
//   // appTitle: {
//   // //   fontSize: 28,
//   // //   fontWeight: "bold",
//   // //   marginTop: 60,
//   // //   marginBottom: 20,
//   // //   color: "#333",
//   // // },
//   // // carousel: {
//   // //   flex: 1,
//   // // },
//   slide: {
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   slideImage: {
//     width: 200,
//     height: 200,
//     marginBottom: 40,
//   },
//   slideTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 10,
//     color: "#333",
//     textAlign: "center",
//   },
//   slideDescription: {
//     fontSize: 16,
//     color: "#666",
//     textAlign: "center",
//     paddingHorizontal: 30,
//     marginBottom: 20,
//   },
//   pagination: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginBottom: 40,
//   },
//   paginationDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: "#000",
//     marginHorizontal: 5,
//   },
//   button: {
//     backgroundColor: "#000000",
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 25,
//     marginBottom: 50,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//   },
//   buttonText: {
//     color: "white",
//     fontSize: 18,
//     fontWeight: "600",
//   },
// });
