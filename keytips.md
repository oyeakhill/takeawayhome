# 🎹 KeyTips Guide

This document explains how to add new **KeyTips** (sequential keyboard shortcuts) to the spreadsheet application.

---

## 📌 What Are KeyTips?

KeyTips are **sequential keyboard commands** inspired by Excel. They let users execute commands without a mouse by pressing keys one at a time after activation.

**Example:**
```
Alt/Cmd → H → V → V   →   Paste Values
Alt/Cmd → H → B → B   →   Border Bottom
Alt/Cmd → A → S       →   Sort Descending
```

---

## 🔑 Key Concepts

* **Activation**: User presses `Alt` (Windows/Linux) or `Cmd` (Mac) to start KeyTips mode
* **Sequential Input**: Keys are entered one at a time (not simultaneously like Ctrl+C)
* **Registry Driven**: All keytips are defined in a single **registry** object for easy management
* **Prefix Matching**: System validates partial sequences and provides feedback
* **Command Execution**: When a complete sequence matches, the corresponding command runs

---

## 📂 Architecture Overview

```
src/keytips/
├── KeyTipsRegistry.ts    ← Define all keytips here
├── KeyTipsController.ts  ← State machine (handles key sequences)
├── CommandExecutor.ts    ← Maps commands to SpreadJS actions
├── KeyTipsOverlay.tsx    ← Visual feedback UI
└── useKeyTips.ts         ← React integration
```

**Key files for adding new keytips:**
1. **`KeyTipsRegistry.ts`** - Add the key sequence
2. **`CommandExecutor.ts`** - Add the command implementation

---

## ➕ Adding a New KeyTip (Step-by-Step)

### Step 1: Add to Registry

Open `src/keytips/KeyTipsRegistry.ts` and add a new entry to the `KEYTIPS` array:

```typescript
export const KEYTIPS: KeyTip[] = [
  // Existing keytips...
  {
    chord: ["H", "V", "V"],
    command: "pasteValues",
    group: "H",
    label: "Paste Values"
  },
  
  // 👇 Add your new keytip here
  {
    chord: ["H", "F", "S"],           // Key sequence: H → F → S
    command: "freezeFirstRow",        // Command ID (must match CommandExecutor)
    group: "H",                       // Optional: grouping (usually first letter)
    label: "Freeze First Row"         // Optional: human-readable description
  }
];
```

**Properties:**
- `chord`: Array of keys pressed in sequence (uppercase letters)
- `command`: Unique command ID that matches your CommandExecutor function
- `group`: (Optional) Logical grouping, usually the first letter
- `label`: (Optional) Human-readable description for debugging/UI

### Step 2: Add Command Type

In `src/keytips/CommandExecutor.ts`, add your command to the `CommandId` type:

```typescript
export type CommandId = 
  | "pasteValues" 
  | "borderBottom" 
  | "borderTop" 
  | "autoFitCol" 
  | "sortDesc"
  | "freezeFirstRow";  // 👈 Add your command here
```

### Step 3: Implement Command

In the same file, add a case to the `execute` function:

```typescript
export function execute(cmd: CommandId, ctx: CommandContext): void {
  const spread = ctx.spread;
  const sheet = spread.getActiveSheet();
  const selections = sheet.getSelections();
  
  console.log(`🎬 Executing command: ${cmd}`);
  
  try {
    switch (cmd) {
      // Existing cases...
      case "freezeFirstRow":
        executeFreezeFirstRow(sheet);
        break;
      
      default:
        console.warn(`Unknown command: ${cmd}`);
    }
    console.log(`✅ Command ${cmd} executed successfully`);
  } catch (error) {
    console.error(`❌ Command ${cmd} failed:`, error);
  }
}

// 👇 Implement your command function
function executeFreezeFirstRow(sheet: GC.Spread.Sheets.Worksheet) {
  console.log("❄️ Freezing first row");
  sheet.frozenRowCount(1); // Freeze the first row
}
```

### Step 4: Test Your KeyTip

1. Start the development server: `npm start`
2. Press `Alt` or `Cmd` to activate KeyTips
3. Type your sequence: `H` → `F` → `S`
4. Verify the command executes correctly

---

## ✅ Validation Checklist

When adding a new keytip, make sure:

- [ ] **No conflicts detected** - Run `validateRegistry()` to check for conflicts
- [ ] **Sequence is unique** - No duplicate sequences or problematic prefixes
- [ ] **Command ID exists** in `CommandExecutor.ts` type and switch statement
- [ ] **Command function implemented** and handles edge cases gracefully
- [ ] **Sequence follows patterns** - Use logical groupings (e.g., `H` for formatting)
- [ ] **Tested manually** - Sequence works end-to-end
- [ ] **No TypeScript errors** - Code compiles without issues

### 🔍 **Conflict Detection**

The system automatically detects conflicts in development mode. Check browser console for warnings.

**Manual validation:**
```javascript
import { validateRegistry, logConflicts } from './src/keytips/KeyTipsRegistry';

// Check for conflicts
const report = validateRegistry();
console.log('Has conflicts:', report.hasConflicts);

// Or just log them directly
logConflicts();
```

**Conflict types detected:**
- **Prefix conflicts**: `["H", "B"]` conflicts with `["H", "B", "B"]` - shorter wins
- **Duplicate sequences**: Same chord used for different commands
- **Duplicate command IDs**: Same command ID used for different sequences
- **Extension conflicts**: Longer sequences that extend existing ones

---

## 🧠 Best Practices

### **Mnemonic Key Selection**
Choose keys that relate to the action:
- `B` for Borders, `V` for Values, `S` for Sort
- `F` for Freeze, `W` for Width, `C` for Copy

