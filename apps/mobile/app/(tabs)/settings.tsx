import { Colors } from "@/assets/styles/Colors";
import { createStyles } from "@/assets/styles/Stylesheet";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { DistanceMeasurement } from "@/models/DistanceMeasurement.dto";
import { OPENCAGE_API_KEY, SUPABASE_ANON_KEY, SUPABASE_URL } from "@env";
import { createClient } from "@supabase/supabase-js";
import * as Location from "expo-location";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Settings() {
  const styles = createStyles();

  const [allDistanceMeasurements, setAllDistanceMeasurements] = useState<
    DistanceMeasurement[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [manualLocation, setManualLocation] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [nearbyGateways, setNearbyGateways] = useState<any[]>([]);

  // Backend tests section
  const generateTestData = () => {
    return {
      device_id: "test",
      distance: Math.random() * 100,
      battery_status: "OK",
      timestamp: new Date().toISOString(),
    };
  };

  const sendTestDataToSupabase = async () => {
    let testData = generateTestData();
    const { error } = await supabase.from("device_data").insert([testData]);
    if (error) {
      console.error("Es gab einen Fehler beim Senden der Test-Daten:", error);
    } else {
      alert(`Test-Daten gesendet:\n${JSON.stringify(testData, null, 2)}`);
    }
  };

  const fetchAllDistanceMeasurements = async () => {
    const { data, error } = await supabase
      .from("device_data")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setAllDistanceMeasurements(data);
    }

    setLoading(false);
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, "0");
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear(); // Full year
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${dd}.${MM}.${yyyy} ${hh}:${mm}:${ss}`;
  };

  // Device connection section
  const getDeviceLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permission to access location was denied");
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      lat: location.coords.latitude,
      lon: location.coords.longitude,
    };
  };

  const getCoordinatesFromAddress = async (address: string) => {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        address
      )}&key=${OPENCAGE_API_KEY}`
    );
    const data = await response.json();
    const coords = data?.results?.[0]?.geometry;
    if (coords) {
      return { lat: coords.lat, lon: coords.lng };
    } else {
      throw new Error("Address not found");
    }
  };

  const fetchNearbyGateways = async () => {
    try {
      setNearbyGateways([]);

      const { lat, lon } = useManual
        ? await getCoordinatesFromAddress(manualLocation)
        : await getDeviceLocation();

      const radius = 2500; // in meters
      const apiUrl =
        `https://mapper.packetbroker.net/api/v2/gateways?` +
        `distanceWithin[latitude]=${lat}` +
        `&distanceWithin[longitude]=${lon}` +
        `&distanceWithin[distance]=${radius}` +
        `&netID=000013&tenantID=ttn`;

      console.log(apiUrl);

      const res = await fetch(apiUrl, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data = await res.json();
      setNearbyGateways(data);
    } catch (error) {
      alert(`${error}`);
    }
  };

  const sendTestNotification = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Benachrichtigung",
        body: `Dies ist ein Test.`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  }

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
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: Colors.headerLight,
        dark: Colors.headerDark,
      }}
      headerImage={
        <IconSymbol
          size={310}
          color={Colors.lightGrey}
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      {/*Notification settings section */}
      <Text style={styles.title}>Benachrichtigungen</Text>
      <TouchableOpacity style={styles.button} onPress={sendTestNotification}>
        <Text style={styles.buttonText}>Test Benachrichtigung senden</Text>
      </TouchableOpacity>

      {/* Backend tests section */}
      <Text style={styles.title}>Backend Tests</Text>
      {/* Test data retrieval from Supabase */}
      <Text style={styles.label}>
        <Text style={styles.value}>{`1. `}</Text>
        {`Teste, ob das Senden und Abrufen von Daten aus dem Backend funktioniert.\nDer Test wird keinerlei Einfluss auf den Pellet-Füllstand haben.`}
      </Text>
      <TouchableOpacity style={styles.button} onPress={sendTestDataToSupabase}>
        <Text style={styles.buttonText}>Test Daten senden</Text>
      </TouchableOpacity>

      {/* Retrieve all measurements */}
      <Text style={styles.label}>
        <Text style={styles.value}>{`2. `}</Text>Zeige alle Daten an, die
        Momentan im Backend gespeichert sind:
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={fetchAllDistanceMeasurements}
      >
        <Text style={styles.buttonText}>Alle Messungen abrufen</Text>
      </TouchableOpacity>
      {!loading ? (
        <>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader]}>Gerät</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Zeit</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>
                Distanz (cm)
              </Text>
            </View>

            {allDistanceMeasurements.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  item.device_id === "test" && styles.testRowBackground,
                ]}
              >
                <Text style={styles.tableCell}>{item.device_id}</Text>
                <Text style={styles.tableCell}>
                  {formatDateTime(item.timestamp)}
                </Text>
                <Text style={styles.tableCell}>{item.distance.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <></>
      )}

      {/* device connection section */}
      <Text style={styles.title}>Verbindung zum Gerät</Text>
      <Text style={styles.label}>
        <Text style={styles.value}>{`1. `}</Text>Überprüfe, ob sich ein
        Empfänger für die Daten des Sensors in deiner Nähe befindet.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setUseManual(!useManual)}
      >
        <Text style={styles.buttonText}>
          {useManual
            ? "Standort dieses Handys verwenden"
            : "Standort manuell eingeben"}
        </Text>
      </TouchableOpacity>
      {useManual ? (
        <TextInput
          style={styles.input}
          placeholder="Adresse oder Ort eingeben"
          placeholderTextColor={Colors.lightGrey}
          value={manualLocation}
          onChangeText={setManualLocation}
        />
      ) : null}
      <TouchableOpacity style={styles.button} onPress={fetchNearbyGateways}>
        <Text style={styles.buttonText}>TTN-Gateway-Abdeckung Prüfen</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Gefundene Gateways innerhalb von 2.5 km:</Text>
      {nearbyGateways.length > 0 ? (
        <>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader]}>
                Platzierung
              </Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Online</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>
                Letztes Update
              </Text>
            </View>
            {nearbyGateways.map((gateway) => (
              <View key={gateway.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  {gateway.antennaPlacement
                    ? gateway.antennaPlacement.toLowerCase()
                    : "unbekannt"}
                </Text>
                <Text style={styles.tableCell}>
                  {gateway.online ? "✅" : "❌"}
                </Text>
                <Text style={styles.tableCell}>
                  {formatDateTime(gateway.updatedAt)}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text
            style={[
              styles.label,
              {
                color: Colors.warning,
              },
            ]}
          >
            <Text style={styles.value}>{`1. `}</Text>Stelle sicher, dass du oben
            auf den Button geklickt hast, um nach Gateways in deiner Nähe zu
            suchen.
          </Text>
          <Text
            style={[
              styles.label,
              {
                color: Colors.warning,
              },
            ]}
          >
            <Text style={styles.value}>{`2. `}</Text>Wenn keine Ergebnisse
            angezeigt werden, wurde kein TTN-Gateway in der Nähe des
            ausgewählten Standorts gefunden.
          </Text>
        </>
      )}
    </ParallaxScrollView>
  );
}
