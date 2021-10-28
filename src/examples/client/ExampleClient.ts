import { Client } from '../../Client'
import { OnMessage } from '../../protocol/Message'
import { ExampleState } from '../protocol/ExampleState'

export class ExampleClient extends Client {
  public state!: ExampleState

  onOpen() {
    console.info(`~> [ExampleClient] session connected`)
  }

  @OnMessage(ExampleState) onExampleState(state: ExampleState) {
    console.info(`~> [ExampleClient] session received state with name ${state.name}`, state)
  }

  onClose() {
    console.info(`~> [ExampleClient] session disconnected`)
  }

  onError() {
    console.error('~> [ExampleClient] error')
  }
}
