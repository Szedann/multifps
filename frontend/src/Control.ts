import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { Keymap } from "./Keymap";
import Player from "../../common/Player";

export class Controls {
  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLCanvasElement) {
    this.controls = new PointerLockControls(camera, domElement);
    domElement.addEventListener("click", async () => {
      this.controls.lock();
      // await renderer.domElement.requestPointerLock();
    });

    window.addEventListener("keydown", (e) => {
      if ((<any>Object).values(Keymap).includes(e.key)) {
        // console.log(e.key);
        this.playerState[e.key] = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      if ((<any>Object).values(Keymap).includes(e.key)) {
        this.playerState[e.key] = false;
      }
    });
  }
  tick(deltaTime: number) {
    if (!this.player) return;
    const speedResult = (this.player.speed * deltaTime) / 1000;
    this.controls.camera.position.set(
      this.player.position.x,
      this.player.position.y + this.player.height,
      this.player.position.z
    );
    if (this.controls.isLocked) {
      if (this.playerState[Keymap.Forward]) {
        Controls.moved = true;
        this.controls.moveForward(speedResult);
      }
      if (this.playerState[Keymap.Left]) {
        Controls.moved = true;
        this.controls.moveRight(-speedResult);
      }
      if (this.playerState[Keymap.Back]) {
        Controls.moved = true;
        this.controls.moveForward(-speedResult);
      }
      if (this.playerState[Keymap.Right]) {
        Controls.moved = true;
        this.controls.moveRight(speedResult);
      }
    }
    // console.log(this.player);
    this.player.position.x = this.controls.camera.position.x;
    this.player.position.y = this.controls.camera.position.y;
    this.player.position.z = this.controls.camera.position.y;
  }
  static moved: boolean;
  controls: PointerLockControls;
  playerState: Record<string, boolean> = {};
  player?: Player;
}
Controls.moved = false;
