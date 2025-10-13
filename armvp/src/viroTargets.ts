import { ViroARTrackingTargets } from '@reactvision/react-viro';

export const TARGET_NAME = 'poster';

export const registerTargets = () => {
  ViroARTrackingTargets.createTargets({
    [TARGET_NAME]: {
      source: require('../assets/marker.jpg'),
      orientation: 'Up',
      physicalWidth: 0.15,
    },
  });
};
