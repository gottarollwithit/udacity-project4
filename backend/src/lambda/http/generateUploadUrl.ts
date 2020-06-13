import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'

const todoS3Bucket = process.env.TODO_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const documentClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const imageId = uuid.v4()

  const s3 = new AWS.S3({
    signatureVersion: 'v4'
  })


  const uploadUrl = s3.getSignedUrl('putObject', {
      Bucket: todoS3Bucket,
      Key: imageId,
      Expires: urlExpiration
    }
  )

  const imageUrl = `https://${todoS3Bucket}.s3.amazonaws.com/${imageId}`

  await documentClient.update({
    TableName: todoTable,
    Key: { todoId: todoId },
    UpdateExpression: 'set attachmentUrl = :url',
    ExpressionAttributeValues: {
      ':url': imageUrl
    },
    ReturnValues: 'UPDATED_NEW'

  }).promise()

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }
}
