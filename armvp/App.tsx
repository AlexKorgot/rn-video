/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { registerTargets } from './src/viroTargets';
import ARScene from './src/ARScene';
import { isARSupportedRough } from './src/gating/DeviceGate';
import UnsupportedScreen from './src/gating/UnsupportedScreen';

export default function App() {
  const supported = isARSupportedRough();
  useEffect(() => {
    registerTargets();
  }, []);

  if (!supported) return <UnsupportedScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <ViroARSceneNavigator autofocus initialScene={{ scene: ARScene }} />
      <Text
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          color: 'white',
          textAlign: 'center',
        }}
      >
        Наведите камеру на маркер
      </Text>
    </SafeAreaView>
  );
}
