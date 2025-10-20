# 🧩 TASK_PHASE_06.md — Финализация MVP и релизные сборки
## Цель
Собрать демонстрационные билды, проверить флоу и задеплоить TestFlight/артефакты Android.

---

## 1) Финальные проверки
- iOS Debug: автозапуск Metro работает; сцена AR воспроизводит видео на метке
- Android Debug: ARCore устройства открывают сцену; неподдерживаемые — получают заглушку
- QR Mode: сканирует и открывает видео

---

## 2) Release-сборка iOS (офлайн-бандл)
```bash
npx react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios
# В Xcode выбери Scheme: Release, устройство: iPhone, Run
```
Или Fastlane (через CI): `bundle exec fastlane ios beta`

---

## 3) Release Android
```bash
cd android && ./gradlew bundleRelease
# артефакт: android/app/build/outputs/bundle/release/*.aab
```

---

## 4) Документация
Обнови `README.md` разделами:
- Требования к устройствам (ARKit/ARCore)
- AR печать метки и physicalWidth
- Переключение AR/QR
- Как запустить локально (iOS/Android)
- CI/CD и Secrets

---

## 5) Acceptance
- iOS билд доступен в TestFlight
- Android .aab загружается в Play Console (internal testing)
- README содержит пошаговые инструкции
