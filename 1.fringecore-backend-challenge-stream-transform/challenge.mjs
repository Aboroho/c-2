import net from "node:net";

const server = net.createServer();

const HOST = "127.0.0.1";
const PORT = 3031;
const ORIGIN_HOST = HOST;
const ORIGIN_PORT = 3032;

const needleRaw = "ilikebigtrainsandicantlie";
const secret = "i like big trains and i cant lie";

const origin = new net.Socket();

function filterSecret(data) {
  const replaceValue = secret.replace(/[a-z]/g, "-");
  const needle = new RegExp(needleRaw.split("").join("\\s*"), "g");
  const filtered = data.replace(needle, replaceValue);
  return filtered;
}

server.on("connection", (socket) => {
  let buffer = "";

  origin.connect(ORIGIN_PORT, ORIGIN_HOST, () => {
    origin.write("a");
  });

  origin.on("data", (data) => {
    buffer += data.toString();

    // If the buffer doesn't have enough data to process
    if (buffer.length < 2 * secret.length) return;

    const filteredData = filterSecret(buffer);

    /* The last portion of data equal to the length of the `secret` is not extracted because it may contain a prefix of the
     * `secret`. Keeping this part ensures that the incoming data can combine with it to form the complete `secret`, */
    const safeData = filteredData.substring(
      0,
      filteredData.length - secret.length
    );

    buffer = filteredData.slice(filteredData.length - secret.length);
    socket.write(safeData);
  });

  socket.on("data", (data) => {
    origin.write(data);
  });

  socket.on("close", () => {
    console.log("closed");
    origin.destroy();
  });

  socket.on("error", (error) => {
    console.error(error);
    origin.destroy();
  });
});

server.listen(PORT, () => {
  console.log(`STARTED SERVER 0.0.0.0:${PORT}`);
});
