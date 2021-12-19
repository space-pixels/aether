import { Observable } from 'rxjs'
import { AetherSide, Client, Connection, Listener, Observe } from '../..'
import { ExampleState } from '../protocol/ExampleState'

@Listener(AetherSide.CLIENT)
export class ExampleClient extends Client {
  public state!: ExampleState

  @Observe(ExampleState) exampleState$!: Observable<ExampleState>

  constructor(connection: Connection) {
    super(connection)
    this.exampleState$.subscribe((state) => {
      console.info(`~> [ExampleClient] subscription response ${state.name} ${state.enabled}`)
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
