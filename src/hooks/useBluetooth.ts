import { useState, useEffect, useRef } from "react";
import {
  ScanMode,
  Device,
  BleError,
  State as BluetoothState,
} from "react-native-ble-plx";
import { Alert, AppState } from "react-native";
import { GyroData, PermissionStatus, ScannedDevice } from "../types/mainTypes";
import { BLEService } from "../utils/BleManager";

const calculateDistance = (rssi: number) => {
  // txPower: Represents the typical Received Signal Strength Indication (RSSI) value at 1 meter from the device.
  // It's a calibrated value that can vary depending on the device. -59 dBm is a common default.
  const txPower = -59;

  // Calculate the distance based on the log-distance path loss model.
  // This formula is a standard approximation used in radio signal propagation.
  // Formula: distance = 10 ^ ((txPower - rssi) / (10 * n))
  // - rssi: The measured RSSI value from the BLE device.
  // - txPower: The RSSI value at 1 meter (used as a reference).
  // - n: The path loss exponent, which depends on the environment (e.g., 2 in free space, higher in environments with obstacles).
  // Here, we use n = 2 as an approximation.

  // Math.pow(10, (txPower - rssi) / (10 * 2)) calculates the distance:
  // 1. (txPower - rssi): Calculates the signal loss (path loss).
  // 2. / (10 * 2): Divides the path loss by (10 * n) to scale it. Using '2' for 'n' is a common simplification for indoor environments.
  // 3. Math.pow(10, ...): Raises 10 to the power of the result to get the distance estimation.

  // Math.min(10, ...): Caps the calculated distance at 10 meters. This is because RSSI-based distance estimations
  // are very unreliable beyond a certain range, and we're limiting the radar to 10 meters.

  return Math.min(10, Math.pow(10, (txPower - rssi) / (10 * 2)));
};

/**
 * Custom hook for managing Bluetooth scanning and device state.
 *
 * @param {boolean} isScanning - Whether the app should be scanning for devices.
 * @param {React.MutableRefObject<Record<string, GyroData>>} deviceInitialAngles - Ref to store the initial gyroscope angles for each scanned device.
 * @param {React.MutableRefObject<GyroData>} gyroOffset - Ref to store the initial gyroscope offset for calibration.
 * @param {GyroData} gyroData - Current gyroscope data.
 * @param {PermissionStatus} allPermissionsGranted - Status of all required permissions.
 * @returns {{
 *   isBluetoothActive: boolean,
 *   devices: ScannedDevice[],
 *   setDevices: React.Dispatch<React.SetStateAction<ScannedDevice[]>>,
 *   setIsBluetoothActive: React.Dispatch<React.SetStateAction<boolean>>,
 * }} - An object containing Bluetooth status, scanned devices, and functions to manage scanning.
 */

export const useBluetooth = (
  isScanning: boolean,
  deviceInitialAngles: React.MutableRefObject<Record<string, GyroData>>,
  gyroOffset: React.MutableRefObject<GyroData>,
  gyroData: GyroData,
  allPermissionsGranted: PermissionStatus
) => {
  const [isBluetoothActive, setIsBluetoothActive] = useState(false);
  const [devices, setDevices] = useState<ScannedDevice[]>([]);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const checkBluetoothState = async () => {
      try {
        const state: BluetoothState = await BLEService.manager.state();
        setIsBluetoothActive(state === "PoweredOn");
        if (state === "PoweredOn" && isScanning) {
          startScan();
        } else if (state !== "PoweredOn") {
          Alert.alert(
            "Bluetooth is OFF",
            "Turn ON Bluetooth?",
            [
              {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel",
              },
              {
                text: "OK",
                onPress: () => BLEService.manager.enable(),
              },
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        console.error("Error checking Bluetooth state:", error);
        setIsBluetoothActive(false);
      }
    };

    checkBluetoothState();

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          checkBluetoothState();
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      appStateSubscription.remove();
    };
  }, [isScanning]);

  const startScan = () => {
    BLEService.manager.startDeviceScan(
      [],
      { scanMode: ScanMode.Balanced },
      (error: BleError | null, device: Device | null) => {
        if (error) {
          console.error(error);
          return;
        }
        if (device && device.rssi !== null) {
          const distance = calculateDistance(device.rssi);
          if (
            distance <= 10 &&
            !(distance === 10 && device.name !== "Unknown")
          ) {
            setDevices((prevDevices) => {
              const existingDeviceIndex = prevDevices.findIndex(
                (d) => d.id === device.id
              );
              if (existingDeviceIndex === -1) {
                deviceInitialAngles.current[device.id] = {
                  x: gyroData.x,
                  y: gyroData.y,
                  z: gyroData.z - gyroOffset.current.z,
                };
                return [
                  ...prevDevices,
                  {
                    id: device.id,
                    name: device.name || "Unknown",
                    distance,
                  },
                ];
              } else {
                return prevDevices.map((d) =>
                  d.id === device.id
                    ? { ...d, distance, name: device.name || "Unknown" }
                    : d
                );
              }
            });
          }
        }
      }
    );
  };

  useEffect(() => {
    if (isScanning && isBluetoothActive && allPermissionsGranted) {
      startScan();
    } else {
      BLEService.manager.stopDeviceScan();
    }
  }, [isScanning, isBluetoothActive, setIsBluetoothActive]);

  return {
    isBluetoothActive,
    devices,
    setDevices,
    setIsBluetoothActive,
  };
};
