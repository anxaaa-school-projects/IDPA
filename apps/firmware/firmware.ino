#include <lorawan.h>
#include <math.h>

const int sensorPin = A0; // Sharp GP2Y0A21 Distance Sensor Pin
const int lboPin = A4; // Low Battery Output
const int powerPin = 5; // D5 to power the sensor

// OTAA Credentials for TTN
const char *devEui = "60C5A8FFFE789D8B";
const char *appEui = "0000000000000000";
const char *appKey = "A11F6B68B452B8B178DF7DBA4A4A2D21";

// LoRaWAN Interval
const unsigned long interval = 180000; // Send every 3 minutes

char outStr[255];
byte recvStatus = 0;

// Define RFM pins
const sRFM_pins RFM_pins = {
  .CS = SS,
  .RST = RFM_RST,
  .DIO0 = RFM_DIO0,
  .DIO1 = RFM_DIO1,
  .DIO2 = RFM_DIO2,
  .DIO5 = RFM_DIO5,
};

void setup() {
  Serial.begin(115200);
  while (!Serial);

  pinMode(powerPin, OUTPUT); // D5 as output to control power
  digitalWrite(powerPin, LOW); // Initially turn sensor OFF

  pinMode(lboPin, INPUT); // Input for LBO

  if (!lora.init()) {
    Serial.println("RFM95 not detected.");
    delay(5000);
    return;
  }

  lora.setDeviceClass(CLASS_A);
  lora.setDataRate(SF8BW125);
  lora.setChannel(MULTI);
  lora.setDevEUI(devEui);
  lora.setAppEUI(appEui);
  lora.setAppKey(appKey);

  // Attempt to join TTN via OTAA
  bool isJoined;
  do {
    Serial.println("Joining TTN...");
    isJoined = lora.join();
    delay(10000);
  } while (!isJoined);

  Serial.println("Successfully joined TTN network.");
}

void loop() {
  if (millis() - previousMillis > interval) {
    previousMillis = millis();

    // Power ON the sensor
    digitalWrite(powerPin, HIGH);
    delay(100); // Wait for sensor to stabilize

    // Read sensor
    int sensorValue = analogRead(sensorPin);
    float voltage = sensorValue * (5.0 / 1023.0);
    float distance_cm = 27.86 * pow(voltage, -1.15);

    // Read battery status
    bool batteryLow = digitalRead(lboPin) == LOW;

    // Log data
    Serial.print("Sensor Value: ");
    Serial.print(sensorValue);
    Serial.print(" | Voltage: ");
    Serial.print(voltage, 2);
    Serial.print(" V | Distance: ");
    Serial.print(distance_cm, 2);
    Serial.print(" cm | BatteryStatus: ");
    Serial.println(batteryLow ? "LOW" : "OK");

    // Format payload
    char payload[64];
    int whole = (int)distance_cm;
    int fraction = (int)((distance_cm - whole) * 100);
    snprintf(payload, sizeof(payload),
             "Distance:%d.%02dcm BatteryStatus:%s",
             whole, abs(fraction), batteryLow ? "LOW" : "OK");

    Serial.print("Sending LoRa payload: ");
    Serial.println(payload);

    lora.sendUplink(payload, strlen(payload), 0, 1);
    Serial.println("Uplink sent.");

    // Power OFF the sensor to save energy
    digitalWrite(powerPin, LOW);
  }

  // Handle incoming messages
  recvStatus = lora.readData(outStr);
  if (recvStatus) {
    Serial.print("Received downlink: ");
    Serial.println(outStr);
  }

  lora.update();
}
