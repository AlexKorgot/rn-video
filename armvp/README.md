AR MVP (React Native + ViroReact)

Overview
- React Native (bare, TypeScript) app that opens an AR scene and performs image tracking of one marker (`assets/marker.jpg`, physicalWidth 0.15m) and overlays a video (`assets/video.mp4`) on the detected marker.

Run Instructions
- Prereqs: Node 18+, Yarn, Android Studio SDKs, Xcode for iOS.
- Android: `yarn android`
- iOS: `yarn pods` then `yarn ios` (device/simulator with ARKit where applicable)

Assets
- Place real assets at `assets/marker.jpg` and `assets/video.mp4`.
- Current files are placeholders and must be replaced for testing.

Device Capability
- Minimal gating via `src/gating/DeviceGate.ts` (assumes AR availability on modern devices). Improve with ARCore/ARKit checks as needed.

CI/CD
- Android GitHub Action builds `.aab` artifact.
- iOS GitHub Action runs Fastlane to upload to TestFlight.

GitHub Secrets (Actions -> Secrets and variables -> Actions)
- `APP_STORE_CONNECT_API_KEY_ID`
- `APP_STORE_CONNECT_API_ISSUER_ID`
- `APP_STORE_CONNECT_API_KEY_CONTENT` (base64 of AuthKey_XXXX.p8)
- `APPLE_TEAM_ID`
- `APPLE_APP_ID` (bundle id e.g. `com.yourorg.armvp`)

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
