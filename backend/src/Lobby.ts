import { GameServer } from ".";
import type Player from "../../common/Player";
import { S2CPackets } from "../../common/packets/Packet";

export class Lobby {
  constructor(name: string) {
    this.name = name;
  }
  name: string;
  players = new Map<string, Player>();
  updatePlayers() {
    GameServer.publishPacket(
      this.name,
      new S2CPackets.UPDATE_PLAYERS(this.players)
    );
  }
  static lobbies: Map<string, Lobby>;
}
Lobby.lobbies = new Map();
