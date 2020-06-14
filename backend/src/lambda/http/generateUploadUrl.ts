import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'
import { updateImageUrl } from '../databaseHelper'

const todoS3Bucket = process.env.TODO_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

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

  await updateImageUrl(todoId, imageUrl)
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
