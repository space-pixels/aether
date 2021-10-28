import { Field, Message, Type } from 'protobufjs/light'

@Type.d('ExampleRequest')
export class ExampleRequest extends Message<ExampleRequest> {
  @Field.d(1, 'string') message!: string
}
