import Player from "../Player";
import { Vec3 } from "../Vectors";

export abstract class Packet {
  static packets: Map<string, Packet>;
  constructor(packetName: string) {
    this.packetName = packetName;
  }
  packetName: string;
}

export abstract class C2SPacket extends Packet {
  static Packets: Map<string, C2SPacket>;
  constructor(packetName: string) {
    super(packetName);
    C2SPacket.Packets.set(packetName, this);
  }
}
C2SPacket.Packets = new Map();

export abstract class S2CPacket extends Packet {
  static Packets: Map<string, S2CPacket>;
  constructor(packetName: string) {
    super(packetName);
    S2CPacket.Packets.set(packetName, this);
  }
}
S2CPacket.Packets = new Map();

class C2SChatPacket extends C2SPacket {
  constructor(message: string) {
    super("CHAT");
    this.message = message;
  }
  message: string;
}

class C2SMovePlayerPacket extends C2SPacket {
  constructor(position: Vec3) {
    super("MOVE_PLAYER");
    this.position = position;
  }
  position: Vec3;
}

export const C2SPackets = {
  CHAT: C2SChatPacket,
  MOVE_PLAYER: C2SMovePlayerPacket,
} as const;

class S2CChatPacket extends S2CPacket {
  constructor(author: string, message: string) {
    super("CHAT");
    this.author = author;
    this.message = message;
  }
  author: string;
  message: string;
}

class S2CUpdatePlayersPacket extends S2CPacket {
  constructor(players: Map<string, Player>) {
    super("UPDATE_PLAYERS");
    this.players = Object.fromEntries(players);
  }
  players: Record<string, Player>;
}
class S2CInitPacket extends S2CPacket {
  constructor(id: string) {
    super("INIT");
    this.id = id;
  }
  id: string;
}

export const S2CPackets = {
  CHAT: S2CChatPacket,
  UPDATE_PLAYERS: S2CUpdatePlayersPacket,
  INIT: S2CInitPacket,
} as const;
