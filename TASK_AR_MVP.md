# 🚀 Task: Build Cross-Platform AR MVP (React Native + ViroReact) + CI/CD

## 🎯 Goal
Создать кроссплатформенное (iOS + Android) мобильное приложение на **React Native (bare, TypeScript)**, которое:
- открывает AR-сцену (ARKit/ARCore),
- распознаёт **одну картинку-метку** (`assets/marker.jpg`, physicalWidth = 0.15 м),
- поверх метки отображает **видео** (`assets/video.mp4`), закреплённое в пространстве,
- включает простую подсказку “Наведите камеру на изображение-метку”.

После реализации нужно:
- настроить **CI/CD**:
  - **Android**: GitHub Actions → сборка `.aab` (артефакт).
  - **iOS**: GitHub Actions → Fastlane → TestFlight.
- протестировать локально (эмулятор/устройство).

---

## 🧩 Stack
- **React Native bare** (TypeScript)
- **@viro-community/react-viro**
- **Fastlane** (iOS TestFlight)
- **GitHub Actions** (CI для Android и iOS)

---

## 📦 Project Structure
Создай или обнови проект до такой структуры:

```
ar-mvp/
  assets/
    marker.jpg
    video.mp4
  src/
    App.tsx
    ARScene.tsx
    viroTargets.ts
  fastlane/
    Appfile
    Fastfile
  .github/workflows/
    android.yml
    ios.yml
  package.json
  tsconfig.json
  README.md
```

---

## ⚙️ Step-by-Step Instructions

### 1️⃣ Инициализация проекта
Если проекта нет — создать bare RN с TypeScript:
```bash
npx react-native init ar-mvp --template react-native-template-typescript
```

### 2️⃣ Установить зависимости
```bash
yarn add @viro-community/react-viro
yarn add -D typescript @types/react @types/react-native
```

### 3️⃣ Добавить права
**iOS (`Info.plist`):**
```xml
<key>NSCameraUsageDescription</key>
<string>Camera is required for AR experience.</string>
```

**Android (`AndroidManifest.xml`):**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera.ar" android:required="false" />
```

### 4️⃣ Реализация AR-сцены

`src/viroTargets.ts`
```ts
import { ViroARTrackingTargets } from '@viro-community/react-viro';

export const TARGET_NAME = 'poster';

export const registerTargets = () => {
  ViroARTrackingTargets.createTargets({
    [TARGET_NAME]: {
      source: require('../assets/marker.jpg'),
      orientation: 'Up',
      physicalWidth: 0.15
    }
  });
};
```

`src/ARScene.tsx`
```tsx
import React, { useState } from 'react';
import {
  ViroARScene, ViroARImageMarker, ViroNode,
  ViroQuad, ViroMaterials, ViroVideo
} from '@viro-community/react-viro';
import { TARGET_NAME } from './viroTargets';

ViroMaterials.createMaterials({ videoSurface: { lightingModel: 'Lambert' } });

export default function ARScene() {
  const [play, setPlay] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <ViroARScene>
      <ViroARImageMarker
        target={TARGET_NAME}
        onAnchorFound={() => { setVisible(true); setPlay(true); }}
        onAnchorRemoved={() => { setPlay(false); setVisible(false); }}
      >
        <ViroNode rotation={[-90, 0, 0]} visible={visible}>
          <ViroQuad width={0.15} height={0.084} materials={['videoSurface']} />
          <ViroVideo
            source={require('../assets/video.mp4')}
            paused={!play}
            loop={true}
            rotation={[-90, 0, 0]}
            width={0.15}
            height={0.084}
          />
        </ViroNode>
      </ViroARImageMarker>
    </ViroARScene>
  );
}
```

`src/App.tsx`
```tsx
import React, { useEffect } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { ViroARSceneNavigator } from '@viro-community/react-viro';
import { registerTargets } from './viroTargets';
import ARScene from './ARScene';

