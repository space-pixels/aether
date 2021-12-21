import { AetherSide, Listener, Server } from '../..'

@Listener(AetherSide.SERVER)
export class ExampleServer extends Server<object> {
  onOpen(session: object) {
    console.info(`~> [ExampleServer] session connected`, session)
  }

  onClose(session: object) {
    console.info(`~> [ExampleServer] session disconnected`, session)
  }
}
