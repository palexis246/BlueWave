# BlueWave: A Bluetooth LE Radar App
Bluetooth radar that scans the surroundings to detect devices and their position.

![BlueWaveSample2](https://github.com/user-attachments/assets/e3762cd3-698f-4806-8976-c5ba46856591)
![BlueWaveSample1](https://github.com/user-attachments/assets/c14a9cea-3a30-4597-a6e0-bda789cc230b)

## Overview

BlueWave is a React Native application built with Expo that visualizes nearby Bluetooth Low Energy (BLE) devices on a radar-like interface. It uses the device's gyroscope to dynamically adjust the position of the device icons on the radar, creating an intuitive and interactive experience.

**Features:**

*   **Real-time BLE Scanning:** Scans for nearby BLE devices and displays them on a radar chart.
*   **Distance Estimation:** Approximates the distance to each device based on the received signal strength (RSSI).
*   **Gyroscope Integration:** Uses the device's gyroscope to update the radar's orientation, providing a more immersive experience.
*   **Animated Radar Chart:** Features a visually appealing radar chart with animated circles and labels.
*   **Device Information Modal:** Displays detailed information about a selected device in a modal.
*   **Permission Handling:** Requests necessary permissions (location, Bluetooth, nearby devices, activity recognition) and gracefully handles permission denials.
*   **Bluetooth State Management:** Monitors Bluetooth status and prompts the user to enable it if it's turned off.

## Technical Choices

BlueWave is built using the following technologies:

*   **React Native:** A framework for building cross-platform mobile applications using JavaScript/TypeScript and React.
*   **Expo:** A set of tools and services built around React Native that simplifies development, building, and deployment.
*   **TypeScript:** A superset of JavaScript that adds static typing, improving code quality and maintainability.
*   **`react-native-ble-plx`:** A library for interacting with Bluetooth Low Energy devices.
*   **`expo-location`:** An Expo module for accessing location services and requesting location permissions.
*   **`expo-sensors`:** An Expo module for accessing device sensors, including the gyroscope.
*   **`react-native-reanimated`:** A library for creating smooth and performant animations.
*   **`react-native-svg`:** A library for rendering scalable vector graphics (SVG), used for drawing the radar chart.

**Rationale:**

*   **Expo:** Chosen for its ease of use, rapid development capabilities, and excellent cross-platform support. The managed workflow simplifies the build process and provides access to a wide range of device APIs.
*   **TypeScript:** Provides type safety, improves code maintainability, and enhances developer productivity.
*   **`react-native-ble-plx`:** A well-established and actively maintained library for BLE interaction in React Native. It offers a comprehensive API and good platform support.
*   **`expo-location`:** The standard way to access location services in Expo applications. It provides a simple API for requesting permissions and retrieving location data.
*   **`expo-sensors`:** Provides easy access to device sensors, including the gyroscope, within the Expo ecosystem.
*   **`react-native-reanimated`:** Offers superior performance compared to the standard React Native `Animated` API, making it suitable for UI-intensive animations.
*   **`react-native-svg`:** A powerful and flexible library for rendering vector graphics, allowing for the creation of a visually appealing and scalable radar chart.

**Custom Hooks:**

*   **`useBluetooth`:** Manages Bluetooth scanning, device state, and the enabling/disabling of Bluetooth.
*   **`useGyroscope`:** Handles gyroscope data updates and subscriptions.
*   **`usePermissions`:** Encapsulates the logic for requesting and checking necessary permissions (location, Bluetooth, nearby devices, activity recognition).

**Components Structure:**

*   **`RadarScreen`:** The main component that orchestrates the app's functionality and UI.
*   **`RadarChart`:** A reusable component that renders the animated radar chart.
*   **`DeviceInfoModal`:** A reusable component that displays information about a selected device.

## Build Instructions

**Prerequisites:**

*   Node.js (LTS version recommended)
*   npm or Yarn
*   Expo CLI: `npm install -g expo-cli`

**Steps:**

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd <project_directory>
    ```

2.  **Install dependencies:**

    ```bash
    npx expo install
    ```

    or

    ```bash
    npx yarn install
    ```

3.  **Start the development server:**

    ```bash
    npx expo start
    ```

    or

    ```bash
    npx yarn start
    ```

4.  **Run the app:**
    *   **Expo Go App:** Install the Expo Go app on your physical device or simulator/emulator. Scan the QR code that appears in the terminal or browser window where you ran `npx expo start`.
    *   **Development Build (Recommended for Testing Bluetooth):** Create a development build to install the app directly on your device or simulator/emulator:
        *   Install the `expo-dev-client`:
            ```bash
            npx expo install expo-dev-client
            ```
        *   Build the development client:
            ```bash
            npx eas build --profile development --platform all
            ```
            or for specific platform:
            ```bash
            npx eas build --profile development --platform android
            npx eas build --profile development --platform ios
            ```
        *   Install the generated build on your device or simulator/emulator.

**Note:** Bluetooth functionality might not be fully supported on simulators/emulators. It's recommended to test on a real device for the best experience.

## Troubleshooting

*   **Permissions Issues:** If the app doesn't prompt for permissions or the scan doesn't start, make sure you've correctly configured the permissions in `app.json` and that the `usePermissions` hook is implemented correctly. Double-check that you are testing on a real device for accurate permission handling, as simulators might behave differently.
*   **Bluetooth Not Turning On:** If the app fails to enable Bluetooth, ensure that your device has Bluetooth enabled in its system settings. On Android, you may need to manually enable Bluetooth in the settings.
*   **Device Not Showing:** Make sure your device is discoverable and that it is advertising properly. Make sure that the device supports BLE technology.
*   **App Crashing:** If the app crashes, use the debugging tools in Expo and React Native to inspect the error logs and identify the source of the problem.

## Further Improvements

*   **Error Handling:** Implement more robust error handling throughout the app, especially in the Bluetooth scanning and permission request logic.
*   **Background Scanning:** Explore options for background scanning, but be mindful of platform limitations and battery usage.
*   **Calibration:** Add a feature to calibrate the `txPower` value used in the distance calculation for more accurate results.
*   **Filtering and Sorting:** Allow users to filter and sort the list of scanned devices based on various criteria (e.g., name, RSSI, distance).
*   **UI/UX Enhancements:** Improve the user interface and user experience, potentially adding features like device filtering, sorting, and more detailed device information.

## Important Note: iOS Testing

Please note that this application has been primarily developed and tested on Android devices. **I do not currently own a physical iOS device, so I have not been able to test the app on real iOS hardware.**

While the app is built using cross-platform technologies (React Native, Expo) and should theoretically work on iOS, there might be unforeseen issues or differences in behavior on real iPhones or iPads.

**I highly recommend testing the app on real iOS devices before using it in a production environment.** If you encounter any problems on iOS, please feel free to open an issue on the GitHub repository, and I'll do my best to address it, although my ability to debug iOS-specific issues might be limited without access to physical hardware.

Contributions from developers with access to iOS devices are very welcome!
