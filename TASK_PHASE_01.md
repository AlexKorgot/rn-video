# 🧩 TASK_PHASE_01.md
## Цель
Починить запуск JS-приложения (Metro, регистрация компонента, автостарт Metro при сборке Xcode). После выполнения этого файла приложение должно успешно подхватывать Metro и не выдавать ошибку `Invariant Violation: "armvp" has not been registered`.

---

## 1) Создать / проверить `app.json` и `index.js`

### 📄 app.json
```json
{
  "name": "armvp",
  "displayName": "armvp"
}
```

### 📄 index.js
```javascript
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

---

## 2) NPM-скрипт Metro
В `package.json` в секции `scripts` должно быть:
```json
"start": "react-native start"
```

---

## 3) Автозапуск Metro из Xcode (Run Script Phase через Podfile)

Добавь блок в КОНЕЦ `ios/Podfile` и затем выполни `cd ios && pod install && cd ..`:

```ruby
post_install do |installer|
  require 'xcodeproj'
  project_path = Dir['*.xcodeproj'].first
  project = Xcodeproj::Project.open(project_path)
  app_target = project.targets.find { |t| t.product_type == 'com.apple.product-type.application' }

  if app_target
    exists = app_target.build_phases.any? { |bp| bp.isa == 'PBXShellScriptBuildPhase' && bp.name == 'Start Metro (RN)' }
    unless exists
      phase = app_target.new_shell_script_build_phase('Start Metro (RN)')
      phase.shell_script = <<~'SCRIPT'
        if [ "${CONFIGURATION}" != "Debug" ]; then exit 0; fi
        export RCT_METRO_PORT=${RCT_METRO_PORT:=8081}
        if ! command -v nc >/dev/null 2>&1; then echo "nc missing; skip"; exit 0; fi
        if ! nc -z localhost $RCT_METRO_PORT; then
          echo "Starting Metro on $RCT_METRO_PORT..."
          open -g -a Terminal "$SRCROOT/.." --args yarn start
        else
          echo "Metro already running"
        fi
      SCRIPT
      phases = app_target.build_phases
      compile_idx = phases.index { |bp| bp.isa == 'PBXSourcesBuildPhase' } || phases.length
      phases.delete(phase); phases.insert(compile_idx, phase)
      project.save
      puts "✅ Added Run Script Phase: Start Metro (RN)"
    else
      puts "ℹ️ Run Script Phase already exists"
    end
  else
    puts "⚠️ App target not found, skip Metro phase"
  end
end
```

---

## 4) Acceptance
- `app.json` и `index.js` как выше
- `package.json` содержит `"start": "react-native start"`
- В Xcode → Build Phases есть **Start Metro (RN)**
- `yarn start` показывает `Metro waiting on http://localhost:8081`
- Debug запуск из Xcode успешно грузит бандл
