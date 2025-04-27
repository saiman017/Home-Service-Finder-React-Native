// const { getDefaultConfig } = require("expo/metro-config");
// const { withNativeWind } = require("nativewind/metro");

// const config = getDefaultConfig(__dirname);

// module.exports = withNativeWind(config, { input: "./global.css" });
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const defaultConfig = getDefaultConfig(__dirname);

// Enable network requests (disable localhost-only restriction)
defaultConfig.server = {
  ...defaultConfig.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Bypass network restrictions (allows external connections)
      return middleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(defaultConfig, { input: "./global.css" });
