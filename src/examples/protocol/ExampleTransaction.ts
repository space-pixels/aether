import { Transaction } from '../../protocol/Transaction'
import { ExampleRequest } from './ExampleRequest'
import { ExampleResponse } from './ExampleResponse'

export const ExampleTransaction: Transaction<ExampleRequest, ExampleResponse> = [ExampleRequest, ExampleResponse]
