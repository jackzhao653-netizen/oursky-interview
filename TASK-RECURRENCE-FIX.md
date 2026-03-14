# Task: Fix Recurring Tasks & Add Recurrence Options

## Critical Bug to Fix

**Problem:** When a weekly/monthly recurring task is marked as done, ALL future occurrences disappear.

**Root cause:** The `updateEventStatus` function modifies the base event's status, which affects all resolved occurrences generated from it.

**Solution:** Implement completion tracking per occurrence, not on the base event. Store completed occurrence dates separately.

## New Features to Add

### 1. Recurrence Options UI

When user selects "Weekly" or "Monthly" recurrence, show additional options:

**Option A: Repeat Count**
- Input: "Repeat X times" (number input)
- Example: "Repeat 5 times" means 5 occurrences total

**Option B: End Date**
- Input: Date picker for "Repeat until [date]"
- Example: "Repeat until 2026-06-30"

**Option C: Forever**
- Checkbox: "Repeat indefinitely"
- Default option

**Behavior:**
- When user changes repeat count → auto-calculate and update end date
- When user changes end date → auto-calculate and update repeat count
- When user checks "Forever" → disable both count and end date inputs

### 2. UI Layout Changes

**Move recurrence controls:**
- Current: Recurrence selector is in a 2-column grid with "Kind"
- New: Move both "Kind" selector AND recurrence controls BELOW the Kind selector
- Layout:
  ```
  [Kind selector - full width]
  [Recurrence selector - full width]
  [Recurrence options - full width, only visible when weekly/monthly selected]
    - Radio buttons: ( ) Repeat X times  ( ) Until date  ( ) Forever
    - Conditional inputs based on selection
  ```

### 3. Settings Button

**Add settings button in header:**
- Location: Next to "New todo" button
- Icon: Gear/cog icon
- Opens modal to edit:
  - Category options (add/remove/rename)
  - Kind/Activity options (add/remove/rename)
- Store custom options in localStorage
- Merge with default options

### 4. Remove Task Counter

**Remove from header:**
- Current: "4 open 4 done 2 overdue"
- New: Remove this entire section

## Technical Implementation

### Data Model Changes

Update `TodoEvent` type in `src/types/todo.ts`:

```typescript
export type TodoEvent = {
  // ... existing fields ...
  recurrence: TodoRecurrence;
  recurrenceCount: number | null; // null = forever
  recurrenceEndDate: string | null; // YYYY-MM-DD format
  completedOccurrences: string[]; // Array of YYYY-MM-DD dates that were completed
};
```

### Storage Migration

Add migration logic in `src/utils/storage.ts`:
- Check file version
- Add default values for new fields to existing events
- Increment version number

### Occurrence Resolution Logic

Update `resolveEventsInRange` in `src/utils/storage.ts`:
- When generating occurrences, respect `recurrenceCount` and `recurrenceEndDate`
- Check if occurrence date is in `completedOccurrences` array
- If yes, set status to "done" for that occurrence only
- Base event status should NOT affect occurrence status

### Status Update Logic

Update status handling:
- When marking a recurring task occurrence as done:
  - Add the occurrence date to `completedOccurrences` array
  - Do NOT change base event status
- When marking a "once" task as done:
  - Update base event status as before

## Files to Modify

1. `src/types/todo.ts` - Add new fields to TodoEvent type
2. `src/utils/storage.ts` - Update resolution logic, add migration
3. `src/App.tsx` - Update UI:
   - Add recurrence options UI
   - Move recurrence controls below Kind
   - Add settings button
   - Remove task counter
   - Update status toggle logic for recurring tasks

## Testing Checklist

- [ ] Create a weekly task, mark first occurrence done, verify future occurrences still appear
- [ ] Create a monthly task with "Repeat 3 times", verify only 3 occurrences appear
- [ ] Create a weekly task with end date, verify occurrences stop at end date
- [ ] Change repeat count, verify end date updates automatically
- [ ] Change end date, verify repeat count updates automatically
- [ ] Mark multiple occurrences of same recurring task as done
- [ ] Verify settings modal can add/remove categories and activities
- [ ] Verify custom categories/activities persist across page reload

## Constraints

- Keep existing "once" task behavior unchanged
- Maintain backward compatibility with existing data
- Use existing UI patterns and styling
- Commit at logical milestones with clear messages
- Test in browser after each major change

## Priority

**CRITICAL:** Fix the bug where recurring tasks disappear when marked done
**HIGH:** Add recurrence count/end date options
**MEDIUM:** Add settings button
**LOW:** Remove task counter
