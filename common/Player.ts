import { Vec3 } from "./Vectors";

export default class Player {
  position = new Vec3(0, 0, 0);
  orientation = new Vec3(0, 0, 0);
  speed = 3;
  health = 100;
  height = 2;
}
