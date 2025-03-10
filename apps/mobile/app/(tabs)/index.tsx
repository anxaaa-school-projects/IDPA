import { Colors } from "@/assets/styles/Colors";
import { createStyles } from "@/assets/styles/Stylesheet";
import { ThemedText } from "@/components/ThemedText";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@env";
import { createClient } from "@supabase/supabase-js";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {Dimensions, Text, View} from "react-native";
import Svg, { Path } from "react-native-svg";
import LoadingSpinner from '@/components/LoadingSpinner'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type DistanceMeasurement = {
  id: number;
  deviceId: string;
  distance: number;
  timestamp: string;
};

export default function HomeScreen() {
  const styles = createStyles();
  const { width } = Dimensions.get("window");

  const [distanceMeasurements, setDistanceMeasurements] = useState<
    DistanceMeasurement[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchDistanceMeasurements = async () => {
    const { data, error } = await supabase
      .from("device_data")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setDistanceMeasurements(data);
    }

    setLoading(false);
  };

  // Refresh accounts every time someone navigates to this page.
  useFocusEffect(
    useCallback(() => {
      fetchDistanceMeasurements();
    }, [])
  );

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${dd}.${MM}.${yy} ${hh}:${mm}`;
  }

  const averageDistance =
    distanceMeasurements.length > 0
      ? distanceMeasurements.reduce(
          (sum, measurement) => sum + measurement.distance,
          0
        ) / distanceMeasurements.length
      : 0;

  const fillPercentage = Math.max(
    0,
    Math.min(100, 100 - (averageDistance / 80) * 100)
  );

  const latestReading = distanceMeasurements[0];

  return (
    <View style={styles.body}>
      {/* Decorative header */}
      <Svg
        width={width}
        height={150}
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <Path
          fill={Colors.primary}
          d="M0,96L60,112C120,128,240,160,360,165.3C480,171,600,149,720,138.7C840,128,960,128,1080,138.7C1200,149,1320,171,1380,181.3L1440,192L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
        />
      </Svg>
      <View style={styles.container}>
        { loading ? <>
          <LoadingSpinner />
        </> : <>
          {/* Overview content */}
          <View style={styles.statusRow}>
            <View style={styles.progressContainer}>
              <View style={styles.progressOuter}>
                <View
                  style={[styles.progressInner, { height: `${fillPercentage}%` }]}
                />
              </View>
              <Text style={styles.percentageText}>
                {fillPercentage.toFixed(0)}%
              </Text>
            </View>

            <View style={styles.statsBox}>
              <Text style={styles.title}>Pellet Status</Text>
              <Text style={styles.label}>
                Füllstand:
                <Text style={styles.value}>{` ` + fillPercentage.toFixed(0)}%</Text>
              </Text>
              <Text style={styles.label}>
                &#x2300; Abstand zu den Pellets:
                <Text style={styles.value}>
                  {` ` + averageDistance.toFixed(1)} cm
                </Text>
              </Text>
              <Text style={styles.label}>
                Letzte Messung:
                <Text style={styles.value}>
                  {` ` + formatDateTime(latestReading?.timestamp || '')}
                </Text>
              </Text>
              <Text
                style={[
                  styles.statusText,
                  {
                    color: averageDistance >= 75 ? Colors.warning : Colors.success,
                  },
                ]}
              >
                {averageDistance >= 75 ? "Benötigt bald Nachschub" : "Füllstand OK"}
              </Text>
            </View>
          </View>

          {/* List Section */}
          <View style={styles.measurementsList}>
            <View style={styles.tableWrapper}>
              <ThemedText type="subtitle" style={styles.tableTitle}>
                Letzte 5 Messungen
              </ThemedText>

              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableHeader]}>Zeit</Text>
                  <Text style={[styles.tableCell, styles.tableHeader]}>Distanz (cm)</Text>
                </View>

                {/* Table Rows */}
                {distanceMeasurements.slice(0, 5).map((item) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {formatDateTime(item.timestamp)}
                    </Text>
                    <Text style={styles.tableCell}>{item.distance.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </> }
      </View>
    </View>
  );
}
