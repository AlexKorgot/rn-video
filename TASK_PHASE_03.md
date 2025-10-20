# 🧩 TASK_PHASE_03.md — CI/CD (GitHub Actions + Fastlane)
## Цель
Добавить автоматические сборки: Android (.aab артефакт) и iOS (Fastlane → TestFlight).

---

## 1) Workflows

### 📄 .github/workflows/android.yml
```yaml
name: Android CI
on:
  push:
    branches: [ main ]
  workflow_dispatch: {}
jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: yarn install --frozen-lockfile
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - name: Build AAB
        working-directory: android
        run: ./gradlew bundleRelease
      - uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: android/app/build/outputs/bundle/release/*.aab
```

### 📄 .github/workflows/ios.yml
```yaml
name: iOS CI
on:
  push:
    branches: [ main ]
  workflow_dispatch: {}
jobs:
  build-ios:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
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

---

## 2) Fastlane

### 📄 fastlane/Gemfile
```ruby
source 'https://rubygems.org'
gem 'fastlane'
```

### 📄 fastlane/Appfile
```ruby
apple_id(ENV['APPLE_ID_EMAIL'])
itc_team_id(ENV['APPLE_ITC_TEAM_ID'] || ENV['APPLE_TEAM_ID'])
team_id(ENV['APPLE_TEAM_ID'])
app_identifier(ENV['APPLE_APP_ID'])
```

### 📄 fastlane/Fastfile
```ruby
default_platform(:ios)
platform :ios do
  lane :beta do
    increment_build_number
    build_app(
      export_method: "app-store"
    )
    upload_to_testflight(skip_waiting_for_build_processing: true)
  end
end
```

---

## 3) README: Secrets (добавить раздел)
- APP_STORE_CONNECT_API_KEY_ID
- APP_STORE_CONNECT_API_ISSUER_ID
- APP_STORE_CONNECT_API_KEY_CONTENT (base64 .p8)
- APPLE_TEAM_ID
- APPLE_ID_EMAIL
- APPLE_APP_ID (bundle id, напр. com.yourorg.armvp)

---

## 4) Acceptance
- Android workflow даёт .aab артефакт
- iOS workflow прогоняет `fastlane ios beta` без ошибок (загрузка в TestFlight)
