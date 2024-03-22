"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
const LINKING_ERROR = `The package 'react-native-compass-heading' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const CompassHeading = _reactNative.NativeModules.CompassHeading ? _reactNative.NativeModules.CompassHeading : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
let listener;
let _start = CompassHeading.start;
CompassHeading.start = async (update_rate, callback) => {
  if (listener) {
    await CompassHeading.stop();
  }
  const compassEventEmitter = new _reactNative.NativeEventEmitter(CompassHeading);
  listener = compassEventEmitter.addListener('HeadingUpdated', data => {
    callback(data);
  });
  return await _start(update_rate === null ? 0 : update_rate);
};
let _stop = CompassHeading.stop;
CompassHeading.stop = async () => {
  listener && listener.remove();
  listener = null;
  await _stop();
};
var _default = CompassHeading;
exports.default = _default;
//# sourceMappingURL=index.js.map