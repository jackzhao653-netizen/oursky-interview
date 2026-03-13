import type { Todo } from '../types/todo'
import { TodoItem } from './TodoItem'

type TodoListProps = {
  title: string
  subtitle: string
  todos: Todo[]
  emptyMessage: string
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onToggleTop3: (id: string) => void
  priorityIds?: Set<string>
}

export function TodoList({
  title,
  subtitle,
  todos,
  emptyMessage,
  onToggle,
  onDelete,
  onToggleTop3,
  priorityIds = new Set<string>(),
}: TodoListProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>

      {todos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-sm text-gray-500 shadow-sm">
          {emptyMessage}
        </div>
      ) : (
        <ul className="space-y-3">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isPriority={priorityIds.has(todo.id)}
              onToggle={onToggle}
              onDelete={onDelete}
              onToggleTop3={onToggleTop3}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
