import { useState } from 'react'
import {
  LABEL_COLORS,
  type FilterState,
  type Label,
  type LabelColor,
  type PriorityLevel,
  type Project,
  type SavedFilter,
} from '../types/todo'

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
  const [savedViewName, setSavedViewName] = useState('')
  const [labelName, setLabelName] = useState('')
  const [labelColor, setLabelColor] = useState<LabelColor>('sky')

  return (
    <section className="rounded-[30px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-soft)] backdrop-blur">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
            Filters and labels
          </p>
          <h2 className="font-display mt-3 text-3xl leading-none text-[var(--text-primary)]">
            Refine what appears in the workspace
          </h2>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Narrow the task list by project, urgency, schedule, or label, then save that filter set for later.
          </p>
        </div>

        <div className="grid gap-3">
          <select
            value={filters.projectId ?? 'all'}
            onChange={(event) =>
              onSetFilters({
                projectId: event.target.value === 'all' ? null : event.target.value,
              })
            }
            className="min-h-12 rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-sm text-[var(--text-secondary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={filters.priority}
              onChange={(event) =>
                onSetFilters({
                  priority: event.target.value as PriorityLevel | 'all',
                })
              }
              className="min-h-12 rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-sm text-[var(--text-secondary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
            >
              <option value="all">All priorities</option>
              <option value="P1">P1 urgent</option>
              <option value="P2">P2 high</option>
              <option value="P3">P3 medium</option>
              <option value="P4">P4 low</option>
            </select>

            <select
              value={filters.dueScope}
              onChange={(event) =>
                onSetFilters({
                  dueScope: event.target.value as FilterState['dueScope'],
                })
              }
              className="min-h-12 rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-sm text-[var(--text-secondary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
            >
              <option value="all">Any due date</option>
              <option value="today">Due today</option>
              <option value="upcoming">Due later</option>
              <option value="overdue">Overdue</option>
              <option value="unscheduled">No due date</option>
            </select>
          </div>

          <label className="flex items-center gap-3 rounded-[22px] bg-[var(--bg-inset)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={filters.showCompleted}
              onChange={(event) => onSetFilters({ showCompleted: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            Include completed tasks in filtered results
          </label>

          <button
            type="button"
            onClick={onResetFilters}
            className="min-h-12 rounded-[22px] border border-[color:var(--border-soft)] bg-transparent px-5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
          >
            Reset all filters
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Label filter</p>
          <div className="flex flex-wrap gap-2">
            {labels.length === 0 ? (
              <span className="text-sm text-[var(--text-muted)]">No labels have been created yet.</span>
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
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                      isActive ? 'ring-2 ring-[var(--accent)]' : ''
                    } ${COLOR_STYLES[label.color]}`}
                  >
                    #{label.name}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr),140px]">
          <input
            value={labelName}
            onChange={(event) => setLabelName(event.target.value)}
            placeholder="Create a new label"
            className="min-h-12 rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
          />
          <select
            value={labelColor}
            onChange={(event) => setLabelColor(event.target.value as LabelColor)}
            className="min-h-12 rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-sm text-[var(--text-secondary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
          >
            {LABEL_COLORS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            onAddLabel(labelName, labelColor)
            setLabelName('')
          }}
          className="min-h-12 w-full rounded-[22px] bg-[var(--bg-muted)] px-5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-muted-strong)]"
        >
          Add label
        </button>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Saved filter sets</p>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr),auto]">
            <input
              value={savedViewName}
              onChange={(event) => setSavedViewName(event.target.value)}
              placeholder="Name this filter set"
              className="min-h-12 rounded-[22px] border border-[color:var(--border-soft)] bg-[var(--bg-elevated-strong)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[var(--ring)]"
            />
            <button
              type="button"
              onClick={() => {
                onSaveCurrentFilter(savedViewName)
                setSavedViewName('')
              }}
              className="min-h-12 rounded-[22px] bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-contrast)] hover:brightness-105"
            >
              Save filter set
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onApplySavedFilter(null)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                activeSavedFilterId === null
                  ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                  : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'
              }`}
            >
              Current filter controls
            </button>
            {savedFilters.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center gap-2 rounded-full bg-[var(--bg-muted)] px-3 py-1.5"
              >
                <button
                  type="button"
                  onClick={() => onApplySavedFilter(filter.id)}
                  className={`text-sm font-semibold ${
                    activeSavedFilterId === filter.id
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
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
      </div>
    </section>
  )
}
