# Known Issues - KeyTips MVP

## Critical Issue: SpreadJS Cell Editor Interference

**Problem:** When KeyTips is active and collecting key sequences, SpreadJS still enters cell edit mode on the first keystroke, causing:
- Cell editor/text box opens when pressing first letter (e.g., "H" after Alt)
- Selected cell content gets overwritten/deleted
- KeyTips letters sometimes leak into cells as text

**Impact:** 
- Data loss when using KeyTips on cells with existing content
- Poor user experience - commands work but data disappears
- Cell editor competes with KeyTips system for keyboard input

**Root Cause:**
SpreadJS intercepts keyboard events at a lower level than our event blocking system. Despite aggressive event prevention (keydown, keypress, keyup, input, textInput with stopImmediatePropagation), SpreadJS still receives and processes the first keystroke.

**Current Workaround:**
Commands execute correctly, but users should:
1. Use KeyTips on empty cells/ranges when possible
2. Expect some data loss in selected cells during KeyTip sequences
3. Re-enter data if accidentally overwritten

**Potential Solutions for Production:**
1. **SpreadJS API Integration:** Research SpreadJS APIs to programmatically disable/enable cell editing mode
2. **Custom Input Mode:** Override SpreadJS input handling entirely during KeyTips collection
3. **Event Interception:** Investigate SpreadJS event pipeline to block at source
4. **Selection Preservation:** Store/restore cell values before/after KeyTip sequences
5. **Modal Overlay:** Use invisible overlay to capture all keyboard events during KeyTips

**Priority:** High - affects core usability and data integrity

**Status:** Deferred to post-MVP (Phase 3 otherwise functional)

---

## Other Known Issues

*None currently identified*

---

## Testing Notes

**Commands that work correctly despite editor interference:**
- HVV (Paste Values): Executes, shows "🎯 PASTED"
- HBB (Border Bottom): Executes, adds borders  
- HBT (Border Top): Executes, adds borders
- HOI (AutoFit Column): Executes, adjusts column width
- AS (Sort Descending): Executes, sorts selected range

**Sequence detection:** 100% accurate
**Command execution:** 100% functional  
**Data preservation:** BROKEN - requires fix
