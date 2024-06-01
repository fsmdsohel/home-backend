const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mqtt = require("mqtt");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

app.use(cors());
app.use(express.json());

const mqttClient = mqtt.connect("mqtt://192.168.0.175:1883");

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
  mqttClient.subscribe("analog/pin18");
});

mqttClient.on("message", (topic, message) => {
  console.log(`Received message: ${message.toString()} on topic: ${topic}`);
  io.emit("mqttMessage", { topic, message: message.toString() });
});

app.post("/publish", express.json(), (req, res) => {
  try {
    const { topic, message } = req.body;
    mqttClient.publish(topic, message, () => {
      res.send(`Message published to topic ${topic}`);
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.get("/", (req, res) => {
  res.send("Server is running");
});

io.on("connection", (socket) => {
  console.log("New WebSocket connection");
  socket.on("disconnect", () => {
    console.log("WebSocket disconnected");
  });
});

const PORT = 5002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
