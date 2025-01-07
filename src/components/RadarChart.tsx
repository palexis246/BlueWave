import React, { memo, useMemo } from "react";
import Animated from "react-native-reanimated";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import {
  center,
  NUM_CIRCLES,
  RADAR_COLOR,
  RADAR_RADIUS,
  RADAR_TEXT_METERS_COLOR,
  viewBoxSize,
  viewBoxSizePadding,
} from "../constants/mainConstants";
import { RadarChartProps } from "../types/mainTypes";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * RadarChart component: Renders an animated radar chart with concentric circles and labels.
 * This component is memoized to prevent unnecessary re-renders.
 */
const RadarChart: React.FC<RadarChartProps> = ({ animatedStyle }) => {
  // Memoize the radar circles and labels to optimize rendering
  // The result of this function will only be recalculated if 'center' changes
  const radarCircles = useMemo(() => {
    // Create an array with a length equal to the number of radar circles
    return Array.from({ length: NUM_CIRCLES }).map((_, index) => {
      // Calculate the radius for each circle based on its index
      const radius = ((index + 1) * RADAR_RADIUS) / NUM_CIRCLES;
      // Create the label text for each circle (e.g., "1.0m", "2.0m", etc.)
      const labelValue = (((index + 1) / NUM_CIRCLES) * 10).toFixed(1);

      // Calculate the x and y coordinates for the label, adding an offset
      const labelXOffset = 32;
      const labelX = center + labelXOffset;
      const labelY = center - radius + 5;

      return (
        <React.Fragment key={`circle-${index}`}>
          {/* Render an animated circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={RADAR_COLOR}
            strokeWidth="2"
            fill="none"
          />
          {/* Render the label text */}
          <SvgText
            x={labelX}
            y={labelY}
            fontSize="12"
            fill={RADAR_TEXT_METERS_COLOR}
            textAnchor="middle"
            dx="0"
          >
            {labelValue}m
          </SvgText>
        </React.Fragment>
      );
    });
  }, [center]); // The dependency array ensures that radarCircles is recalculated only when center changes

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.radarContainer}>
        <Svg
          height={viewBoxSize}
          width={viewBoxSize}
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        >
          {/* Render the memoized radar circles */}
          {radarCircles}
        </Svg>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: RADAR_RADIUS * 2 + viewBoxSizePadding,
    height: RADAR_RADIUS * 2 + viewBoxSizePadding,
    justifyContent: "center",
    alignItems: "center",
  },
  radarContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
});

export default memo(RadarChart);
