import { Message } from 'protobufjs/light'
import { Client } from './Client'

export class Socket {
  constructor(private client: Client, public userId: string) { }

  send<T extends Message>(message: T) {
    this.client.send(message)
  }
}
