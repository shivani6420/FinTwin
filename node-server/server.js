const express = require("express");
const http = require("http");
const cors = require("cors");
const axios = require("axios");
const { Server } = require("socket.io");

const PORT = 4000;
const DJANGO_URL = "http://127.0.0.1:8000/api/simulate/";
const ANGULAR_ORIGIN = "http://localhost:4200";

const app = express();
app.use(cors({ origin: ANGULAR_ORIGIN }));
app.get("/", (req, res) => res.send("FinTwin Node relay is running"));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: ANGULAR_ORIGIN } });

io.on("connection", (socket) => {
  console.log("client connected:", socket.id);

  socket.on("run_simulation", async (payload) => {
    console.log("run_simulation:", payload && payload.scenario);
    socket.emit("simulation_progress", { percent: 10 });
    try {
      const { token, ...body } = payload || {};
      const headers = token ? { Authorization: 'Token ' + token } : {};
      const response = await axios.post(DJANGO_URL, body, { timeout: 10000, headers });
      socket.emit("simulation_result", { ...response.data, requestId: payload.requestId });
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      console.log("Django error:", message);
      socket.emit("simulation_error", { message, requestId: payload && payload.requestId });
    }
  });

  socket.on("disconnect", () => console.log("client left:", socket.id));
});

server.listen(PORT, () => console.log(`Node relay listening on http://localhost:${PORT}`));


