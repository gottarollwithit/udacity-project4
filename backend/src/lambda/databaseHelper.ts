import * as AWS from 'aws-sdk'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'

const documentClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE
const indexName = process.env.TODO_USERID_INDEXNAME
const logger = createLogger('databaseHelper')


export const createTodo = async (todoItem: TodoItem) => {
  try {
    logger.info('createTodo', todoItem)
    await documentClient.put({
      TableName: todoTable,
      Item: todoItem
    }).promise()
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getTodo = async (todoId: string): Promise<TodoItem> => {
  try {
    logger.info('getTodo', todoId)
    const result = await documentClient.query({
      TableName: todoTable,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId
      }
    }).promise()
    if (result.Items && result.Items.length
    ) {
      return Promise.resolve(result.Items[0] as TodoItem)
    }
  } catch
    (error) {
    return Promise.reject(error)
  }
}

export const deleteTodo = async (todoId: string) => {
  try {
    logger.info('deleteTodo', todoId)
    await documentClient.delete({
      TableName: todoTable,
      Key: {
        'todoId': todoId
      }
    }).promise()
    return
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getTodos = async (userId: string): Promise<TodoItem[]> => {
  try {
    logger.info('getTodos', userId)

    const result = await documentClient.query({
      TableName: todoTable,
      IndexName: indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()
    return Promise.resolve(result.Items as TodoItem[])
  } catch (error) {
    return Promise.reject(error)
  }
}

export const updateTodo = async (todoItem: UpdateTodoRequest, todoId: string): Promise<TodoUpdate> => {
  try {
    logger.info('updateTodo', todoItem)
    const updatedTodo = await documentClient.update({
      TableName: todoTable,
      Key: {
        'todoId': todoId
      },
      UpdateExpression: 'set #a = :a, #b = :b, #c = :c',

      ExpressionAttributeNames: {
        '#a': 'name',
        '#b': 'dueDate',
        '#c': 'done'
      },
      ExpressionAttributeValues: {
        ':a': todoItem.name,
        ':b': todoItem.dueDate,
        ':c': todoItem.done
      },
      ReturnValues: 'ALL_NEW'
    }).promise()
    return Promise.resolve(updatedTodo.Attributes as TodoUpdate)
  } catch (error) {
    return Promise.reject(error)
  }
}

export const updateImageUrl = async (todoId: string, imageUrl: string) => {
  try {
    logger.info('updateImageUrl', todoId, imageUrl)
    await documentClient.update({
      TableName: todoTable,
      Key: { todoId: todoId },
      UpdateExpression: 'set attachmentUrl = :url',
      ExpressionAttributeValues: {
        ':url': imageUrl
      },
      ReturnValues: 'NONE'
    }).promise()
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}
