import { Colors } from "@/assets/styles/Colors";
import { createStyles } from "@/assets/styles/Stylesheet";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { DistanceMeasurement } from "@/models/DistanceMeasurement.dto";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@env";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Settings() {
  const styles = createStyles();

  const [allDistanceMeasurements, setAllDistanceMeasurements] = useState<
    DistanceMeasurement[]
  >([]);
  const [loading, setLoading] = useState(true);

  const generateTestData = () => {
    return {
      device_id: "test",
      distance: Math.random() * 80,
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

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: Colors.headerLight,
        dark: Colors.headerDark,
      }}
      headerImage={
        <IconSymbol
          size={310}
          color={Colors.headerIcon}
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
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
        <Text style={styles.buttonText}>Fetch all measurements</Text>
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
    </ParallaxScrollView>
  );
}
