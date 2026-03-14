import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
app.use(express.json())

// Import API handlers
const todosIndex = await import('./api/todos/index.js')
const todosById = await import('./api/todos/[id].js')

// API routes
app.get('/api/todos', todosIndex.default)
app.post('/api/todos', todosIndex.default)
app.get('/api/todos/:id', todosById.default)
app.put('/api/todos/:id', todosById.default)
app.delete('/api/todos/:id', todosById.default)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
