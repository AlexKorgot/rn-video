import React, { useEffect } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { ViroARSceneNavigator } from '@viro-community/react-viro';
import { registerTargets } from './viroTargets';
import ARScene from './ARScene';

export default function App() {
  useEffect(() => {
    registerTargets();
  }, []);

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
        Point your camera at the marker
      </Text>
    </SafeAreaView>
  );
}

