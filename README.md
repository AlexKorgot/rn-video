
# AR Image-Tracking MVP (React Native)
Кроссплатформенное приложение: при наведении на изображение включается **AR‑видео** (overlay). Есть режим **QR fallback**, CI/CD для Android и iOS (TestFlight).

## Stack
- React Native (TypeScript)
- @reactvision/react-viro (ARKit/ARCore)
- Fastlane + TestFlight (iOS)
- GitHub Actions (CI/CD)

## Требования
- macOS + Xcode (для iOS)
- Node 18+/20+, Yarn
- CocoaPods (`sudo gem install cocoapods`)
- iPhone с ARKit (iPhone 8/X и новее), Android с ARCore (Android 8+ поддерживаемые модели)

## Установка
```bash
yarn install
cd ios && pod install && cd ..
```

## Запуск (iOS)
1. Открой `ios/*.xcworkspace` в Xcode.
2. Target → Signing & Capabilities → **Automatically manage signing**, выбери Team, уникальный Bundle ID.
3. Подключи iPhone (Developer Mode включён).
4. **Run ▶︎**. Metro поднимется автоматически (есть Run Script Phase).

## Запуск (Android)
```bash
yarn android
```
*На устройстве должен быть установлен Google Play Services for AR.*

## AR‑метка и видео
- Положи в `assets/marker.jpg` картинку‑метку и **распечатай** её.
- Измерь ширину на печати и укажи её в `src/viroTargets.ts` → `physicalWidth` (в метрах).
- Видео (`assets/video.mp4`) — H.264 720p/1080p.

## Режим QR (fallback)
- Переключатель AR/QR в App (если включён).
- В QR‑режиме при скане URL открывается видео/ссылка.

## CI/CD
- GitHub Actions: `.github/workflows/android.yml`, `.github/workflows/ios.yml`
- iOS: Fastlane `fastlane/Appfile`, `fastlane/Fastfile`, `Gemfile`

### Secrets (GitHub → Settings → Secrets → Actions)
- `APP_STORE_CONNECT_API_KEY_ID`
- `APP_STORE_CONNECT_API_ISSUER_ID`
- `APP_STORE_CONNECT_API_KEY_CONTENT` (base64 .p8)
- `APPLE_TEAM_ID`, `APPLE_ID_EMAIL`, `APPLE_APP_ID`
- (Android) `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`

## Частые проблемы
- **Invariant Violation: app not registered** — проверь `app.json`, `index.js`, запусти Metro в корне (`yarn start --reset-cache`).  
- **setJSMaterials of null** — перенеси `ViroMaterials.createMaterials` в `useEffect` сцены.  
- **Не коннектится к Metro** — iPhone и Mac в одной сети; Dev Menu → Configure Bundler → `http://<IP-Mac>:8081`; отключи VPN/Firewall.  
- **AR не запускается на Android** — проверь устройство в списке ARCore; установи Google Play Services for AR.  
- **iOS: Untrusted Developer** — Настройки → Основные → VPN и управление устройством → Доверять.  
- **Xcode: использовать workspace** — всегда открывай `*.xcworkspace`, не `.xcodeproj`.

## Лицензия
MIT
