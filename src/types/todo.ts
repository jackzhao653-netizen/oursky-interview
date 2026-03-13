export type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: string
  top3Date: string | null
  rolledOverOn: string | null
}

export type StoredTodoState = {
  todos: Todo[]
  lastOpenedDate: string
}
