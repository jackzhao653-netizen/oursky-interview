import { deleteTodo, getTodoById, upsertTodo } from "../_lib/todos.js"

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body
  }

  if (typeof req.body === "string" && req.body.length > 0) {
    return JSON.parse(req.body)
  }

  const chunks = []

  for await (const chunk of req) {
    chunks.push(chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"))
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload)
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    if (error.message === "DATABASE_URL is not configured") {
      return "Database is not configured."
    }

    return error.message
  }

  return "Unexpected server error."
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store")
  res.setHeader("Allow", "GET,PUT,DELETE")

  const todoId =
    typeof req.query?.id === "string"
      ? req.query.id
      : Array.isArray(req.query?.id)
        ? req.query.id[0]
        : ""

  if (!todoId) {
    return sendJson(res, 400, { error: "Todo id is required." })
  }

  try {
    if (req.method === "GET") {
      const event = await getTodoById(todoId)
      return event
        ? sendJson(res, 200, { event })
        : sendJson(res, 404, { error: "Todo not found." })
    }

    if (req.method === "PUT") {
      const event = await upsertTodo(await readJsonBody(req), todoId)
      return sendJson(res, 200, { event })
    }

    if (req.method === "DELETE") {
      const deleted = await deleteTodo(todoId)
      return sendJson(res, deleted ? 200 : 404, {
        deleted,
        id: todoId,
      })
    }

    return sendJson(res, 405, { error: "Method not allowed." })
  } catch (error) {
    const message = getErrorMessage(error)
    const statusCode =
      message === "Todo title is required"
        ? 400
        : message === "Database is not configured."
          ? 500
          : 500

    return sendJson(res, statusCode, { error: message })
  }
}
