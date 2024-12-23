import net from "node:net";

const server = net.createServer();
const HOST = "127.0.0.1";
const PORT = 3032;
const PROXY_PORT = 3031;

const needleRaw = "ilikebigtrainsandicantlie";
const secret = "i like big trains and i cant lie";

function filterSecret(data) {
  const replaceValue = secret.replace(/[a-z]/g, "-");
  const needle = new RegExp(needleRaw.split("").join("\\s*"), "g");
  const filtered = data.replaceAll(needle, replaceValue);
  return filtered;
}

server.on("connection", (socket) => {
  let buffer = "";

  const client = new net.Socket();
  client.connect(PORT, HOST, () => {
    client.write("a");
  });

  client.on("data", (data) => {
    buffer += data.toString();

    if (buffer.length < 2 * secret.length) return;

    const filteredData = filterSecret(buffer);
    const safeData = filteredData.substring(
      0,
      filteredData.length - secret.length
    );

    // console.log("[B1] : ", buffer);
    // console.log("[S]: : ", safeData);
    buffer = filteredData.slice(filteredData.length - secret.length);
    // console.log("[B2] : ", buffer);
    socket.write(safeData);
  });

  socket.on("data", (data) => {
    client.write(data);
  });

  socket.on("close", () => {
    console.log("closed");
    client.destroy();
  });

  socket.on("error", (error) => {
    console.error(error);
    client.destroy();
  });
});

server.listen(PROXY_PORT, () => {
  console.log(`STARTED SERVER 0.0.0.0:${PROXY_PORT}`);
});
