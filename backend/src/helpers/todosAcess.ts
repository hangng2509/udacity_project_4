import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

const toDoItemsTable = process.env.TODOS_TABLE

const docClient: DocumentClient = createDynamoDBClient()

// TODO: Implement the dataLayer logic

//Create dynamodb client
export function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}

//Create to do item
export async function createToDo(toDoItem: TodoItem): Promise<TodoItem> {
  await docClient
    .put({
      TableName: toDoItemsTable,
      Item: toDoItem
    })
    .promise()

  return toDoItem
}

//Get all to do items
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  console.log('Getting all to do items when user logged in...')

  const result = await docClient
    .query({
      TableName: toDoItemsTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()

  const items = result.Items
  return items as TodoItem[]
}
