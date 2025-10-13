# 🚀 TASK.md — Build Cross‑Platform AR MVP (React Native + ViroReact) + CI/CD

> **Role for Codex**: You are a senior Mobile + DevOps assistant. Execute **all steps** below directly in the current workspace. Make sensible defaults. Do **not** ask clarifying questions. Create/edit files, install deps, and wire CI/CD. After finishing, output a short report with created/changed files and next manual steps (secrets, provisioning).

---

## 🎯 Goal
Create a cross‑platform (iOS + Android) mobile app on **React Native (bare, TypeScript)** that:
- Opens an **AR scene** (ARKit/ARCore).
- Performs **image tracking** of **one marker** (`assets/marker.jpg`, `physicalWidth = 0.15` meters).
- Plays a **video overlay** (`assets/video.mp4`) aligned to the detected marker.
- Shows a simple on‑screen hint: “Наведите камеру на изображение‑метку”.

Then set up **CI/CD**:
- **Android**: GitHub Actions builds `.aab` (artifact).
- **iOS**: GitHub Actions runs **Fastlane** to upload a build to **TestFlight**.

Provide developer documentation and basic device capability checks (ARCore/ARKit gating).

---

## 🧩 Stack & Constraints
- React Native **bare** (no Expo), **TypeScript**.
- AR lib: **@reactvision/react-viro**.
- Min targets: **Android minSdk 24+, iOS 14+**.
- Video: local asset (`assets/video.mp4`) H.264 720p/1080p.
- One image target (`assets/marker.jpg`) with defined physical width (0.15 m).
- CI: **GitHub Actions** (Android & iOS), iOS uses **Fastlane** (TestFlight).

---

## 📦 Project Structure (create or conform)
```
ar-mvp/
  assets/
    marker.jpg          # placeholder if real asset not provided
    video.mp4           # placeholder (text file ok; dev will replace)
  src/
    App.tsx
    ARScene.tsx
    viroTargets.ts
    gating/
      DeviceGate.ts
      UnsupportedScreen.tsx
  fastlane/
    Appfile
    Fastfile
  .github/workflows/
    android.yml
    ios.yml
  .editorconfig
  .gitignore
  package.json
  tsconfig.json
  README.md
```

---

## ⚙️ Step‑by‑Step

### 1) Initialize RN (if absent) + TS
```bash
npx react-native init ar-mvp --template react-native-template-typescript
```
If project exists, keep current app name; ensure TS is configured.

### 2) Install dependencies
```bash
yarn add @reactvision/react-viro
yarn add -D typescript @types/react @types/react-native
```
Optional lint/format (recommended):
```bash
yarn add -D eslint @react-native/eslint-config prettier
```

### 3) iOS / Android permissions
**iOS**: edit `ios/**/Info.plist` and add:
```xml
<key>NSCameraUsageDescription</key>
<string>Camera is required for AR experience.</string>
```
**Android**: edit `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera.ar" android:required="false" />
```

### 4) Create AR implementation files

**`src/viroTargets.ts`**
```ts
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
```

**`src/ARScene.tsx`**
```tsx
import React, { useState } from 'react';
import {
  ViroARScene, ViroARImageMarker, ViroNode,
  ViroQuad, ViroMaterials, ViroVideo
} from '@reactvision/react-viro';
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
          <ViroQuad width={0.15} height={0.084375} materials={['videoSurface']} />
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
```

**`src/gating/DeviceGate.ts`**
```ts
import { Platform } from 'react-native';

/**
 * Minimal device gating. For iOS, assume ARKit if iOS >= 11 on supported devices.
 * For Android, ARCore support varies; we don't query Google Play Services for AR here,
 * but expose a flag for a manual override or future ARCore availability check.
 */
export function isARSupportedRough(): boolean {
  if (Platform.OS === 'ios') {
    // Real check would use ARKit capability APIs; for MVP assume true on modern devices.
    return true;
  }
  if (Platform.OS === 'android') {
    // Assume true; allow manual override via env/flag if needed.
    return true;
  }
  return false;
}
```

**`src/gating/UnsupportedScreen.tsx`**
```tsx
import React from 'react';
import { View, Text, Linking, StyleSheet } from 'react-native';

export default function UnsupportedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AR недоступен на этом устройстве</Text>
      <Text style={styles.text}>
        Убедитесь, что устройство поддерживает ARKit (iOS) или ARCore (Android).
      </Text>
      <Text
        style={styles.link}
        onPress={() => Linking.openURL('https://developers.google.com/ar/devices')}
      >
        Список устройств с ARCore
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  text: { fontSize: 14, textAlign: 'center', opacity: 0.8 },
  link: { marginTop: 12, textDecorationLine: 'underline' }
});
```

