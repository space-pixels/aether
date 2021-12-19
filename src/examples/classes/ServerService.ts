import { Aether, AetherListener, AetherSide } from '../../protocol/Listener'
import { OnMessage } from '../../protocol/Message'
import { ExampleState } from '../protocol/ExampleState'

@AetherListener(AetherSide.SERVER)
export class ServerService {
  public aether!: Aether

  @OnMessage(ExampleState) onExampleState(state: ExampleState, session: object) {
    console.info(`~> [ServerService] received ExampleState`)
  }
}
