import { useState, useEffect } from "react";
import { Gyroscope, GyroscopeMeasurement } from "expo-sensors";
import { GyroData } from "../types/mainTypes";

/**
 * Custom hook for subscribing to gyroscope updates and managing gyroscope data.
 *
 * @param {boolean} isScanning - Whether the app is currently scanning for devices.
 *                               Gyroscope updates are only subscribed to when scanning is active.
 * @returns {{
 *   gyroData: GyroData
 * }} - An object containing the current gyroscope data.
 */
export const useGyroscope = (isScanning: boolean) => {
  const [gyroData, setGyroData] = useState<GyroData>({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let subscription: any = null; // Initialize subscription here

    // Subscribe to gyroscope updates
    const _subscribe = () => {
      Gyroscope.setUpdateInterval(100); // Set update interval to 100ms
      subscription = Gyroscope.addListener(
        (gyroscopeData: GyroscopeMeasurement) => {
          setGyroData(gyroscopeData);
        }
      );
    };

    // Unsubscribe from gyroscope updates
    const _unsubscribe = () => {
      if (subscription) {
        subscription.remove();
        subscription = null;
      }
    };

    if (isScanning) {
      _subscribe();
    } else {
      _unsubscribe();
    }

    // Cleanup function to unsubscribe when the component unmounts or isScanning changes
    return () => {
      _unsubscribe();
    };
  }, [isScanning]);

  return { gyroData };
};
