import { UpdateTodoRequest } from './../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate'
import { getAttachment } from './attachmentUtils'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

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
  logger.info(`Creating todo item in the DynamoDB`)
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
// update to do item
export async function updateTodo(
  userId: string,
  todoId: string,
  todoUpdateRequest: UpdateTodoRequest
) {
  console.log('Update to do item processing...')

  await docClient
    .update({
      TableName: toDoItemsTable,
      Key: { todoId, userId },
      UpdateExpression:
        'set #name = :nameInput, #dueDate = :dueDateInput, #done = :doneStatus',
      ExpressionAttributeValues: {
        ':nameInput': todoUpdateRequest.name,
        ':dueDateInput': todoUpdateRequest.dueDate,
        ':doneStatus': todoUpdateRequest.done
      },
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      }
    })
    .promise()
}
export async function deleteTodo(todoId: String, userId: String) {
  logger.info(`Delete to do in DynamoDB processing`)
  const params = {
    TableName: toDoItemsTable,
    Key: { todoId, userId }
  }
  await docClient.delete(params).promise()
}

export async function updateURL(todoId: string, userId: string) {
  logger.info(`Update new url for to do item in DynamoDB processing`)
  const attachmentUrl = getAttachment(todoId)

  await docClient
    .update({
      TableName: toDoItemsTable,
      Key: { todoId, userId },
      UpdateExpression: 'set #attachmentUrl = :attachmentUrlInput',
      ExpressionAttributeValues: {
        ':attachmentUrlInput': attachmentUrl
      },
      ExpressionAttributeNames: {
        '#attachmentUrl': 'attachmentUrl'
      }
    })
    .promise()
}