### **Consistent Grouping** 
Use logical first-level groupings:
- `H` group: Formatting (Home ribbon equivalent)
- `A` group: Data/Analysis operations  
- `I` group: Insert operations
- `V` group: View operations

### **Keep Sequences Short**
- 2-3 keys optimal for frequently used commands
- Avoid sequences longer than 4 keys
- Balance memorability with efficiency

### **Avoid Conflicts**
Before adding a sequence, check for existing ones:
```bash
# Search for existing sequences
grep -r "chord.*H.*F" src/keytips/
```

---

## 🗂 Current KeyTips Reference

| Shortcut            | Action          | Implementation     |
| ------------------- | --------------- | ------------------ |
| Alt/Cmd + H + V + V | Paste Values    | `pasteValues`      |
| Alt/Cmd + H + B + B | Border Bottom   | `borderBottom`     |
| Alt/Cmd + H + B + T | Border Top      | `borderTop`        |
| Alt/Cmd + H + O + I | AutoFit Column  | `autoFitCol`       |
| Alt/Cmd + A + S     | Sort Descending | `sortDesc`         |

---

## 🔧 Advanced Features

### **Sequence Validation**
The registry automatically handles:
- **Prefix validation** - `H` → `HB` → `HBB` shows valid progression
- **Invalid sequences** - `H` → `Z` shows error and resets
- **Exact matching** - Only complete sequences trigger commands

### **Dynamic Registration** (Future)
For runtime keytip registration:
```typescript
// Not implemented yet, but architecture supports it
function registerKeytip(keytip: KeyTip) {
  KEYTIPS.push(keytip);
}
```

---

## 🐛 Troubleshooting

**"Command not found" error:**
- Check `CommandId` type includes your command
- Verify switch statement has your case
- Ensure command function is implemented

**"Invalid sequence" immediately:**
- Check for typos in `chord` array
- Run `validateRegistry()` to check for conflicts
- Make sure keys are uppercase in registry
- Verify sequence isn't a prefix of existing longer sequences

**Command doesn't execute:**
- Check browser console for errors
- Verify SpreadJS APIs are called correctly
- Test command function in isolation

**TypeScript compilation errors:**
- Run `npm run build` to see detailed errors
- Ensure all imports are correct
- Check that CommandId type is updated

---

## 🚀 Quick Example: Add "Clear Formatting"

```typescript
// 1. In KeyTipsRegistry.ts
{
  chord: ["H", "C", "F"],
  command: "clearFormatting",
  group: "H", 
  label: "Clear Formatting"
}

// 2. In CommandExecutor.ts - Add to type
export type CommandId = "..." | "clearFormatting";

// 3. In CommandExecutor.ts - Add to switch
case "clearFormatting":
  executeClearFormatting(sheet, selections);
  break;

// 4. In CommandExecutor.ts - Implement function  
function executeClearFormatting(
  sheet: GC.Spread.Sheets.Worksheet, 
  selections: GC.Spread.Sheets.Range[]
) {
  console.log("🧹 Clearing formatting");
  if (selections.length === 0) {
    const activeRow = sheet.getActiveRowIndex();
    const activeCol = sheet.getActiveColumnIndex();
    sheet.clearRange(activeRow, activeCol, 1, 1, 
      GC.Spread.Sheets.SheetArea.viewport, 
      GC.Spread.Sheets.StorageType.style);
  } else {
    selections.forEach(sel => {
      sheet.clearRange(sel.row, sel.col, sel.rowCount, sel.colCount,
        GC.Spread.Sheets.SheetArea.viewport,
        GC.Spread.Sheets.StorageType.style);
    });
  }
}
```

Test with: `Alt/Cmd` → `H` → `C` → `F`

---

## 🔧 **Conflict Detection Example**

Let's say you accidentally try to add a conflicting keytip:

```typescript
// BAD: This would create a conflict!
export const KEYTIPS: KeyTip[] = [
  // ... existing keytips
  {
    chord: ["H", "B"],        // ❌ CONFLICT: Prefix of existing H→B→B and H→B→T
    command: "borderMenu",
    label: "Border Menu"
  }
];
```

**When you save and reload the app, you'll see in the browser console:**

```
⚠️ KeyTips Registry: 1 conflict(s) detected:
1. [PREFIX] Sequence [H → B] is a prefix of [H → B → B]. The shorter sequence will always trigger first.
   Keytip 1: [H → B] → borderMenu
   Keytip 2: [H → B → B] → borderBottom
```

**Why this is bad:** Users would never be able to access `H→B→B` or `H→B→T` because `H→B` would trigger first.

**The fix:** Use a different sequence like:
```typescript
{
  chord: ["H", "B", "M"],   // ✅ GOOD: Unique path
  command: "borderMenu",
  label: "Border Menu"
}
```

---

## 🛡️ **Conflict Prevention Tips**

1. **Check console** - Always check browser console after adding keytips
2. **Use unique paths** - Don't make shorter versions of existing sequences
3. **Plan your tree** - Sketch out your key hierarchy before implementing
4. **Test manually** - Try your sequences to ensure they work as expected

**Example of a well-planned hierarchy:**
```
H (Home/Formatting)
├── V (Values)
│   └── V → Paste Values
├── B (Borders) 
│   ├── B → Border Bottom
│   ├── T → Border Top
│   └── A → Border All
└── O (Options)
    └── I → AutoFit Column

A (Analysis/Data)
└── S → Sort Descending
```

---

With this architecture and conflict detection, adding new KeyTips takes just a few minutes and requires **zero changes** to the controller or UI logic. The registry-driven approach scales to 100+ keytips efficiently with automatic conflict prevention! 🎉
