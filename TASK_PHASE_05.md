# 🧩 TASK_PHASE_05.md — QR Mode (fallback к нативному видео без AR)
## Цель
Добавить второй режим приложения: сканирование QR-кода и воспроизведение видео (URL из QR) в обычном плеере. Переключение режимов: **AR Mode / QR Mode**.

---

## 1) Зависимости
```bash
yarn add react-native-vision-camera react-native-permissions
yarn add vision-camera-code-scanner
cd ios && pod install && cd ..
```

---

## 2) Permissions
- iOS `Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is required for QR scanning.</string>
```
- Android `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
```

---

## 3) Минимальный UI-переключатель
Добавь экран/навигацию или простой toggle в `App.tsx`:
```tsx
// псевдокод
const [mode, setMode] = useState<'AR'|'QR'>('AR');
// кнопка переключения
// if 'AR' -> показываем ViroARSceneNavigator
// if 'QR' -> показываем компонент QRScannerScreen
```

---

## 4) Пример QR сканера (минимально)

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Linking, Alert } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';

export default function QRScannerScreen() {
  const [permission, setPermission] = useState<'granted'|'denied'|'pending'>('pending');
  const devices = useCameraDevices();
  const device = devices.back;
  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE]);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setPermission(status === 'authorized' ? 'granted' : 'denied');
    })();
  }, []);

  useEffect(() => {
    if (barcodes.length > 0) {
      const val = barcodes[0].displayValue || barcodes[0].rawValue;
      if (val && /^https?:\/\//.test(val)) {
        Linking.openURL(val).catch(() => Alert.alert('Ошибка', 'Не удалось открыть ссылку'));
      }
    }
  }, [barcodes]);

  if (permission !== 'granted' || !device) return <Text>Запрос разрешения на камеру...</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />
      <Text style={{ position:'absolute', bottom:20, alignSelf:'center', color:'white' }}>Наведите на QR-код</Text>
    </View>
  );
}
```

---

## 5) Acceptance
- Есть переключение AR/QR
- В QR-режиме при скане URL открывается в плеере (или внешнем браузере)
- AR-режим не затронут