export default function App() {
  useEffect(() => { registerTargets(); }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <ViroARSceneNavigator
        autofocus
        initialScene={{ scene: ARScene }}
      />
      <Text style={{
        position: 'absolute', bottom: 16, left: 16, right: 16,
        color: 'white', textAlign: 'center'
      }}>
        Наведите камеру на изображение-метку
      </Text>
    </SafeAreaView>
  );
}
```

---

### 5️⃣ CI/CD

#### `.github/workflows/android.yml`
```yaml
name: Android CI
on: { push: { branches: [ main ] }, workflow_dispatch: {} }

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: yarn install --frozen-lockfile
      - uses: actions/setup-java@v4
        with: { distribution: 'temurin', java-version: '17' }
      - name: Build AAB
        working-directory: android
        run: ./gradlew bundleRelease
      - uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: android/app/build/outputs/bundle/release/*.aab
```

#### `.github/workflows/ios.yml`
```yaml
name: iOS CI
on: { push: { branches: [ main ] }, workflow_dispatch: {} }

jobs:
  build-ios:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with: { ruby-version: '3.2', bundler-cache: true }
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: yarn install --frozen-lockfile
      - run: cd ios && pod install
      - name: Setup App Store Connect API Key
        env:
          APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}
          APP_STORE_CONNECT_API_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_API_ISSUER_ID }}
          APP_STORE_CONNECT_API_KEY_CONTENT: ${{ secrets.APP_STORE_CONNECT_API_KEY_CONTENT }}
        run: |
          mkdir -p ~/private_keys
          echo "$APP_STORE_CONNECT_API_KEY_CONTENT" | base64 --decode > ~/private_keys/AuthKey_${APP_STORE_CONNECT_API_KEY_ID}.p8
      - name: Fastlane Beta
        run: bundle exec fastlane ios beta
```

#### `fastlane/Appfile`
```ruby
apple_id("YOUR_APPLE_ID_EMAIL")
itc_team_id("YOUR_APP_STORE_CONNECT_TEAM_ID")
team_id("YOUR_APPLE_TEAM_ID")
app_identifier("com.yourorg.armvp")
```

#### `fastlane/Fastfile`
```ruby
default_platform(:ios)
platform :ios do
  lane :beta do
    increment_build_number(xcodeproj: "ar-mvp.xcodeproj")
    build_app(
      workspace: "ar-mvp.xcworkspace",
      scheme: "ar-mvp",
      export_method: "app-store"
    )
    upload_to_testflight(skip_waiting_for_build_processing: true)
  end
end
```

---

## 🔐 Secrets Setup

Создай следующие **GitHub Secrets** для CI/CD:

### iOS / TestFlight
| Secret | Description |
|--------|--------------|
| `APP_STORE_CONNECT_API_KEY_ID` | ID ключа API (например, `ABCD123456`) |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Issuer ID (из App Store Connect → Users and Access → Keys) |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | Base64-кодированный `.p8` файл API Key (`AuthKey_XXXX.p8`) |
| `APPLE_TEAM_ID` | Твой Team ID (см. Developer Account) |
| `APPLE_APP_ID` | Идентификатор пакета приложения (`com.yourorg.armvp`) |

### Android (если планируется автопубликация)
| Secret | Description |
|--------|--------------|
| `SERVICE_ACCOUNT_JSON` | JSON-ключ от Google Cloud Service Account с доступом к Google Play API |
| `PACKAGE_NAME` | Уникальный идентификатор пакета (например, `com.yourorg.armvp`) |

> ⚠️ Все секреты создаются в GitHub → Repository → Settings → Secrets → Actions.

---

## ✅ Acceptance Criteria
- При запуске открывается камера.
- При наведении на `marker.jpg` поверх появляется и играет `video.mp4`.
- При потере метки видео останавливается.
- CI собирает Android `.aab` и iOS билд через Fastlane.
- Все secrets корректно установлены.
- `README.md` содержит инструкции запуска и CI.

---

## 💬 Codex Action
> Выполни все шаги из этого файла: создай недостающие файлы, установи зависимости, пропиши конфиги и скрипты.  
> После генерации — проверь, что проект собирается локально и CI файлы корректны.
