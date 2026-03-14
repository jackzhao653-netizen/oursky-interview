import { listTodos, upsertTodo } from "../_lib/todos.js"

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
  res.setHeader("Allow", "GET,POST")

  try {
    if (req.method === "GET") {
      const events = await listTodos()
      return sendJson(res, 200, { version: 1, events })
    }

    if (req.method === "POST") {
      const event = await upsertTodo(await readJsonBody(req))
      return sendJson(res, 201, { event })
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
