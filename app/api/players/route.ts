import net from "node:net";

import type {
  Player,
  PlayerInfo,
  ServerResponse,
  VarIntResult,
} from "@/lib/types";

function writeVarInt(value: number): Buffer {
  const bytes: number[] = [];
  let remainingValue = value;

  do {
    let temp = remainingValue & 0b01111111;

    remainingValue >>>= 7;

    if (remainingValue !== 0) {
      temp |= 0b10000000;
    }

    bytes.push(temp);
  } while (remainingValue !== 0);

  return Buffer.from(bytes);
}

function readVarInt(buffer: Buffer, offset = 0): VarIntResult {
  let numRead = 0;
  let result = 0;

  let read: number;
  let localOffset = offset;

  do {
    if (localOffset >= buffer.length) {
      throw new Error("Buffer too short to read VarInt");
    }

    read = buffer[localOffset++];

    const value = read & 0b01111111;

    result |= value << (7 * numRead);
    numRead++;

    if (numRead > 5) {
      throw new Error("VarInt is too big");
    }
  } while ((read & 0b10000000) !== 0);

  return { value: result, bytesRead: numRead };
}

function createHandshakePacket(host: string, port: number): Buffer {
  const protocolVersion = writeVarInt(770); // 1.21.5 protocol
  const serverAddress = Buffer.from(host, "utf8");
  const serverAddressLength = writeVarInt(serverAddress.length);
  const serverPort = Buffer.allocUnsafe(2);
  serverPort.writeUInt16BE(port, 0);
  const nextState = writeVarInt(1); // status

  const data = Buffer.concat([
    writeVarInt(0), // packet ID
    protocolVersion,
    serverAddressLength,
    serverAddress,
    serverPort,
    nextState,
  ]);

  const length = writeVarInt(data.length);
  return Buffer.concat([length, data]);
}

function createStatusRequestPacket(): Buffer {
  const packetId = writeVarInt(0);
  const length = writeVarInt(packetId.length);
  return Buffer.concat([length, packetId]);
}

function parseServerResponse(buffer: Buffer): ServerResponse {
  try {
    let offset = 0;

    // read packet length
    const lengthResult = readVarInt(buffer, offset);
    const packetLength = lengthResult.value;
    offset += lengthResult.bytesRead;

    // check if we have the complete packet
    if (buffer.length < packetLength + lengthResult.bytesRead) {
      throw new Error("Buffer too short - incomplete packet");
    }

    // read packet ID
    const packetIdResult = readVarInt(buffer, offset);
    offset += packetIdResult.bytesRead;

    // read JSON length
    const jsonLengthResult = readVarInt(buffer, offset);
    const jsonLength = jsonLengthResult.value;
    offset += jsonLengthResult.bytesRead;

    // check if we have the complete JSON data
    if (buffer.length < offset + jsonLength) {
      throw new Error("Buffer too short - incomplete JSON data");
    }

    // read JSON data
    const jsonData = buffer.subarray(offset, offset + jsonLength);
    const jsonString = jsonData.toString("utf8");

    // Note: jsonLength is in bytes, not characters
    // for utf-8, byte length can differ from character length
    // so we validate against the actual bytes we extracted
    if (jsonData.length !== jsonLength) {
      throw new Error(
        `JSON data length mismatch: expected ${jsonLength} bytes, got ${jsonData.length} bytes`
      );
    }

    const response: ServerResponse = JSON.parse(jsonString);

    return response;
  } catch (error) {
    throw new Error(
      `Failed to parse server response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function extractPlayerInfo(serverResponse: ServerResponse): PlayerInfo {
  const players: Player[] = [];

  if (serverResponse.players?.sample) {
    for (const player of serverResponse.players.sample) {
      players.push({
        name: player.name,
        uuid: player.id,
        avatar: `https://minotar.net/helm/${player.id.replace(/-/g, "")}/16.png`,
      });
    }
  }

  return {
    online: serverResponse.players ? serverResponse.players.online : 0,
    max: serverResponse.players ? serverResponse.players.max : 0,
    players: players.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

async function queryMinecraftServer(
  host: string,
  port: number
): Promise<PlayerInfo> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let responseBuffer = Buffer.alloc(0);

    socket.setTimeout(10000); // 10 second timeout

    socket.on("connect", () => {
      // send handshake packet
      socket.write(createHandshakePacket(host, port));

      // send status request packet
      socket.write(createStatusRequestPacket());
    });

    socket.on("data", (data: Buffer) => {
      responseBuffer = Buffer.concat([responseBuffer, data]);

      // try to parse the response, but handle incomplete data
      try {
        const serverResponse = parseServerResponse(responseBuffer);
        const playerInfo = extractPlayerInfo(serverResponse);
        socket.destroy();
        resolve(playerInfo);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        // check if we need more data
        if (
          errorMessage.includes("Buffer too short") ||
          errorMessage.includes("incomplete")
        ) {
          console.log(
            `Waiting for more data... (current buffer: ${responseBuffer.length} bytes)`
          );
          return; // continue receiving data
        }

        // if it's a JSON parsing error, log for debugging
        if (errorMessage.includes("JSON")) {
          console.log("Raw response buffer length:", responseBuffer.length);
          console.log(
            "First 200 chars of response:",
            responseBuffer.toString("utf8").substring(0, 200)
          );
          console.log(
            "Last 200 chars of response:",
            responseBuffer
              .toString("utf8")
              .substring(Math.max(0, responseBuffer.length - 200))
          );
        }

        socket.destroy();
        reject(error);
      }
    });

    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("Connection timeout"));
    });

    socket.on("error", (error: Error) => {
      const errorMessage =
        (error as NodeJS.ErrnoException).code === "ECONNREFUSED"
          ? `Server refused connection. Check if: 1) Server is online, 2) Port ${port} is correct, 3) Server allows status queries`
          : `Connection error: ${error.message}`;

      reject(new Error(errorMessage));
    });

    socket.connect(port, host);
  });
}

export async function GET() {
  try {
    const result = await queryMinecraftServer("mc.colonycraft.org", 25579);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({
        error: "Failed to query server",
      }),
      {
        status: 500,
      }
    );
  }
}
