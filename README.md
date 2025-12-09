📱 MyExpiryTracker — Hybrid (Monaca + Cordova)
A lightweight cross-platform expiry date tracking app built using **HTML, CSS, JavaScript, Monaca, and Cordova.**

This hybrid version mirrors the core features of the native Android app while keeping the UI simple, responsive, and easy to deploy across devices.
🚀 Features

Add items with name, category, and expiry date

Receive expiry reminders (via Cordova notification plugin)

Edit and delete saved items

Local storage for offline use

Mobile-first UI

Fast, lightweight, and cross-platform friendly

🛠 Tech Stack
| Component | Technology                     |
| --------- | ------------------------------ |
| Frontend  | HTML, CSS, JavaScript          |
| Framework | Monaca                         |
| Runtime   | Apache Cordova                 |
| Storage   | LocalStorage (or plugin-based) |
| Platform  | Android / Hybrid Mobile        |

📂 Project Structure
MyExpiryTracker-Hybrid/
│
├── www/               # HTML, CSS, JS (App UI + logic)
├── res/               # Icons and splash images
├── config.xml         # Core Cordova/Monaca configuration
├── build.json         # Build settings
├── package.json       # Plugins + metadata
├── project_info.json  # Monaca project data
└── README.md          # Documentation

▶️ How to Run the App
Option 1: Monaca Cloud IDE

Login to Monaca

Import the project

Run in the Monaca Debugger

Build APK when ready

Option 2: Using Cordova (Local Development)

Make sure Cordova is installed:

npm install -g cordova


Then:

cordova platform add android
cordova build android


APK will be generated in:

/platforms/android/app/build/outputs/apk/

📦 Plugins Used

Example (update with actual plugins):

cordova-plugin-local-notifications
cordova-plugin-device
cordova-plugin-splashscreen
cordova-plugin-statusbar
cordova-plugin-dialogs

👩🏻‍💻 Author

Noorunnisa Khan
IT Academic Writer | Python & Data Analytics Learner
GitHub: https://github.com/noorokhan

📝 License

This project is open-source under the MIT License.












