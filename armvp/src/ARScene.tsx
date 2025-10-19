import React, {useState} from 'react';
import {
  ViroARScene,
  ViroARImageMarker,
  ViroNode,
  ViroQuad,
  ViroMaterials,
  ViroVideo,
} from '@reactvision/react-viro';
import {TARGET_NAME} from './viroTargets';

ViroMaterials.createMaterials({videoSurface: {lightingModel: 'Lambert'}});

export default function ARScene() {
  const [play, setPlay] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
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
            loop={true}
            rotation={[-90, 0, 0]}
            width={0.15}
            height={0.084375}
          />
        </ViroNode>
      </ViroARImageMarker>
    </ViroARScene>
  );
}
