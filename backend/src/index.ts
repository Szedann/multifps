import {
  C2SPacket,
  C2SPackets,
  S2CPacket,
  S2CPackets,
} from "../../common/packets/Packet";
import { v4 } from "uuid";
import { Lobby } from "./Lobby";
import Player from "../../common/Player";
import type { ServerWebSocket } from "bun";
import { server } from "typescript";
import { Vec3 } from "../../common/Vectors";

interface WebSocketData {
  username: string;
  lobby: string;
  userId: string;
}

Lobby.lobbies.set("main", new Lobby("main"));

export class GameServer {
  static server = Bun.serve<WebSocketData>({
    fetch(req, server) {
      const username = new URL(req.url).searchParams.get("username");
      console.log(req.url);
      server.upgrade(req, {
        data: {
          username: username,
          lobby: "main",
          userId: v4(),
        },
      });
    },
    websocket: {
      async open(ws) {
        console.log(`${ws.data.username} joined`);
        const lobby =
          Lobby.lobbies.get(ws.data.lobby) ?? new Lobby(ws.data.lobby);
        ws.subscribe(ws.data.lobby);
        ws.send(JSON.stringify(new S2CPackets.INIT(ws.data.userId)));
        lobby.players.set(ws.data.userId, new Player());
        const updatePacket = JSON.stringify(
          new S2CPackets.UPDATE_PLAYERS(lobby.players)
        );
        ws.send(updatePacket);
        ws.publish(ws.data.lobby, updatePacket);
      },
      async message(ws, message) {
        console.log("message: ", message);
        const json = JSON.parse(message as string);
        if (json.packetName == "CHAT") {
          const packet = json as typeof C2SPackets.CHAT.prototype;
          console.log(`${ws.data.username}: ${packet.message}`);
          const data = JSON.stringify(
            new S2CPackets.CHAT(ws.data.username, packet.message)
          );
          ws.publish(ws.data.lobby, data);
          ws.send(data);
        }
        for (const messageListener of GameServer.messageListeners)
          messageListener(ws, json);
      },
      close(ws) {
        const lobby = Lobby.lobbies.get(ws.data.lobby);
        if (!lobby) return;
        lobby.players.delete(ws.data.userId);
        lobby.updatePlayers();
        GameServer.server.publish(
          ws.data.lobby,
          JSON.stringify(
            new S2CPackets.CHAT("server", `${ws.data.username} left`)
          )
        );
      },
    },
    port: 3000,
  });
  static messageListeners: ((
    ws: ServerWebSocket<WebSocketData>,
    json: any
  ) => any)[];

  static onPacket<T extends C2SPacket>(
    packetName: string,
    handler: (ws: ServerWebSocket<WebSocketData>, packet: T) => any
  ) {
    this.messageListeners.push((ws, json) => {
      if (json.packetName != packetName) return;
      handler(ws, json);
    });
  }

  static sendPacket<T extends S2CPacket>(
    ws: ServerWebSocket<WebSocketData>,
    packet: T
  ) {
    ws.send(JSON.stringify(packet));
  }
  static publishPacket<T extends S2CPacket>(lobby: string, packet: T) {
    GameServer.server.publish(lobby, JSON.stringify(packet));
  }
}

GameServer.messageListeners = [];

GameServer.onPacket<typeof C2SPackets.MOVE_PLAYER.prototype>(
  "MOVE_PLAYER",
  (ws, packet) => {
    const lobby = Lobby.lobbies.get(ws.data.lobby);
    const player = lobby?.players.get(ws.data.userId);
    if (!lobby || !player) return;
    player.position = Vec3.fromObject(packet.position);
    lobby.updatePlayers();
  }
);
