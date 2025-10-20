import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {useScanBarcodes, BarcodeFormat} from 'vision-camera-code-scanner';
import {
  PERMISSIONS,
  RESULTS,
  check,
  openSettings,
  request,
} from 'react-native-permissions';

type PermissionState = 'pending' | 'granted' | 'denied' | 'blocked';

const cameraPermission =
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.CAMERA
    : PERMISSIONS.ANDROID.CAMERA;

async function resolveCameraPermission(): Promise<PermissionState> {
  if (!cameraPermission) {
    return 'denied';
  }

  const status = await check(cameraPermission);
  if (status === RESULTS.GRANTED) {
    return 'granted';
  }
  if (status === RESULTS.BLOCKED) {
    return 'blocked';
  }

  const requested = await request(cameraPermission);
  if (requested === RESULTS.GRANTED) {
    return 'granted';
  }
  if (requested === RESULTS.BLOCKED) {
    return 'blocked';
  }
  return 'denied';
}

export default function QRScannerScreen() {
  const [permission, setPermission] = useState<PermissionState>('pending');
  const devices = useCameraDevices();
  const device = devices.back;
  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true,
  });
  const lastScannedRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const status = await resolveCameraPermission();
      if (mounted) {
        setPermission(status);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!barcodes.length) {
      return;
    }

    const [barcode] = barcodes;
    const value = barcode.displayValue ?? barcode.rawValue;
    if (!value || value === lastScannedRef.current) {
      return;
    }

    lastScannedRef.current = value;
    setTimeout(() => {
      lastScannedRef.current = null;
    }, 3000);

    if (/^https?:\/\//i.test(value)) {
      Linking.openURL(value).catch(() => {
        Alert.alert('Open URL failed', 'Unable to open the scanned link.');
      });
    } else {
      Alert.alert('QR code detected', value);
    }
  }, [barcodes]);

  if (permission === 'pending' || !device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>Preparing camera for QR scanning…</Text>
      </View>
    );
  }

  if (permission === 'denied') {
    return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>
          Camera permission is required to scan QR codes.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={async () => {
            const status = await resolveCameraPermission();
            setPermission(status);
          }}
          style={styles.secondaryButton}>
          <Text style={styles.buttonText}>Request Permission</Text>
        </Pressable>
      </View>
    );
  }

  if (permission === 'blocked') {
    return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>
          Camera permission is blocked. Please enable it in system settings.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={openSettings}
          style={styles.secondaryButton}>
          <Text style={styles.buttonText}>Open Settings</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Scan a QR code</Text>
        <Text style={styles.overlaySubtitle}>
          Point your device at a QR code. Links open automatically.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1d1d1d',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    padding: 16,
  },
  overlayTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  overlaySubtitle: {
    color: 'white',
    fontSize: 14,
  },
});
