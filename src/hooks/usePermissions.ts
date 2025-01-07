import { useState, useEffect } from "react";
import { Platform, PermissionsAndroid, Alert, Linking } from "react-native";
import * as Location from "expo-location";
import { PermissionStatus } from "../types/mainTypes";

/**
 * Custom hook to request and manage necessary permissions for the application.
 * @returns { allPermissionsGranted } - A boolean representing the status of all required permissions.
 */
export const usePermissions = () => {
  // State variable to track if all required permissions are granted
  const [allPermissionsGranted, setAllPermissionsGranted] =
    useState<PermissionStatus>(false);

  // useEffect hook to request permissions when the component mounts
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Request all needed permissions and update the state
        const permissionsGranted = await requestNeededPermissions();
        setAllPermissionsGranted(permissionsGranted);

        // If permissions are not granted, alert the user
        if (!permissionsGranted) {
          Alert.alert(
            "Permissions Required",
            "These permissions are crucial for the app to function properly. Please enable them in the app settings.",
            [
              {
                text: "Cancel",
                onPress: () => {},
                style: "cancel",
              },
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings(), // Open app settings for the user to manually enable permissions
              },
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        // Log any errors during the permission request process
        console.error("Error in permission flow:", error);
        setAllPermissionsGranted(false);
      }
    };

    requestPermissions();
  }, []);

  /**
   * Requests necessary permissions based on the platform and API level.
   * @returns {Promise<boolean>} A promise that resolves to true if all permissions are granted, false otherwise.
   */
  const requestNeededPermissions = async () => {
    // For iOS, only location permission is needed
    if (Platform.OS === "ios") {
      return await requestLocationPermission();
    }

    // For Android, check API level to determine required permissions
    if (
      Platform.OS === "android" &&
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    ) {
      const apiLevel = parseInt(Platform.Version.toString(), 10);

      // For Android API level below 31, request only location permission
      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      // For Android API level 31 and above, request multiple permissions
      if (
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT &&
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
      ) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
        ]);

        // Check if all required permissions are granted
        return (
          result["android.permission.BLUETOOTH_CONNECT"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.BLUETOOTH_SCAN"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.ACCESS_FINE_LOCATION"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.ACTIVITY_RECOGNITION"] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }

    // Default return if no conditions are met
    return false;
  };

  /**
   * Requests the location permission from the user.
   * @returns {Promise<boolean>} A promise that resolves to true if the permission is granted, false otherwise.
   */
  const requestLocationPermission = async () => {
    const locationStatus = await Location.requestForegroundPermissionsAsync();
    return locationStatus.status === "granted";
  };

  // Return the status of all permissions
  return { allPermissionsGranted };
};
