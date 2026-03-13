import { AddTodo } from './components/AddTodo'
import { TodoList } from './components/TodoList'
import { Top3Section } from './components/Top3Section'
import { useTodos } from './hooks/useTodos'

function App() {
  const {
    top3Todos,
    otherTodos,
    rolloverItems,
    isLoaded,
    limitMessage,
    addTodo,
    toggleTodo,
    deleteTodo,
    toggleTop3,
    restoreRollover,
    dismissRollover,
    restoreAllRollovers,
  } = useTodos()

  const priorityIds = new Set(top3Todos.map((todo) => todo.id))

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-3 text-center sm:text-left">
          <div className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            Oursky interview MVP
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">📝 Daily Top-3 Todo App</h1>
            <p className="mt-2 max-w-xl text-base text-gray-600">
              A minimalist task list with a simple daily planning ritual: choose your Top 3,
              then carry unfinished priorities into tomorrow without losing track.
            </p>
          </div>
        </header>

        <AddTodo onAdd={addTodo} />

        {!isLoaded ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
            Loading your tasks...
          </div>
        ) : (
          <>
            <Top3Section
              todos={top3Todos}
              rolloverItems={rolloverItems}
              limitMessage={limitMessage}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onToggleTop3={toggleTop3}
              onRestore={restoreRollover}
              onDismissRollover={dismissRollover}
              onRestoreAll={restoreAllRollovers}
            />

            <TodoList
              title="Other Tasks"
              subtitle="Everything else stays here until it becomes a priority."
              todos={otherTodos}
              emptyMessage={
                top3Todos.length > 0
                  ? 'No other tasks right now — a suspiciously calm day.'
                  : 'No tasks yet. Add one above to get started.'
              }
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onToggleTop3={toggleTop3}
              priorityIds={priorityIds}
            />
          </>
        )}
      </div>
    </main>
  )
}

export default App
