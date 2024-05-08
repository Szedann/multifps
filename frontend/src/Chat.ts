import { C2SPackets, S2CPackets } from "../../common/packets/Packet";
import { Connection } from "./Connection";

export class Chat {
  constructor(connection: Connection) {
    connection.sendPacket(new C2SPackets.CHAT(`connected`));
    const textInput = document.querySelector<HTMLInputElement>("#textInput");
    textInput?.addEventListener("keyup", (e) => {
      if (e.key == "Enter") {
        connection.sendPacket(new C2SPackets.CHAT(textInput.value));
        textInput.value = "";
      }
    });
    connection.onPacket<typeof S2CPackets.CHAT.prototype>("CHAT", (packet) => {
      console.log(packet);
      this.createMessageElement(packet.author, packet.message);
    });
  }
  createMessageElement(author: string, content: string) {
    const messageElement = document.createElement("li");
    messageElement.innerText = `${author}: ${content}`;
    document.getElementById("chatMessages")?.appendChild(messageElement);
  }
}
