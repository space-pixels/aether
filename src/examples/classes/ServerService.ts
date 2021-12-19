import { AetherSide, Listener, OnMessage } from '../..'
import { ExampleState } from '../protocol/ExampleState'

@Listener(AetherSide.SERVER)
export class ServerService {
  @OnMessage(ExampleState) onExampleState(state: ExampleState, session: object) {
    console.info(`~> [ServerService] received ExampleState`)
  }
}
