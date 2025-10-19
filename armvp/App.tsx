/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ViroARSceneNavigator} from '@reactvision/react-viro';
import {registerTargets} from './src/viroTargets';
import ARScene from './src/ARScene';
import {isARSupportedRough} from './src/gating/DeviceGate';
import UnsupportedScreen from './src/gating/UnsupportedScreen';

export default function App() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    isARSupportedRough()
      .then(setSupported)
      .catch(() => setSupported(false));
  }, []);
  useEffect(() => {
    registerTargets();
  }, []);

  if (supported === false) {
    return <UnsupportedScreen />;
  }

  if (supported === null) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Проверяем поддержку AR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.sceneContainer}>
      <ViroARSceneNavigator autofocus initialScene={{scene: ARScene}} />
      <Text style={styles.instructions}>Наведите камеру на маркер</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  loadingContent: {alignItems: 'center'},
  loadingText: {marginTop: 12},
  sceneContainer: {flex: 1, backgroundColor: 'black'},
  instructions: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    color: 'white',
    textAlign: 'center',
  },
});
