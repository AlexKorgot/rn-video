import { Platform } from 'react-native';

// Minimal device gating. For iOS, assume ARKit on modern devices.
// For Android, assume ARCore availability. Refine with proper checks later.
export function isARSupportedRough(): boolean {
  if (Platform.OS === 'ios') {
    return true;
  }
  if (Platform.OS === 'android') {
    return true;
  }
  return false;
}

