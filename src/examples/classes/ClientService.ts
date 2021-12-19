import { Aether, AetherListener, AetherSide } from '../../protocol/Listener'
import { OnMessage } from '../../protocol/Message'
import { ExampleState } from '../protocol/ExampleState'

@AetherListener(AetherSide.CLIENT)
export class ClientService {
  public aether!: Aether

  constructor() {
    this.aether.subscribe(ExampleState, (response) => {
      console.info(`~> [ClientService] subscription response ${response.name} ${response.enabled}`)
    })
  }

  @OnMessage(ExampleState) onExampleState(state: ExampleState) {
    console.info(`~> [ClientService] session received state with name ${state.name}`, state)
  }

  async exampleTransaction() {
    debugger
  }
}
