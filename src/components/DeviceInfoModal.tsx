import { memo, Fragment } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScannedDevice } from "../types/mainTypes";

/**
 * DeviceInfoModal Component
 *
 * A modal component that displays information about a selected scanned device.
 *
 * Props:
 *  - modalVisible: A boolean indicating whether the modal is visible or not.
 *  - selectedDevice: The ScannedDevice object containing information about the selected device.
 *  - setModalVisible: A function to set the visibility state of the modal.
 *  - screenWidth: The width of the device screen.
 *  - screenHeight: The height of the device screen.
 */
const DeviceInfoModal = memo(
  ({
    modalVisible,
    selectedDevice,
    setModalVisible,
    screenWidth,
    screenHeight,
  }: {
    modalVisible: boolean;
    selectedDevice: ScannedDevice | undefined;
    setModalVisible: any;
    screenWidth: number;
    screenHeight: number;
  }) => {
    return (
      <Fragment>
        {/* Render the modal only if modalVisible is true */}
        {modalVisible ? (
          <View style={styles.modalContainer}>
            <Modal
              transparent
              visible
              animationType="fade"
              onRequestClose={() => setModalVisible(false)}
            >
              {/* Modal background */}
              <View style={styles.modalBackground}>
                {/* Modal content container */}
                <View
                  style={[
                    styles.modalContent,
                    {
                      // Calculate the position of the modal to center it on the screen
                      left: (screenWidth - screenWidth * 0.8) / 2,
                      top: (screenHeight - 200) / 2,
                    },
                  ]}
                >
                  {/* Display the device name or "Unknown" if not available */}
                  <Text style={styles.deviceInfo}>
                    Name: {selectedDevice?.name || "Unknown"}
                  </Text>
                  {/* Display the distance of the device, rounded to 2 decimal places */}
                  <Text style={styles.deviceInfo}>
                    Distance: {selectedDevice?.distance.toFixed(2)} meters
                  </Text>
                  {/* Display the ID of the device */}
                  <Text style={styles.deviceInfo}>
                    ID: {selectedDevice?.id}
                  </Text>
                  {/* Close button */}
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButton}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        ) : null}
      </Fragment>
    );
  }
);

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject, // Overlay the entire screen
    backgroundColor: "transparent",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
  },
  modalContent: {
    position: "absolute",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    elevation: 5, // Add a shadow effect (Android)
  },
  deviceInfo: {
    fontSize: 18,
    marginBottom: 10,
  },
  closeButton: {
    fontSize: 16,
    color: "blue",
  },
});

export default DeviceInfoModal;
