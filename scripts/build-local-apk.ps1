$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectPath
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$env:NODE_ENV = 'production'
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
if (!(Test-Path -LiteralPath 'credentials.json')) { throw 'Baixe primeiro as credenciais com EAS credentials.' }
New-Item -ItemType Directory -Force -Path 'tmp/local-production' | Out-Null
$logPath = Join-Path $projectPath 'tmp/local-production/build.log'
$ErrorActionPreference = 'Continue'
& .\android\gradlew.bat -p android --init-script "$PSScriptRoot/local-release.init.gradle" assembleRelease --console=plain --max-workers=2 2>&1 | Tee-Object -FilePath $logPath
$ErrorActionPreference = 'Stop'
if ($LASTEXITCODE -ne 0) { throw "Build falhou. Consulte $logPath" }
$apkPath = Join-Path $projectPath 'output/apk'
New-Item -ItemType Directory -Force -Path $apkPath | Out-Null
Copy-Item -LiteralPath 'android/app/build/outputs/apk/release/app-release.apk' -Destination "$apkPath/pense-bem-production.apk"
Write-Host "APK pronto: $apkPath/pense-bem-production.apk" -ForegroundColor Green
