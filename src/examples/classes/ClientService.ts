import { Observable } from 'rxjs'
import { AetherSide, Listener, Observe, OnMessage } from '../..'
import { ExampleState } from '../protocol/ExampleState'

@Listener(AetherSide.CLIENT)
export class ClientService {
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
