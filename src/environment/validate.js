import { NativeModules } from 'react-native';

if (!NativeModules.ExponentConstants) {
  throw new Error(
    `The Expo SDK requires Expo to run. It appears the native Expo modules are unavailable and this code is not running on Expo. Visit https://docs.expo.io to learn more about developing an Expo project.`
  );
}
