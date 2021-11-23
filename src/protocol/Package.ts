import { Message, Reader, Type } from 'protobufjs/light'
import { Packet } from '../protocol/Packet'

export class Package {
  static typeMap = new Map<string, Type>()

  static registerType(type: Type) {
    Package.typeMap.set(type.name, type)
  }

  static decode(data: Uint8Array | Reader) {
    const packet = Packet.decode(data)
    const type = this.typeMap.get(packet.name)
    if (!type) { throw new Error(`No type found for ${packet.name}`) }
    const message = type.decode(packet.bytes)
    return new Package(message, packet.transactionId)
  }

  constructor(public message: Message, public transactionId?: string) {
    Package.registerType(message.$type)
  }

  encode() {
    const bytes = this.type.encode(this.message).finish()
    const packet = new Packet({ name: this.name, bytes, transactionId: this.transactionId })
    return Packet.encode(packet).finish()
  }

  get type() { return this.message.$type }
  get name() { return this.type.name }
}
