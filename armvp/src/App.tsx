/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ViroARSceneNavigator} from '@reactvision/react-viro';
import {registerTargets} from './viroTargets';
import ARScene from './ARScene';
import {isARSupportedRough} from './gating/DeviceGate';
import QRScannerScreen from './QRScannerScreen';

type Mode = 'AR' | 'QR';

export default function App() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [mode, setMode] = useState<Mode>('AR');

  useEffect(() => {
    isARSupportedRough()
      .then(setSupported)
      .catch(() => setSupported(false));
  }, []);

  useEffect(() => {
    registerTargets();
  }, []);

  useEffect(() => {
    if (supported === false) {
      setMode('QR');
    }
  }, [supported]);

  const arUnsupported = supported === false;
  const effectiveMode: Mode = arUnsupported ? 'QR' : mode;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleButton,
            effectiveMode === 'AR' && !arUnsupported
              ? styles.toggleButtonActive
              : null,
            arUnsupported ? styles.toggleButtonDisabled : null,
          ]}
          accessibilityRole="button"
          accessibilityState={{disabled: arUnsupported, selected: mode === 'AR'}}
          onPress={() => setMode('AR')}
          disabled={arUnsupported}>
          <Text
            style={[
              styles.toggleLabel,
              effectiveMode === 'AR' && !arUnsupported
                ? styles.toggleLabelActive
                : null,
            ]}>
            AR Mode
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleButton,
            effectiveMode === 'QR' ? styles.toggleButtonActive : null,
          ]}
          accessibilityRole="button"
          accessibilityState={{selected: effectiveMode === 'QR'}}
          onPress={() => setMode('QR')}>
          <Text
            style={[
              styles.toggleLabel,
              effectiveMode === 'QR' ? styles.toggleLabelActive : null,
            ]}>
            QR Mode
          </Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {effectiveMode === 'AR' ? (
          supported === null ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>
                Checking device capability for AR...
              </Text>
            </View>
          ) : (
            <>
              <ViroARSceneNavigator autofocus initialScene={{scene: ARScene}} />
              <Text style={styles.instructions}>
                Move your device toward the marker to start the AR experience.
              </Text>
            </>
          )
        ) : (
          <>
            <QRScannerScreen />
            {arUnsupported && (
              <View style={styles.fallbackBanner}>
                <Text style={styles.fallbackText}>
                  AR is unavailable on this device. QR fallback is active.
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: 'black'},
  toggleContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    marginHorizontal: 6,
  },
  toggleButtonDisabled: {
    opacity: 0.4,
  },
  toggleButtonActive: {
    backgroundColor: '#3a62ff',
  },
  toggleLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleLabelActive: {
    color: 'white',
  },
  content: {flex: 1, position: 'relative'},
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {marginTop: 12, color: 'white'},
  instructions: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    color: 'white',
    textAlign: 'center',
  },
  fallbackBanner: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  fallbackText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
});
