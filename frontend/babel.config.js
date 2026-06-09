module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'nativewind/babel',
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        envName: 'APP_ENV',
        path: '.env',
        blocklist: null,
        allowlist: null,
        blacklist: null, // deprecated but keep for compatibility
        whitelist: null, // deprecated but keep for compatibility
        safe: false,
        allowUndefined: true,
        verbose: false,
      },
    ],
  ],
};