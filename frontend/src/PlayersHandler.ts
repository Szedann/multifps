import Player from "../../common/Player";
import { Vec3 } from "../../common/Vectors";
import { S2CPackets } from "../../common/packets/Packet";
import { Connection } from "./Connection";
import * as THREE from "three";

class ClientPlayer extends Player {
  constructor() {
    super();
  }
  setPosition(pos: Vec3) {
    this.position = pos;
    this.object.position.set(...this.position.toTuple());
    this.object.position.y = pos.y + this.height / 2;
  }
  setOrientation(ori: Vec3) {
    this.orientation = ori;
    // this.object.position.set(...this.position.toTuple());
  }
  object: THREE.Object3D = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.8, 2, 10, 10),
    new THREE.MeshBasicMaterial()
  );
}

export default class PlayerHandler {
  constructor(connection: Connection, scene: THREE.Scene) {
    scene.add();
    connection.onPacket<typeof S2CPackets.UPDATE_PLAYERS.prototype>(
      "UPDATE_PLAYERS",
      (packet) => {
        for (const playerId in packet.players) {
          const playerData = packet.players[playerId];
          let player = this.players.get(playerId);
          player ??= new ClientPlayer();
          player.health = playerData.health;
          player.height = playerData.height;
          player.speed = playerData.speed;
          player.setPosition(Vec3.fromObject(playerData.position));
          player.setOrientation(Vec3.fromObject(playerData.orientation));
          scene.add(player.object);
          this.players.set(playerId, player);
        }
        for (const player of this.players) {
          if (!packet.players[player[0]]) {
            player[1].object.removeFromParent();
            this.players.delete(player[0]);
          }
        }
      }
    );
  }
  players = new Map<string, ClientPlayer>();
}
