import { useState } from 'react'
import { LABEL_COLORS, type FilterState, type Label, type LabelColor, type PriorityLevel, type Project, type SavedFilter } from '../types/todo'

const COLOR_STYLES: Record<LabelColor, string> = {
  slate: 'bg-slate-200 text-slate-700',
  red: 'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  amber: 'bg-amber-100 text-amber-800',
  green: 'bg-green-100 text-green-700',
  teal: 'bg-teal-100 text-teal-700',
  sky: 'bg-sky-100 text-sky-700',
  blue: 'bg-blue-100 text-blue-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  pink: 'bg-pink-100 text-pink-700',
}

type FilterPanelProps = {
  projects: Project[]
  labels: Label[]
  filters: FilterState
  savedFilters: SavedFilter[]
  activeSavedFilterId: string | null
  onSetFilters: (updates: Partial<FilterState>) => void
  onResetFilters: () => void
  onSaveCurrentFilter: (name: string) => void
  onApplySavedFilter: (filterId: string | null) => void
  onDeleteSavedFilter: (filterId: string) => void
  onAddLabel: (name: string, color: LabelColor) => void
}

export function FilterPanel({
  projects,
  labels,
  filters,
  savedFilters,
  activeSavedFilterId,
  onSetFilters,
  onResetFilters,
  onSaveCurrentFilter,
  onApplySavedFilter,
  onDeleteSavedFilter,
  onAddLabel,
}: FilterPanelProps) {
  const [filterName, setFilterName] = useState('')
  const [labelName, setLabelName] = useState('')
  const [labelColor, setLabelColor] = useState<LabelColor>('sky')

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white/85 p-5 shadow-[0_22px_50px_-40px_rgba(15,23,42,0.6)]">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Filters</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-slate-950">Labels and saved views</h2>
        </div>

        <div className="grid gap-3 lg:grid-cols-[180px,160px,160px,auto]">
          <select
            value={filters.projectId ?? 'all'}
            onChange={(event) =>
              onSetFilters({
                projectId: event.target.value === 'all' ? null : event.target.value,
              })
            }
            className="min-h-12 rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(event) =>
              onSetFilters({
                priority: event.target.value as PriorityLevel | 'all',
              })
            }
            className="min-h-12 rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          >
            <option value="all">All priorities</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
            <option value="P4">P4</option>
          </select>

          <select
            value={filters.dueScope}
            onChange={(event) =>
              onSetFilters({
                dueScope: event.target.value as FilterState['dueScope'],
              })
            }
            className="min-h-12 rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          >
            <option value="all">Any due date</option>
            <option value="today">Today only</option>
            <option value="upcoming">Upcoming only</option>
            <option value="overdue">Overdue only</option>
            <option value="unscheduled">Unscheduled</option>
          </select>

          <button
            type="button"
            onClick={onResetFilters}
            className="min-h-12 rounded-[22px] bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Clear filters
          </button>
        </div>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <input
            type="checkbox"
            checked={filters.showCompleted}
            onChange={(event) => onSetFilters({ showCompleted: event.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
          />
          Include completed tasks
        </label>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Filter by labels</p>
          <div className="flex flex-wrap gap-2">
            {labels.length === 0 ? (
              <span className="text-sm text-slate-400">No labels yet.</span>
            ) : (
              labels.map((label) => {
                const isActive = filters.labelIds.includes(label.id)
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() =>
                      onSetFilters({
                        labelIds: isActive
                          ? filters.labelIds.filter((labelId) => labelId !== label.id)
                          : [...filters.labelIds, label.id],
                      })
                    }
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                      isActive ? 'ring-2 ring-slate-900' : ''
                    } ${COLOR_STYLES[label.color]}`}
                  >
                    #{label.name}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr),160px,auto]">
          <input
            value={labelName}
            onChange={(event) => setLabelName(event.target.value)}
            placeholder="New label"
            className="min-h-12 rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
          <select
            value={labelColor}
            onChange={(event) => setLabelColor(event.target.value as LabelColor)}
            className="min-h-12 rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          >
            {LABEL_COLORS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              onAddLabel(labelName, labelColor)
              setLabelName('')
            }}
            className="min-h-12 rounded-[22px] bg-white px-5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Add label
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr),auto]">
          <input
            value={filterName}
            onChange={(event) => setFilterName(event.target.value)}
            placeholder="Save current filter"
            className="min-h-12 rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
          <button
            type="button"
            onClick={() => {
              onSaveCurrentFilter(filterName)
              setFilterName('')
            }}
            className="min-h-12 rounded-[22px] bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Save filter
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onApplySavedFilter(null)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              activeSavedFilterId === null ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Live filters
          </button>
          {savedFilters.map((filter) => (
            <div key={filter.id} className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
              <button
                type="button"
                onClick={() => onApplySavedFilter(filter.id)}
                className={`text-sm font-semibold ${activeSavedFilterId === filter.id ? 'text-slate-950' : 'text-slate-600'}`}
              >
                {filter.name}
              </button>
              <button
                type="button"
                onClick={() => onDeleteSavedFilter(filter.id)}
                className="text-xs font-semibold text-rose-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
