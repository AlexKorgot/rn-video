# 🧩 TASK_PHASE_02.md — AR Image Tracking + Video Overlay
## Цель
Сделать рабочую AR-сцену: при наведении на картинку (image target) воспроизводится видео в AR, с кнопкой Пауза/Плей.

---

## 1) Зависимости
Используем только:
```bash
yarn remove @viro-community/react-viro || true
yarn add @reactvision/react-viro
cd ios && pod install && cd ..
```

---

## 2) Ассеты
Положить реальные файлы:
- `assets/marker.jpg` — эталонная метка (распечатать). Измери ширину печати (например 0.15 м).
- `assets/video.mp4` — H.264 720p/1080p.

---

## 3) Код AR

### 📄 src/viroTargets.ts
```ts
import { ViroARTrackingTargets } from '@reactvision/react-viro';

export const TARGET_NAME = 'poster';

export const registerTargets = () => {
  ViroARTrackingTargets.createTargets({
    [TARGET_NAME]: {
      source: require('../assets/marker.jpg'),
      orientation: 'Up',
      physicalWidth: 0.15, // заменить на фактическую ширину в метрах
    },
  });
};
```

### 📄 src/ARScene.tsx
```tsx
import React, { useEffect, useState } from 'react';
import {
  ViroARScene, ViroARImageMarker, ViroNode,
  ViroQuad, ViroMaterials, ViroVideo
} from '@reactvision/react-viro';
import { TARGET_NAME } from './viroTargets';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function ARScene() {
  const [play, setPlay] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      // @ts-ignore
      if (!ViroMaterials.getMaterial || !ViroMaterials.getMaterial('videoSurface')) {
        ViroMaterials.createMaterials({ videoSurface: { lightingModel: 'Lambert' } });
      }
    } catch {}
  }, []);

  const togglePlay = () => setPlay(p => !p);

  return (
    <>
      <ViroARScene>
        <ViroARImageMarker
          target={TARGET_NAME}
          onAnchorFound={() => { setVisible(true); setPlay(true); }}
          onAnchorRemoved={() => { setPlay(false); setVisible(false); }}
        >
          <ViroNode rotation={[-90, 0, 0]} visible={visible}>
            <ViroQuad width={0.15} height={0.084375} materials={['videoSurface']} />
            <ViroVideo
              source={require('../assets/video.mp4')}
              paused={!play}
              loop
              rotation={[-90, 0, 0]}
              width={0.15}
              height={0.084375} // подбери под соотношение сторон видео
            />
          </ViroNode>
        </ViroARImageMarker>
      </ViroARScene>

      {visible && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.button} onPress={togglePlay}>
            <Text style={styles.text}>{play ? '⏸ Пауза' : '▶️ Воспроизвести'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', bottom: 40, alignSelf: 'center' },
  button: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 16 },
  text: { color: 'white', fontSize: 16, fontWeight: '600' },
});
```

### 📄 src/App.tsx
```tsx
import React, { useEffect } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { registerTargets } from './viroTargets';
import ARScene from './ARScene';

export default function App() {
  useEffect(() => { registerTargets(); }, []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <ViroARSceneNavigator autofocus initialScene={{ scene: ARScene }} />
      <Text style={{ position:'absolute', bottom:16, left:16, right:16, color:'white', textAlign:'center' }}>
        Наведите камеру на изображение-метку
      </Text>
    </SafeAreaView>
  );
}
```

---

## 4) iOS / Android permissions
- iOS `Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>Camera is required for AR experience.</string>
```
- Android Manifest:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera.ar" android:required="false" />
<uses-feature android:name="android.hardware.camera" />
<uses-feature android:name="android.hardware.camera.autofocus" />
<uses-feature android:name="android.hardware.sensor.accelerometer" />
<uses-feature android:name="android.hardware.sensor.gyroscope" />
```

---

## 5) Acceptance
- При наведении на распечатанный `marker.jpg` — видео появляется и играет
- При потере метки — скрывается/останавливается
- Кнопка Пауза/Плей работает