**`src/App.tsx`**
```tsx
import React, { useEffect } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { registerTargets } from './viroTargets';
import ARScene from './ARScene';
import { isARSupportedRough } from './gating/DeviceGate';
import UnsupportedScreen from './gating/UnsupportedScreen';

export default function App() {
  const supported = isARSupportedRough();
  useEffect(() => { registerTargets(); }, []);

  if (!supported) return <UnsupportedScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <ViroARSceneNavigator autofocus initialScene={{ scene: ARScene }} />
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

### 5) Scripts & config

**`package.json`** — ensure these scripts exist:
```json
{
  "scripts": {
    "start": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "pods": "cd ios && pod install",
    "build:android:release": "cd android && ./gradlew bundleRelease",
    "build:ios:release": "cd ios && xcodebuild -workspace ar-mvp.xcworkspace -scheme ar-mvp -configuration Release -sdk iphoneos"
  }
}
```

**`.editorconfig`**
```
root = true
[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
```

**`.gitignore`**
```
node_modules/
ios/Pods/
android/.gradle/
android/app/build/
*.iml
*.log
.DS_Store
dist/
build/
```

### 6) iOS specifics
- Run CocoaPods after installing deps:
```bash
cd ios && pod install
```
- Ensure iOS Deployment Target >= 14.
- App id placeholder: `com.yourorg.armvp` (adjust later for release).

### 7) Android specifics
- Java 17, Gradle wrapper in repo.
- Release build command produces `.aab` in `android/app/build/outputs/bundle/release/`.

### 8) CI/CD — GitHub Actions

**`.github/workflows/android.yml`**
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

**`.github/workflows/ios.yml`**
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

### 9) Fastlane (iOS)

**`fastlane/Appfile`**
```ruby
apple_id("YOUR_APPLE_ID_EMAIL")
itc_team_id("YOUR_APP_STORE_CONNECT_TEAM_ID")
team_id("YOUR_APPLE_TEAM_ID")
app_identifier("com.yourorg.armvp")
```

**`fastlane/Fastfile`**
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

### 10) README
Create `README.md` with: overview, run instructions, asset placement, CI/CD summary, Secrets list, known issues, and acceptance criteria (see below).

---

## 🔐 Secrets Setup (GitHub → Settings → Secrets → Actions)

### iOS / TestFlight
| Secret | Description |
|-------|-------------|
| `APP_STORE_CONNECT_API_KEY_ID` | API key ID (e.g., `ABCD123456`). |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Issuer ID from App Store Connect. |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | Base64 of the `.p8` API key file (AuthKey_XXXX.p8). |
| `APPLE_TEAM_ID` | Your Apple Team ID. |
| `APPLE_APP_ID` | Bundle ID, e.g. `com.yourorg.armvp`. |

### Android (optional for auto-publish)
| Secret | Description |
|--------|-------------|
| `SERVICE_ACCOUNT_JSON` | JSON for Google Play Developer API. |
| `PACKAGE_NAME` | E.g. `com.yourorg.armvp`. |

---

## 🧪 Local Test Checklist
- iOS:
  - `yarn pods` → `yarn ios` (device with ARKit).
- Android:
  - `yarn android` (device with ARCore / Google Play Services for AR).
- Place real `assets/marker.jpg` and `assets/video.mp4` before testing.
- Point camera to the marker — the video plane should appear and play.

---

## ✅ Acceptance Criteria
- App launches camera and AR session.
- On seeing `marker.jpg`, video plays aligned to marker (0.15 m width).
- Losing the marker pauses/hides the video.
- Android CI produces `.aab` artifact.
- iOS CI pushes build to TestFlight via Fastlane.
- README explains run steps and Secrets.

---

## 🧯 Troubleshooting (add to README)
- If video appears flipped — adjust `rotation` or swap plane axes; keep `-90°` around X for alignment.
- If AR fails on Android — ensure Google Play Services for AR installed/updated.
- If iOS pods fail — `gem install cocoapods` then `cd ios && pod repo update && pod install`.
- Node/Pods cache: clean with `watchman watch-del-all`, `rm -rf node_modules ios/Pods`, reinstall.
- iOS signing: ensure correct team, bundle id, and App Store Connect API key secrets.

---

## 🧾 Final Report (print to output after completion)
- List of created/modified files with brief purpose.
- Result of local build commands (if executed).
- CI status hints (what to expect on first run).
- Manual steps still required (upload real assets, set GitHub secrets, Apple/Google accounts).
