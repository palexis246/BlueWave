import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Button,
  Alert,
  SafeAreaView,
} from "react-native";
import { useBluetooth } from "../hooks/useBluetooth";
import { useGyroscope } from "../hooks/useGyroscope";
import { usePermissions } from "../hooks/usePermissions";
import RadarChart from "../components/RadarChart";
import DeviceInfoModal from "../components/DeviceInfoModal";
import { GyroData, ScannedDevice } from "../types/mainTypes";
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { RADAR_RADIUS } from "../constants/mainConstants";
import { BLEService } from "../utils/BleManager";
import { StatusBar } from "expo-status-bar";

export default function RadarScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<
    ScannedDevice | undefined
  >(undefined);
  const [isScanning, setIsScanning] = useState(false);
  const deviceInitialAngles = useRef<Record<string, GyroData>>({});
  const gyroOffset = useRef<GyroData>({ x: 0, y: 0, z: 0 });

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const { gyroData } = useGyroscope(isScanning);
  const { allPermissionsGranted } = usePermissions();
  const { isBluetoothActive, devices, setDevices, setIsBluetoothActive } =
    useBluetooth(
      isScanning,
      deviceInitialAngles,
      gyroOffset,
      gyroData,
      allPermissionsGranted
    );

  const rotateDeg = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotateDeg.value}deg` }],
    };
  });

  // useEffect for the rotation animation
  useEffect(() => {
    const animateRotation = () => {
      if (isScanning) {
        if (rotateDeg.value === 0 || rotateDeg.value === 360)
          rotateDeg.value = withRepeat(
            withTiming(360, { duration: 4000, easing: Easing.linear }),
            -1,
            false
          );
      } else {
        cancelAnimation(rotateDeg);
        rotateDeg.value = withTiming(0, {
          duration: 500,
          easing: Easing.inOut(Easing.ease),
        });
      }
    };

    animateRotation();

    return () => {
      cancelAnimation(rotateDeg);
    };
  }, [isScanning, rotateDeg]);

  useEffect(() => {
    // Calibrate gyroscope on mount
    gyroOffset.current = { ...gyroData };
  }, []);

  useEffect(() => {
    if (allPermissionsGranted && isBluetoothActive) {
      setIsScanning(true);
    } else {
      setIsScanning(false);
    }
  }, [allPermissionsGranted, isBluetoothActive]);

  const handleDevicePress = (device: ScannedDevice) => {
    setSelectedDevice(device);
    setModalVisible(true);
  };

  const getDevicePosition = (device: ScannedDevice) => {
    const deviceId = device.id;

    if (!deviceInitialAngles.current[deviceId]) {
      return { x: RADAR_RADIUS, y: RADAR_RADIUS };
    }

    const initialAngle =
      deviceInitialAngles.current[deviceId].z - gyroOffset.current.z;
    const currentAngle = gyroData.z;
    const calibratedAngle = currentAngle - gyroOffset.current.z;
    const angleDifference = calibratedAngle - initialAngle;

    const angle =
      devices.length > 1
        ? (devices.findIndex((d) => d.id === deviceId) / devices.length) * 360
        : 0;

    const angleInRadians = ((angle - angleDifference * 100) * Math.PI) / 180;
    const scaledDistance = (device.distance / 10) * RADAR_RADIUS;

    // Ensure that icons don't overlap when very close
    const separation = Math.max(0, scaledDistance - 15);
    const x = RADAR_RADIUS + separation * Math.cos(angleInRadians);
    const y = RADAR_RADIUS + separation * Math.sin(angleInRadians);

    return { x, y };
  };

  const handleScanButtonPress = () => {
    if (!isScanning) {
      // Start scanning
      setDevices([]); // Clear devices when starting a new scan

      if (allPermissionsGranted) {
        // Check if Bluetooth is enabled before starting the scan
        if (isBluetoothActive) {
          setIsScanning(true);
          // No need to call startScan here since it's handled in useBluetooth
        } else {
          // Prompt the user to enable Bluetooth
          Alert.alert(
            "Bluetooth is OFF",
            "Please turn on Bluetooth to start scanning.",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Enable",
                onPress: async () => {
                  try {
                    await BLEService.manager.enable();
                    setIsBluetoothActive(true);
                    setIsScanning(true);
                    // Start scanning after Bluetooth is enabled
                  } catch (error) {
                    console.error("Error enabling Bluetooth:", error);
                    Alert.alert(
                      "Error",
                      "Failed to enable Bluetooth. Please enable it manually."
                    );
                  }
                },
              },
            ]
          );
        }
      }
    } else {
      // Stop scanning
      setIsScanning(false);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>BlueWave Radar</Text>
          <Button
            title={isScanning ? "Stop Scan" : "Start Scan"}
            onPress={handleScanButtonPress}
            disabled={!allPermissionsGranted || !isBluetoothActive}
          />
        </View>

        <View style={styles.radarContainer}>
          <RadarChart animatedStyle={animatedStyle} />

          {/* Device Icons */}
          {devices.map((device) => {
            const position = getDevicePosition(device);
            return (
              <TouchableOpacity
                key={device.id}
                style={{
                  position: "absolute",
                  left: position.x - 15,
                  top: position.y - 15,
                }}
                onPress={() => handleDevicePress(device)}
              >
                <View style={styles.deviceIcon}>
                  <Text style={styles.deviceText}>
                    {device.name?.charAt(0)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Modal for Device Information */}
        <DeviceInfoModal
          modalVisible={modalVisible}
          selectedDevice={selectedDevice}
          setModalVisible={setModalVisible}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
        />
      </SafeAreaView>
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    padding: 10,
    position: "absolute",
    top: 40,
  },
  header: {
    fontSize: 24,
  },
  radarContainer: {
    position: "relative",
    width: RADAR_RADIUS * 2,
    height: RADAR_RADIUS * 2,
    marginTop: 50,
  },
  deviceIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
  },
  deviceText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
