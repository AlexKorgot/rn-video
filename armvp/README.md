AR MVP (React Native + ViroReact)

Overview
- React Native (bare, TypeScript) app that opens an AR scene and performs image tracking of one marker (`assets/marker.jpg`, physicalWidth 0.15m) and overlays a video (`assets/video.mp4`) on the detected marker.
- QR fallback powered by VisionCamera lets users scan codes and open URLs when AR is unavailable.

Device Requirements
- iOS 14+ with ARKit-capable hardware (A12 chip or newer recommended).
- Android 8.0+ with Google Play Services for AR (ARCore) installed and updated.
- Physical marker printed at 0.15 m width to match the configured `physicalWidth`.

Run Instructions
- Prereqs: Node 18+, Yarn, Android Studio SDKs, Xcode for iOS.
- Android: `yarn android`
- iOS: `yarn pods` then `yarn ios` (device/simulator with ARKit where applicable)

Assets
- Place real assets at `assets/marker.jpg` and `assets/video.mp4`.
- Current files are placeholders and must be replaced for testing.

Device Capability
- Minimal gating via `src/gating/DeviceGate.ts` (assumes AR availability on modern devices). Improve with ARCore/ARKit checks as needed.

Modes
- Use the AR/QR toggle at the top of the app to switch experiences.
- AR mode shows the Viro scene and starts tracking the target.
- QR mode activates the VisionCamera scanner; recognized links auto-open and other payloads display in an alert.
- Devices without AR support automatically fall back to QR mode with a banner explaining the limitation.

CI/CD
- Android GitHub Action builds `.aab` artifact.
- iOS GitHub Action runs Fastlane to upload to TestFlight.
- Populate the listed GitHub Secrets so Match can fetch signing assets and the Android job can restore the release keystore.

GitHub Secrets (Actions -> Secrets and variables -> Actions)
- `APP_STORE_CONNECT_API_KEY_ID`
- `APP_STORE_CONNECT_API_ISSUER_ID`
- `APP_STORE_CONNECT_API_KEY_CONTENT` (base64 of AuthKey_XXXX.p8)
- `APPLE_TEAM_ID`
- `APPLE_ID_EMAIL` (Apple ID associated with App Store Connect)
- `APPLE_APP_ID` (bundle id e.g. `com.yourorg.armvp`)
- *(optional)* `APPLE_ITC_TEAM_ID` (when App Store Connect team differs from developer team)
- `MATCH_GIT_URL`
- `MATCH_PASSWORD`
- *(optional)* `MATCH_GIT_BRANCH` (defaults to `main`)
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Release Builds
- iOS: `npx react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios` then archive in Xcode (Release scheme). CI: `bundle exec fastlane ios beta`.
- Android: `cd android && ./gradlew bundleRelease` to produce `android/app/build/outputs/bundle/release/*.aab`. CI runs the same command in GitHub Actions.

Known Issues / Troubleshooting
- If video appears flipped: adjust rotation in `src/ARScene.tsx` (usually -90 on X is correct).
- Android AR failures: ensure Google Play Services for AR is installed/updated.
- iOS pods: `gem install cocoapods` then `cd ios && pod repo update && pod install`.
- Cache cleanup: `watchman watch-del-all`, remove `node_modules` and `ios/Pods`, then reinstall.
- iOS signing: set correct team/bundle id and App Store Connect API key secrets.

Acceptance Criteria
- App launches camera and AR session.
- On seeing `marker.jpg`, video plays aligned to marker (0.15 m width).
- Losing the marker pauses/hides the video.
- Android CI produces `.aab` artifact.
- iOS CI pushes build to TestFlight via Fastlane.
