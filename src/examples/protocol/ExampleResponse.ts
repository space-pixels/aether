import { Field, Message, Type } from 'protobufjs/light'

@Type.d('ExampleResponse')
export class ExampleResponse extends Message<ExampleResponse> {
  @Field.d(1, 'string') message!: string
}
