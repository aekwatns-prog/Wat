# การสร้าง APK สำหรับ My Article

## วิธีที่ 1: ใช้ GitHub Actions (แนะนำ)

### ขั้นตอนที่ 1: Push ไปยัง GitHub
```bash
git add .
git commit -m "Add Capacitor and GitHub Actions workflow"
git push origin main
```

### ขั้นตอนที่ 2: GitHub Actions จะสร้าง APK อัตโนมัติ
- ไปที่ Actions tab ใน GitHub repository
- ดูการสร้าง APK ที่กำลังทำงาน
- ดาวน์โหลด APK จาก Artifacts เมื่อเสร็จสิ้น

## วิธีที่ 2: สร้าง APK ในเครื่องของคุณ

### ข้อกำหนด:
- Node.js 22+
- Java Development Kit (JDK) 17+
- Android SDK
- Android Studio (ไม่บังคับ)

### ขั้นตอนที่ 1: ติดตั้ง Android SDK
```bash
# บน macOS
brew install android-sdk

# บน Linux
sudo apt-get install android-sdk

# บน Windows
# ดาวน์โหลดจาก https://developer.android.com/studio
```

### ขั้นตอนที่ 2: ตั้งค่า Environment Variables
```bash
export ANDROID_SDK_ROOT=/path/to/android/sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools
```

### ขั้นตอนที่ 3: สร้าง APK
```bash
# 1. สร้าง web build
pnpm build

# 2. เพิ่ม Android platform
npx cap add android

# 3. สร้าง APK
cd android
./gradlew assembleDebug
cd ..

# APK จะถูกสร้างที่: android/app/build/outputs/apk/debug/app-debug.apk
```

### ขั้นตอนที่ 4: ลงนาม APK (สำหรับ Release)
```bash
# สร้าง keystore (ทำครั้งแรกเท่านั้น)
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias

# ลงนาม APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore android/app/build/outputs/apk/debug/app-debug.apk my-key-alias

# ปรับให้เหมาะสม
zipalign -v 4 android/app/build/outputs/apk/debug/app-debug.apk MyArticle-release.apk
```

## วิธีที่ 3: ใช้ Android Studio GUI

### ขั้นตอน:
1. เปิด Android Studio
2. File → Open → เลือก `android` folder
3. Build → Generate Signed Bundle / APK
4. ทำตามขั้นตอนใน wizard

## การทดสอบ APK

### ใช้ Android Emulator:
```bash
# เปิด emulator
emulator -avd <emulator_name>

# ติดตั้ง APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# เปิดแอป
adb shell am start -n com.myarticle.app/.MainActivity
```

### ใช้ Device จริง:
```bash
# เชื่อมต่อ device ผ่าน USB
adb devices

# ติดตั้ง APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## การแก้ไขปัญหา

### ปัญหา: "ANDROID_SDK_ROOT not set"
```bash
# ตั้งค่า environment variable
export ANDROID_SDK_ROOT=/path/to/android/sdk
```

### ปัญหา: "Gradle build failed"
```bash
# ล้าง Gradle cache
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

### ปัญหา: "Java version mismatch"
```bash
# ตรวจสอบ Java version
java -version

# ตั้งค่า JAVA_HOME
export JAVA_HOME=/path/to/jdk17
```

## การสร้าง Release APK

### ขั้นตอนที่ 1: สร้าง Release Build
```bash
cd android
./gradlew assembleRelease
cd ..
```

### ขั้นตอนที่ 2: ลงนาม Release APK
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-release-key.keystore \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  my-key-alias
```

### ขั้นตอนที่ 3: ปรับให้เหมาะสม
```bash
zipalign -v 4 android/app/build/outputs/apk/release/app-release-unsigned.apk \
  MyArticle-release.apk
```

## ข้อมูลเพิ่มเติม

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Development Guide](https://developer.android.com/guide)
- [Gradle Documentation](https://gradle.org/guides/)

---

**หมายเหตุ:** APK ที่สร้างจาก GitHub Actions จะเป็น Debug APK ซึ่งเหมาะสำหรับการทดสอบ หากต้องการ Release APK สำหรับ Google Play Store ให้ทำตามขั้นตอน "การสร้าง Release APK" ข้างต้น
