import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, SafeAreaView, ScrollView } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchServiceCategories, setSelectedCategoryId } from "@/store/slice/serviceCategory";
import Constants from "expo-constants";

interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  categoryImage?: string;
}

export default function ServiceCategoryScreen() {
  const dispatch = useAppDispatch();

  const IMAGE_API_URL = Constants.expoConfig?.extra?.IMAGE_API_URL ?? "default_value";

  const { isLoading, categories, error, serviceCategoryId } = useAppSelector((state) => state.serviceCategory);

  useEffect(() => {
    dispatch(fetchServiceCategories());
  }, [dispatch]);

  // Clean up selected category when navigating away
  useEffect(() => {
    return () => {
      // This will run when component unmounts (user navigates away)
      dispatch(setSelectedCategoryId(null));
    };
  }, [dispatch]);

  const handleCategorySelect = (categoryId: string) => {
    if (serviceCategoryId === categoryId) {
      dispatch(setSelectedCategoryId(null));
    } else {
      dispatch(setSelectedCategoryId(categoryId));
    }
  };

  const handleContinue = () => {
    if (serviceCategoryId) {
      router.push("/signUp");
    }
  };

  const handleBack = () => {
    // Clear the selected category when going back
    dispatch(setSelectedCategoryId(null));
    router.back();
  };

  const renderCategoryGrid = () => {
    const rows = [];
    for (let i = 0; i < categories.length; i += 2) {
      const rowItems = [];
      rowItems.push(
        <View key={categories[i].id} style={styles.gridItem}>
          <TouchableOpacity style={[styles.categoryItem, serviceCategoryId === categories[i].id && styles.selectedItem]} onPress={() => handleCategorySelect(categories[i].id)}>
            <Image
              source={categories[i].categoryImage ? { uri: `${IMAGE_API_URL}${categories[i].categoryImage}` } : require("@/assets/images/gardener.png")}
              style={styles.categoryImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.categoryName}>{categories[i].name.charAt(0).toUpperCase() + categories[i].name.slice(1).toLowerCase()}</Text>
        </View>
      );

      if (i + 1 < categories.length) {
        rowItems.push(
          <View key={categories[i + 1].id} style={styles.gridItem}>
            <TouchableOpacity style={[styles.categoryItem, serviceCategoryId === categories[i + 1].id && styles.selectedItem]} onPress={() => handleCategorySelect(categories[i + 1].id)}>
              <Image
                source={categories[i + 1].categoryImage ? { uri: `${IMAGE_API_URL}${categories[i + 1].categoryImage}` } : require("@/assets/images/gardener.png")}
                style={styles.categoryImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.categoryName}>{categories[i + 1].name.charAt(0).toUpperCase() + categories[i + 1].name.slice(1).toLowerCase()}</Text>
          </View>
        );
      } else {
        rowItems.push(<View key="empty" style={styles.gridItem} />);
      }

      rows.push(
        <View key={`row-${i}`} style={styles.gridRow}>
          {rowItems}
        </View>
      );
    }

    return rows;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Select Service Category</Text>
            <Text style={styles.subtitle}>Choose the category that best describes your service</Text>
          </View>

          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#3F63C7" />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>{renderCategoryGrid()}</View>
          )}

          <TouchableOpacity style={[styles.continueButton, !serviceCategoryId && styles.disabledButton]} onPress={handleContinue} disabled={!serviceCategoryId}>
            <Text style={styles.continueButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    marginTop: 50,
  },
  subtitle: {
    fontSize: 13,
    color: "#808080",
    fontWeight: "500",
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  gridContainer: {
    width: "100%",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gridItem: {
    width: "48%", // Slightly less than 50% to accommodate spacing
  },
  categoryItem: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dedede",
    overflow: "hidden",
    height: 140,
  },
  selectedItem: {
    borderColor: "#3F63C7",
    borderWidth: 2,
    shadowColor: "#3F63C7",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginTop: 8,
    textAlign: "center",
  },
  continueButton: {
    height: 55,
    backgroundColor: "#3F63C7",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  disabledButton: {
    backgroundColor: "#dedede",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 16,
    textAlign: "center",
  },
});
