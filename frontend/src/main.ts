import * as THREE from "three";
import "./style.css";
import { Connection } from "./Connection";
import { Chat } from "./Chat";
import { Controls } from "./Control";
import PlayerHandler from "./PlayersHandler";
import { C2SPackets } from "../../common/packets/Packet";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshBasicMaterial({ color: 0x777777 })
);

plane.rotateX(-Math.PI / 2);
scene.add(plane);

camera.position.y = 2;

let lastTime = 0;
let deltaTime = 0;
function tick(time: number) {
  deltaTime = time - lastTime;
  lastTime = time;
  renderer.render(scene, camera);
  controls.tick(deltaTime);

  if (connection.playerId) {
    const player = playerHandler.players.get(connection.playerId);
    console.log(playerHandler.players);
    if (player) {
      controls.player = player;
      player.position.x = camera.position.x;
      player.position.y = camera.position.y - player.height;
      player.position.z = camera.position.z;
      if (Controls.moved) {
        connection.sendPacket<typeof C2SPackets.MOVE_PLAYER.prototype>(
          new C2SPackets.MOVE_PLAYER(player.position)
        );
        Controls.moved = false;
      }
    }
  }

  requestAnimationFrame(tick);
}

const controls = new Controls(camera, renderer.domElement);

const connection = new Connection(
  prompt("username") ?? new Crypto().randomUUID()
);

const playerHandler = new PlayerHandler(connection, scene);

connection.connection.addEventListener("open", () => {
  new Chat(connection);
});

renderer.domElement.id = "game";

document.getElementById("app")?.appendChild(renderer.domElement);

tick(0);
