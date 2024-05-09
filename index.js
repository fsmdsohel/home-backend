const mqtt = require("mqtt");
const mongoose = require("mongoose");

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/mqtt_datastore", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const TemperatureData = mongoose.model("Temperature", {
  temperature: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// MQTT connection options
const mqttOptions = {
  host: "mqtt://192.168.0.180",
  port: 1883, // Default MQTT port
};

// Connect to MQTT broker
const client = mqtt.connect(mqttOptions);

// MQTT connection event handlers
client.on("connect", function () {
  console.log("Connected to MQTT broker");
  // Subscribe to the temperature topic
  client.subscribe("sensor/temperature_celsius");
});

client.on("error", function (error) {
  console.error("Error:", error);
});

// MQTT message handler
client.on("message", function (topic, message) {
  console.log("Received message:", message.toString(), "on topic:", topic);

  if (topic === "temperature") {
    const temperature = parseFloat(message.toString());
    if (!isNaN(temperature)) {
      // Save temperature data to MongoDB
      const data = new TemperatureData({
        temperature: temperature,
      });

      data
        .save()
        .then(() => console.log("Temperature data saved to MongoDB"))
        .catch((err) => console.error("Error saving temperature data:", err));
    } else {
      console.error("Invalid temperature value received:", message.toString());
    }
  }
});
