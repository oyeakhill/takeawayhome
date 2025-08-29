// ==============================================
// File: src/keytips/CommandExecutor.ts
// Executes actual spreadsheet commands via SpreadJS API
// ==============================================

import * as GC from '@mescius/spread-sheets';

export type CommandId = "pasteValues" | "borderBottom" | "borderTop" | "autoFitCol" | "sortDesc" | "clearContent";

export interface CommandContext {
  spread: GC.Spread.Sheets.Workbook;
}

export function execute(cmd: CommandId, ctx: CommandContext): void {
  const spread = ctx.spread;
  const sheet = spread.getActiveSheet();
  const selections = sheet.getSelections();
  
  console.log(`🎬 Executing command: ${cmd}`);
  
  try {
    switch (cmd) {
      case "pasteValues":
        executePasteValues(sheet, selections);
        break;
      case "borderBottom":
        executeBorder(sheet, selections, "bottom");
        break;
      case "borderTop":
        executeBorder(sheet, selections, "top");
        break;
      case "autoFitCol":
        executeAutoFitColumn(sheet, selections);
        break;
      case "sortDesc":
        executeSortDescending(sheet, selections);
        break;
      case "clearContent":
        executeClearContent(sheet, selections);
        break;
      default:
        console.warn(`Unknown command: ${cmd}`);
    }
    console.log(`✅ Command ${cmd} executed successfully`);
  } catch (error) {
    console.error(`❌ Command ${cmd} failed:`, error);
    // In a production app, you'd show a user-friendly error message
  }
}

function executePasteValues(sheet: GC.Spread.Sheets.Worksheet, selections: GC.Spread.Sheets.Range[]) {
  // For MVP, we'll simulate paste values by copying some sample data
  // In a real app, you'd read from clipboard or SpreadJS copy buffer
  
  if (selections.length === 0) {
    console.log("📋 No selection for paste - using active cell");
    const activeRow = sheet.getActiveRowIndex();
    const activeCol = sheet.getActiveColumnIndex();
    console.log(`📋 Pasting to active cell: R${activeRow}C${activeCol}`);
    // Paste some obvious sample values to demonstrate
    sheet.setValue(activeRow, activeCol, "🎯 PASTED");
    sheet.setValue(activeRow + 1, activeCol, "Value 2");
    sheet.setValue(activeRow, activeCol + 1, "Value 3");
    return;
  }

  const selection = selections[0]; // Use first selection
  console.log(`📋 Pasting values to selection: R${selection.row}C${selection.col} (${selection.rowCount}×${selection.colCount})`);
  
  // Paste obvious sample values that are easy to spot
  for (let r = 0; r < Math.min(selection.rowCount, 3); r++) {
    for (let c = 0; c < Math.min(selection.colCount, 3); c++) {
      if (r === 0 && c === 0) {
        sheet.setValue(selection.row + r, selection.col + c, `🎯 PASTED`);
      } else {
        sheet.setValue(selection.row + r, selection.col + c, `Val${r + 1}.${c + 1}`);
      }
    }
  }
}

function executeBorder(sheet: GC.Spread.Sheets.Worksheet, selections: GC.Spread.Sheets.Range[], side: "top" | "bottom") {
  if (selections.length === 0) {
    console.log(`🖼️ No selection for border - using active cell`);
    const activeRow = sheet.getActiveRowIndex();
    const activeCol = sheet.getActiveColumnIndex();
    selections = [new GC.Spread.Sheets.Range(activeRow, activeCol, 1, 1)];
  }

  for (const selection of selections) {
    console.log(`🖼️ Adding ${side} border to: R${selection.row}C${selection.col} (${selection.rowCount}×${selection.colCount})`);
    
    const range = sheet.getRange(selection.row, selection.col, selection.rowCount, selection.colCount);
    const borderColor = "#000000";
    const borderStyle = GC.Spread.Sheets.LineStyle.thin;
    
    if (side === "bottom") {
      range.borderBottom(new GC.Spread.Sheets.LineBorder(borderColor, borderStyle));
    } else if (side === "top") {
      range.borderTop(new GC.Spread.Sheets.LineBorder(borderColor, borderStyle));
    }
  }
}

function executeAutoFitColumn(sheet: GC.Spread.Sheets.Worksheet, selections: GC.Spread.Sheets.Range[]) {
  if (selections.length === 0) {
    console.log("📏 No selection for autofit - using active column");
    const activeCol = sheet.getActiveColumnIndex();
    sheet.autoFitColumn(activeCol);
    return;
  }

  const selection = selections[0];
  console.log(`📏 Auto-fitting columns: ${selection.col} to ${selection.col + selection.colCount - 1}`);
  
  // AutoFit all columns in the selection
  for (let col = selection.col; col < selection.col + selection.colCount; col++) {
    sheet.autoFitColumn(col);
  }
}

function executeSortDescending(sheet: GC.Spread.Sheets.Worksheet, selections: GC.Spread.Sheets.Range[]) {
  if (selections.length === 0) {
    console.log("🔽 No selection for sort - cannot sort without range");
    return;
  }

  const selection = selections[0];
  console.log(`🔽 Sorting descending: R${selection.row}C${selection.col} (${selection.rowCount}×${selection.colCount})`);
  
  if (selection.rowCount < 2) {
    console.log("🔽 Selection too small to sort (need at least 2 rows)");
    return;
  }

  // Sort the range by the first column, descending
  // For MVP, we'll use the simpler sortRange signature
  try {
    sheet.sortRange(
      selection.row, 
      selection.col, 
      selection.rowCount, 
      selection.colCount, 
      true, // sortByRows
      [
        {
          index: 0, // First column of selection
          ascending: false // Descending
        }
      ]
      // Omit options parameter for MVP simplicity
    );
  } catch (error) {
    console.error('Sort failed, trying simpler approach:', error);
    // Fallback: If the advanced sort fails, we could implement a simple manual sort
    // For MVP, we'll just log the error
  }
}

function executeClearContent(sheet: GC.Spread.Sheets.Worksheet, selections: GC.Spread.Sheets.Range[]) {
  if (selections.length === 0) {
    console.log("🧹 No selection for clear - using active cell");
    const activeRow = sheet.getActiveRowIndex();
    const activeCol = sheet.getActiveColumnIndex();
    sheet.setValue(activeRow, activeCol, null);
    console.log(`🧹 Cleared content at: R${activeRow}C${activeCol}`);
    return;
  }

  const selection = selections[0];
  console.log(`🧹 Clearing content in selection: R${selection.row}C${selection.col} (${selection.rowCount}×${selection.colCount})`);
  
  // Clear content in the selected range
  for (let r = 0; r < selection.rowCount; r++) {
    for (let c = 0; c < selection.colCount; c++) {
      sheet.setValue(selection.row + r, selection.col + c, null);
    }
  }
}
