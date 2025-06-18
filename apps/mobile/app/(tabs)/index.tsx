import { Colors } from "@/assets/styles/Colors";
import { createStyles } from "@/assets/styles/Stylesheet";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ThemedText } from "@/components/ThemedText";
import { DistanceMeasurement } from "@/models/DistanceMeasurement.dto";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@env";
import { createClient } from "@supabase/supabase-js";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CRITICAL_DISTANCE: number = 40;

export default function HomeScreen() {
  const styles = createStyles();
  const { width } = Dimensions.get("window");
  const [distanceMeasurements, setDistanceMeasurements] = useState<
    DistanceMeasurement[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Check existing permissions using expo-notifications
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo push token:', token);

    return token;
  }


  const fetchDistanceMeasurements = async () => {
    const { data, error } = await supabase
      .from("device_data")
      .select("*")
      .not("device_id", "eq", "test")
      .order("timestamp", { ascending: false })
      .limit(5);

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

  const isBatteryLow = (battery_status: string): boolean => {
    return battery_status === "LOW";
  }

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, "0");
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${dd}.${MM}.${yy} ${hh}:${mm}`;
  };

  const averageDistance =
    distanceMeasurements.length > 0
      ? distanceMeasurements.reduce(
          (sum, measurement) => sum + measurement.distance,
          0
        ) / distanceMeasurements.length
      : 0;

  const fillPercentage = Math.max(
    0,
    Math.min(100, 100 - (averageDistance / CRITICAL_DISTANCE) * 100)
  );

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: false,
      }),
    });

    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    if (!loading && averageDistance >= CRITICAL_DISTANCE) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Pellet Nachschub benötigt!",
          body: `Der Füllstand ist kritisch: ${averageDistance.toFixed(1)} cm`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    } else if (!loading && isBatteryLow(distanceMeasurements[0].battery_status)) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Batterie muss ausgewechselt werden!",
          body: `Die Batterie hat nicht mehr genug Akku, um den Sensor zu betreiben`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    }
  }, [loading, distanceMeasurements, averageDistance]);

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
        {loading ? (
          <>
            <LoadingSpinner />
          </>
        ) : (
          <>
            {/* Overview content */}
            <View style={styles.statusRow}>
              <View style={styles.progressContainer}>
                <View style={styles.progressOuter}>
                  <View
                    style={[
                      styles.progressInner,
                      { height: `${fillPercentage}%` },
                    ]}
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
                  <Text style={styles.value}>
                    {` ` + fillPercentage.toFixed(0)}%
                  </Text>
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
                    {` ` + formatDateTime(distanceMeasurements[0]?.timestamp || "")}
                  </Text>
                </Text>
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        isBatteryLow(distanceMeasurements[0].battery_status)
                          ? Colors.warning
                          : Colors.success,
                    },
                  ]}
                >
                  {isBatteryLow(distanceMeasurements[0].battery_status)
                    ? "Batterie Kapazität kritisch"
                    : "Batteriestand OK"}
                </Text>
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        averageDistance >= CRITICAL_DISTANCE
                          ? Colors.warning
                          : Colors.success,
                    },
                  ]}
                >
                  {averageDistance >= CRITICAL_DISTANCE
                    ? "Benötigt Pellet-Nachschub"
                    : "Füllstand OK"}
                </Text>
              </View>
            </View>

            {/* List Section */}
            <View style={styles.measurementsList}>
              <View style={styles.tableWrapper}>
                <ThemedText type="subtitle" style={styles.tableTitle}>
                  Letzte Messungen
                </ThemedText>

                <View style={styles.table}>
                  {/* Table Header */}
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableHeader]}>
                      Zeit
                    </Text>
                    <Text style={[styles.tableCell, styles.tableHeader]}>
                      Distanz (cm)
                    </Text>
                  </View>

                  {/* Table Rows */}
                  {distanceMeasurements.slice(0, 5).map((item) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={styles.tableCell}>
                        {formatDateTime(item.timestamp)}
                      </Text>
                      <Text style={styles.tableCell}>
                        {item.distance.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
