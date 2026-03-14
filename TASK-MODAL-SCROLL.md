# Task: Fix Modal Scrolling for Recurrence Options

## Problem
The recurrence options section is rendering outside the visible modal window, making it impossible to interact with the controls.

## Root Cause
The modal body likely has a fixed height or the recurrence options are pushing content beyond the scrollable area.

## Solution Required

1. **Check modal scroll container**: Ensure the recurrence options are inside the scrollable `.modal-form__scroll` container
2. **Verify modal height**: The modal should allow scrolling when content exceeds viewport
3. **Test with recurrence options visible**: Open modal, select "Weekly" or "Monthly", verify all 3 radio options are visible and clickable

## Files to Check
- `src/App.tsx` - Modal structure, ensure recurrence options are in correct container
- `src/index.css` - Modal CSS, check `.modal`, `.modal-form__scroll`, `.modal-form` styles

## Expected Behavior
- Modal should scroll when content is too tall
- All recurrence options (forever/count/until) should be visible
- User can interact with all radio buttons and inputs
- Modal should have proper max-height and overflow handling

## Testing
1. Open "New Todo" modal
2. Select "Weekly" recurrence
3. Verify all 3 recurrence options are visible
4. Try clicking each radio button
5. Try typing in number input and date picker
6. Repeat for "Monthly" recurrence

## Constraints
- Keep existing modal styling
- Don't break other modal content
- Maintain responsive behavior
- Test in both light and dark mode
