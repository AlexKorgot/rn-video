AR MVP (React Native + ViroReact)

Overview
- Cross-platform AR MVP: image marker (marker.jpg) that, when detected, displays and plays a video (video.mp4) on top of it. Built with React Native (TypeScript) and @viro-community/react-viro.

Project Structure
- assets/: marker.jpg (15 cm physical width), video.mp4
- src/: App.tsx, ARScene.tsx, viroTargets.ts
- fastlane/: Appfile, Fastfile (iOS TestFlight)
- .github/workflows/: android.yml, ios.yml

Local Setup (after creating a RN bare app)
1) Init RN TS app: npx react-native init ar-mvp --template react-native-template-typescript
2) Install deps: yarn add @viro-community/react-viro && yarn add -D typescript @types/react @types/react-native
3) iOS: add NSCameraUsageDescription to Info.plist (already included here as reference)
4) Android: add CAMERA permission and AR camera feature to AndroidManifest.xml (included here as reference)
5) Put your assets in assets/ (replace placeholders)
6) iOS pods: cd ios && pod install
7) Run: yarn ios or yarn android

CI/CD (GitHub Actions)
- Android: builds AAB and uploads as artifact (.github/workflows/android.yml)
- iOS: uses Fastlane to build and upload to TestFlight (.github/workflows/ios.yml)

Secrets (GitHub)
- APP_STORE_CONNECT_API_KEY_ID
- APP_STORE_CONNECT_API_ISSUER_ID
- APP_STORE_CONNECT_API_KEY_CONTENT (base64 of the .p8 key)

Notes
- The native android/ and ios/ projects are normally created by react-native init and are not fully included here. Merge these configs into your generated project.
- marker.jpg and video.mp4 are placeholders in this repo; replace with your real assets for runtime testing.

