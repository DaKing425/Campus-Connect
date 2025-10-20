// Babel config for Expo + NativeWind
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Re-enable NativeWind: use explicit array form with options object
  plugins: [['nativewind/babel', {}], 'react-native-reanimated/plugin'],
  };
};
