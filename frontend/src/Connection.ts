import { C2SPacket, S2CPackets, S2CPacket } from "../../common/packets/Packet";
export class Connection {
  constructor(username: string) {
    const url = new URL(`ws://${window.location.hostname}:3000`);
    url.searchParams.set("username", username);
    this.connection = new WebSocket(url);
    this.connection.addEventListener(
      "open",
      (e) => {
        this.ready = true;
      },
      { once: true }
    );
    this.onPacket<typeof S2CPackets.INIT.prototype>(
      "INIT",
      (data) => {
        this.playerId = data.id;
      },
      { once: true }
    );
  }

  ready = false;
  connection: WebSocket;
  playerId?: string;

  async sendPacket<T extends C2SPacket>(packet: T) {
    this.connection.send(JSON.stringify(packet));
  }

  onPacket<T extends S2CPacket>(
    packetName: string,
    handler: (packet: T) => any,
    options?: AddEventListenerOptions
  ) {
    this.connection.addEventListener(
      "message",
      (e) => {
        const json = JSON.parse(e.data);
        // console.log(json);
        if (json.packetName != packetName) return;
        handler(json);
      },
      options
    );
  }
}
