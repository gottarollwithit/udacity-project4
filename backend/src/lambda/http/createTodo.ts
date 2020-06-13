import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')

const documentClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const parsedTodo: CreateTodoRequest = JSON.parse(event.body)

  const newTodo = (
    {
      createdAt: new Date().toISOString(),
      done: false,
      todoId: uuid.v4(),
      userId: getUserId(event),
      attachmentUrl: '',
      ...parsedTodo
    }
  )
  logger.info('creating TODO: ', newTodo)
  await documentClient.put({
    TableName: todoTable,
    Item: newTodo
  }).promise()
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      newTodo
    })
  }
}
