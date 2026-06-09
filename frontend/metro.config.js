const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * Enhanced for multi-platform development (iOS + Android simultaneously)
 */
const config = {
  server: {
    // Use a specific port for consistency across platforms
    port: 8081,
  },
  resolver: {
    // Support platform-specific extensions
    platforms: ['ios', 'android'],
  },
  watchFolders: [],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);