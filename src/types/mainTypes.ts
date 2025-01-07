export interface ScannedDevice {
  id: string;
  name: string | null;
  distance: number;
}

export type GyroData = {
  x: number;
  y: number;
  z: number;
};

export type PermissionStatus = boolean;

export interface RadarChartProps {
  animatedStyle: any;
}

export interface DeviceInfoModalProps {
  modalVisible: boolean;
  selectedDevice: ScannedDevice | undefined;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  screenWidth: number;
  screenHeight: number;
}
