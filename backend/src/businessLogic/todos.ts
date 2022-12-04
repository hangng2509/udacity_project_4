import {
  createToDo,
  deleteTodo,
  updateTodo,
  updateURL
} from '../dataLayer/todosAcess'
import { getAttachment } from '../fileStorage/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
// import { parseUserId } from '../auth/utils'

// TODO: Implement businessLogic
const logger = createLogger('http')
export async function createToDoBuilder(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()

  // const url = await getAttachment(todoId)
  // const userId = parseUserId(jwtToken)
  logger.info(`Create to do ${todoId} processing`)
  return await createToDo({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false
  })
}

export async function updateTodoBuilder(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
) {
  logger.info(`Update to do ${todoId} by user: ${userId} processing`)
  return await updateTodo(userId, todoId, updateTodoRequest)
}

export async function deleteTodoBuilder(todoId: string, userId: string) {
  logger.info(`Delete to do ${todoId} by user: ${userId} processing`)
  return await deleteTodo(userId, todoId)
}

export async function createAttachmentPresignedUrlBuilder(
  todoId: string,
  userId: string
) {
  logger.info(`Update url for to do ${todoId} by user ${userId} processing`)
  const uploadUrl = await getAttachment(todoId)
  //update url into database
  await updateURL(todoId, userId)
  return uploadUrl
}
