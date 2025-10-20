import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import {
  ViroARScene,
  ViroARImageMarker,
  ViroNode,
  ViroQuad,
  ViroMaterials,
  ViroVideo,
} from '@reactvision/react-viro';
import {TARGET_NAME} from './viroTargets';

export default function ARScene() {
  const [play, setPlay] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      // @ts-ignore create once per runtime
      if (
        !ViroMaterials.getMaterial ||
        !ViroMaterials.getMaterial('videoSurface')
      ) {
        ViroMaterials.createMaterials({
          videoSurface: {lightingModel: 'Lambert'},
        });
      }
    } catch {
      // Swallow lookup errors if material is absent
    }
  }, []);

  const togglePlay = () => setPlay(prev => !prev);

  return (
    <>
      <ViroARScene>
        <ViroARImageMarker
          target={TARGET_NAME}
          onAnchorFound={() => {
            setVisible(true);
            setPlay(true);
          }}
          onAnchorRemoved={() => {
            setPlay(false);
            setVisible(false);
          }}>
          <ViroNode rotation={[-90, 0, 0]} visible={visible}>
            <ViroQuad
              width={0.15}
              height={0.084375}
              materials={['videoSurface']}
            />
            <ViroVideo
              source={require('../assets/video.mp4')}
              paused={!play}
              loop
              rotation={[-90, 0, 0]}
              width={0.15}
              height={0.084375}
            />
          </ViroNode>
        </ViroARImageMarker>
      </ViroARScene>

      {visible && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.button} onPress={togglePlay}>
            <Text style={styles.text}>
              {play ? 'Pause video' : 'Play video'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {position: 'absolute', bottom: 40, alignSelf: 'center'},
  button: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {color: 'white', fontSize: 16, fontWeight: '600'},
});
