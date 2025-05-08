import "dotenv/config";

export default {
  expo: {
    name: "Home_Service_Finder",
    slug: "Home_Service_Finder",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    android: {
      package: "com.yourcompany.homeservicefinder", // Added package name for Android
      permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      navigationBarColor: "#FFFFFF",
    },
    androidNavigationBar: {
      backgroundColor: "#FFFFFF",
      barStyle: "light-content",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        // Added location plugin configuration
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow Home Service Finder to use your location.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      IMAGE_API_URL: process.env.IMAGE_API_URL,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      BACKEND_API_URL: process.env.BACKEND_API_URL,

      eas: {
        projectId: "your-eas-project-id",
      },
    },
  },
};
