import { Client } from '../../Client'
import { Connection } from '../../connections/Connection'
import { Aether, AetherListener, AetherSide } from '../../protocol/Listener'
import { ExampleState } from '../protocol/ExampleState'

@AetherListener(AetherSide.CLIENT)
export class ExampleClient extends Client {
  public aether!: Aether
  public state!: ExampleState

  constructor(connection: Connection) {
    super(connection)
    this.aether.subscribe(ExampleState, (response) => {
      console.info(`~> [ExampleClient] subscription response ${response.name} ${response.enabled}`)
    })
  }

  onOpen() {
    console.info(`~> [ExampleClient] session connected`)
  }

  onClose() {
    console.info(`~> [ExampleClient] session disconnected`)
  }

  onError() {
    console.error('~> [ExampleClient] error')
  }
}
