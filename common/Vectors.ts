export class Vec2 {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  static fromObject({ x, y }: { x: number; y: number }) {
    return new Vec2(x, y);
  }
}

export class Vec3 extends Vec2 {
  z: number;
  constructor(x: number, y: number, z: number) {
    super(x, y);
    this.z = z;
  }
  static fromObject({ x, y, z }: { x: number; y: number; z: number }) {
    return new Vec3(x, y, z);
  }
  toTuple(): [number, number, number] {
    return [this.x, this.y, this.z];
  }
}
