import {Platform} from 'react-native';
import {isARSupportedOnDevice} from '@reactvision/react-viro';

const ANDROID_MIN_API_FOR_ARCORE = 26;

const getAndroidApiLevel = () => {
  const version = Platform.Version;
  if (typeof version === 'string') {
    const parsed = parseInt(version, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return version;
};

export async function isARSupportedRough(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    // Modern iOS devices running ARKit-capable versions handle the AR scene.
    return true;
  }

  if (Platform.OS === 'android') {
    if (getAndroidApiLevel() < ANDROID_MIN_API_FOR_ARCORE) {
      return false;
    }

    try {
      const result = await isARSupportedOnDevice();
      return !!result?.isARSupported;
    } catch (error) {
      return false;
    }
  }

  return false;
}
