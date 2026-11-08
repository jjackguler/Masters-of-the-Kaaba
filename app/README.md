# App package (Capacitor 6)

appId `com.kabeustalari.game` · plugins: `@capacitor/app` (Android back button), `@capacitor/haptics` (vibration), `cordova-plugin-purchase` 13 (one-time unlock: `kabe_full_unlock`).

Build:
1. `cd kaynak && python build.py` → `kaynak/dist/app/www`
2. `cd app && npm ci && rm -rf www && cp -r ../kaynak/dist/app/www www && npx cap sync`
3. Android: `cd android && ./gradlew bundleRelease` (JDK 17 + Android SDK; signing keystore stays with you, never in this repo)
4. iOS: on a Mac, `npx cap open ios` → Xcode → Archive

Note: this project has not been compiled or signed yet; no device tests have been run.
