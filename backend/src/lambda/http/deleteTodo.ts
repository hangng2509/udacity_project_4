import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

// import { deleteTodoBuilder } from '../../helpers/todos'
// import { getUserId } from '../utils'
import * as AWS from 'aws-sdk'
// import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { parseUserId } from '../../auth/utils'

const toDoItemsTable = process.env.TODOS_TABLE
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    // TODO: Remove a TODO item by id
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    var params = {
      TableName: toDoItemsTable,
      Key: {
        todoId: todoId,
        userId: parseUserId(jwtToken)
      }
    }
    console.log('params', params)
    await docClient.delete(params, function (err, data) {
      if (err) {
        console.error('We cannot delete item because : ', JSON.stringify(err))
      } else {
        console.log('Delete todo item successfully:', JSON.stringify(data))
      }
    })
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: 'Item deleted'
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
