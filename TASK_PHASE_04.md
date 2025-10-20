# 🧩 TASK_PHASE_04.md — Автоподписание и Secrets (iOS + Android)
## Цель
Собрать iOS через TestFlight с автоматической подписью и настроить Android релизную подпись.

---

## 1) iOS — App Store Connect API Key
Workflow уже готов (PHASE_03). Убедись, что секреты заданы:  
`APP_STORE_CONNECT_API_KEY_ID`, `APP_STORE_CONNECT_API_ISSUER_ID`, `APP_STORE_CONNECT_API_KEY_CONTENT`, `APPLE_TEAM_ID`, `APPLE_ID_EMAIL`, `APPLE_APP_ID`.

---

## 2) (Опционально) Fastlane Match для профилей
Добавь `fastlane/Matchfile`:
```ruby
git_url(ENV['MATCH_GIT_URL'])
storage_mode("git")
type("appstore")
username(ENV['APPLE_ID_EMAIL'])
team_id(ENV['APPLE_TEAM_ID'])
git_branch(ENV['MATCH_GIT_BRANCH'] || "main")
```
Secrets для Match (если используем):
- MATCH_GIT_URL
- MATCH_GIT_BRANCH
- MATCH_PASSWORD

И добавь в `Fastfile` до `build_app` (по желанию):
```ruby
match(
  type: "appstore",
  readonly: true,
  git_url: ENV['MATCH_GIT_URL'],
  git_branch: ENV['MATCH_GIT_BRANCH'] || "main",
  storage_mode: "git",
  username: ENV['APPLE_ID_EMAIL'],
  app_identifier: ENV['APPLE_APP_ID'],
  team_id: ENV['APPLE_TEAM_ID'],
  keychain_name: "login.keychain-db"
)
```

---

## 3) Android — релизная подпись
Создать keystore локально (если нет) и закодировать base64 для GitHub Secrets:

```bash
keytool -genkeypair -v -storetype JKS -keystore release.keystore -alias upload -keyalg RSA -keysize 2048 -validity 36500
base64 release.keystore > release.keystore.base64
```

Добавить Secrets:
- ANDROID_KEYSTORE_BASE64
- ANDROID_KEYSTORE_PASSWORD
- ANDROID_KEY_ALIAS (например `upload`)
- ANDROID_KEY_PASSWORD

### 📄 android/gradle.properties (или через env)
```
MYAPP_KEYSTORE_PASSWORD=${ANDROID_KEYSTORE_PASSWORD}
MYAPP_KEY_ALIAS=${ANDROID_KEY_ALIAS}
MYAPP_KEY_PASSWORD=${ANDROID_KEY_PASSWORD}
```

### 📄 android/app/build.gradle — подпись
```gradle
android {
  signingConfigs {
    release {
      if (System.getenv("ANDROID_KEYSTORE_PATH") != null) {
        storeFile file(System.getenv("ANDROID_KEYSTORE_PATH"))
      }
      storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD") ?: project.findProperty("MYAPP_KEYSTORE_PASSWORD")
      keyAlias System.getenv("ANDROID_KEY_ALIAS") ?: project.findProperty("MYAPP_KEY_ALIAS")
      keyPassword System.getenv("ANDROID_KEY_PASSWORD") ?: project.findProperty("MYAPP_KEY_PASSWORD")
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
      minifyEnabled false
      shrinkResources false
    }
  }
}
```

В Android workflow перед сборкой добавить шаг восстановления keystore:
```yaml
- name: Restore keystore
  run: |
    echo "$ANDROID_KEYSTORE_BASE64" | base64 --decode > android/release.keystore
    echo "ANDROID_KEYSTORE_PATH=$GITHUB_WORKSPACE/android/release.keystore" >> $GITHUB_ENV
```

---

## 4) Acceptance
- iOS билд уходит в TestFlight без ручной подписи
- Android `.aab` подписан релизным ключом
