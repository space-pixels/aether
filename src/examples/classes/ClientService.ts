import { Observable } from 'rxjs'
import { AetherSide, Client, ClientInstance, Listener, Observe, OnMessage } from '../..'
import { ExampleState } from '../protocol/ExampleState'

@Listener(AetherSide.CLIENT)
export class ClientService {
  @ClientInstance() client!: Client

  @Observe(ExampleState) exampleState$!: Observable<ExampleState>

  constructor() {
    this.exampleState$.subscribe((state) => {
      console.info(`~> [ClientService] subscription response ${state.name} ${state.enabled}`)
    })
  }

  @OnMessage(ExampleState) onExampleState(state: ExampleState) {
    console.info(`~> [ClientService] session received state with name ${state.name}`, state)
  }
}
