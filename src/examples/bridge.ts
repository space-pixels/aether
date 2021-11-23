import { createBridge } from '../util/bridge'
import { ExampleClient } from './client/ExampleClient'
import { ExampleRequest } from './protocol/ExampleRequest'
import { ExampleState } from './protocol/ExampleState'
import { ExampleTransaction } from './protocol/ExampleTransaction'
import { ExampleServer } from './server/ExampleServer'

async function main() {
  // Create bridge
  const { connection, adapter } = createBridge<object>({})

  // Create server
  new ExampleServer(adapter)
  console.info(`ExampleServer listening on ws://localhost:8081/game`)

  // Create client
  const client = new ExampleClient(connection)
  connection.connect()

  // Send Transaction
  console.info(`~> [example] sending request 'hello world'`)
  const response = await client.request(ExampleTransaction, new ExampleRequest({ message: 'hello world' }))
  console.info(`~> [example] received response '${response.message}'`)

  // Subscribe to Responses
  client.subscribe(ExampleState, (response) => {
    console.info(`~> [example] subscription response ${response.name} ${response.enabled}`)
  })

  // Send State
  client.send(new ExampleState({ name: 'example', enabled: true }))

  // Close connection
  connection.close(1000)
}

main()
