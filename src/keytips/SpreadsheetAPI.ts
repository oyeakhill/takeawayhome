// ==============================================
// SpreadsheetAPI - Standardized Operations Interface
// This wraps SpreadJS with a clean, consistent API
// ==============================================

import * as GC from '@mescius/spread-sheets';

export interface SelectionInfo {
  row: number;
  col: number;
  rowCount: number;
  colCount: number;
}

export class SpreadsheetAPI {
  constructor(private spread: GC.Spread.Sheets.Workbook) {}

  private get sheet(): GC.Spread.Sheets.Worksheet {
    return this.spread.getActiveSheet();
  }

  private getTargetRange(): SelectionInfo {
    const selections = this.sheet.getSelections();
    if (selections.length === 0) {
      // Use active cell
      return {
        row: this.sheet.getActiveRowIndex(),
        col: this.sheet.getActiveColumnIndex(),
        rowCount: 1,
        colCount: 1
      };
    }
    return selections[0];
  }

  // ================================
  // CLIPBOARD OPERATIONS
  // ================================
  
  copy(): void {
    const target = this.getTargetRange();
    console.log(`📋 Copying: R${target.row}C${target.col} (${target.rowCount}×${target.colCount})`);
    
    // Simple copy implementation - just log for now
    // SpreadJS copy/paste is complex and varies by version
    console.log('📋 Copy operation - use Ctrl+C as fallback');
    
    // Set selection to make manual copy work
    this.sheet.setSelection(target.row, target.col, target.rowCount, target.colCount);
  }

  paste(): void {
    const target = this.getTargetRange();
    console.log(`📋 Pasting to: R${target.row}C${target.col}`);
    
    // Simple paste implementation - set active cell for manual paste
    this.sheet.setActiveCell(target.row, target.col);
    console.log('📋 Paste operation - use Ctrl+V as fallback');
  }

  async pasteValues(): Promise<void> {
    const target = this.getTargetRange();
    console.log(`📋 Pasting values to: R${target.row}C${target.col}`);
    
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText.trim()) {
        this.sheet.setValue(target.row, target.col, "📋 Clipboard was empty");
        return;
      }

      // Parse clipboard data
      const lines = clipboardText.split(/\r?\n/);
      let pastedCells = 0;
      
      for (let rowOffset = 0; rowOffset < lines.length; rowOffset++) {
        const line = lines[rowOffset];
        if (!line && rowOffset === lines.length - 1) break;
        
        const values = line.split('\t');
        for (let colOffset = 0; colOffset < values.length; colOffset++) {
          const value = this.parseValue(values[colOffset]);
          this.sheet.setValue(target.row + rowOffset, target.col + colOffset, value);
          pastedCells++;
        }
      }
      
      console.log(`✅ Pasted ${pastedCells} cells as values only`);
    } catch (error) {
      console.warn('📋 Clipboard access failed, using demo data');
      this.sheet.setValue(target.row, target.col, "🎯 PASTE VALUES");
      this.sheet.setValue(target.row, target.col + 1, "(Clipboard denied)");
    }
  }

  // ================================
  // FORMATTING OPERATIONS  
  // ================================
  
  setBold(enabled: boolean = true): void {
    const target = this.getTargetRange();
    console.log(`📝 Setting bold=${enabled}: R${target.row}C${target.col} (${target.rowCount}×${target.colCount})`);
    
    this.applyStyleToRange(target, (style) => {
      if (enabled) {
        style.font = style.font ? style.font.replace(/\bbold\b/g, '').trim() + ' bold' : 'bold';
      } else {
        style.font = style.font ? style.font.replace(/\bbold\b/g, '').trim() : '';
      }
    });
  }

  setItalic(enabled: boolean = true): void {
    const target = this.getTargetRange();
    console.log(`📝 Setting italic=${enabled}: R${target.row}C${target.col} (${target.rowCount}×${target.colCount})`);
    
    this.applyStyleToRange(target, (style) => {
      if (enabled) {
        style.font = style.font ? style.font.replace(/\\bitalic\\b/g, '').trim() + ' italic' : 'italic';
      } else {
        style.font = style.font ? style.font.replace(/\\bitalic\\b/g, '').trim() : '';
      }
    });
  }

  // ================================
  // BORDER OPERATIONS
  // ================================
  
  setBorder(side: 'top' | 'bottom' | 'left' | 'right' | 'all', color: string = '#000000'): void {
    const target = this.getTargetRange();
    console.log(`🖼️ Adding ${side} border: R${target.row}C${target.col} (${target.rowCount}×${target.colCount})`);
    
    const range = this.sheet.getRange(target.row, target.col, target.rowCount, target.colCount);
    const borderStyle = GC.Spread.Sheets.LineStyle.thin;
    const border = new GC.Spread.Sheets.LineBorder(color, borderStyle);
    
    switch (side) {
      case 'top': range.borderTop(border); break;
      case 'bottom': range.borderBottom(border); break;
      case 'left': range.borderLeft(border); break;
      case 'right': range.borderRight(border); break;
      case 'all':
        range.borderTop(border);
        range.borderBottom(border);
        range.borderLeft(border);
        range.borderRight(border);
        break;
    }
  }

  // ================================
  // DATA OPERATIONS
  // ================================
  
  clearContent(): void {
    const target = this.getTargetRange();
    console.log(`🧹 Clearing content: R${target.row}C${target.col} (${target.rowCount}×${target.colCount})`);
    
    for (let r = 0; r < target.rowCount; r++) {
      for (let c = 0; c < target.colCount; c++) {
        this.sheet.setValue(target.row + r, target.col + c, null);
      }
    }
  }

  sortDescending(): void {
    const target = this.getTargetRange();
    console.log(`🔽 Sorting descending: R${target.row}C${target.col} (${target.rowCount}×${target.colCount})`);
    
    if (target.rowCount < 2) {
      console.log("🔽 Selection too small to sort (need at least 2 rows)");
      return;
    }

    try {
      this.sheet.sortRange(
        target.row, target.col, target.rowCount, target.colCount, 
        true, // sortByRows
        [{ index: 0, ascending: false }] // Sort by first column, descending
      );
    } catch (error) {
      console.error('🔽 Sort failed:', error);
    }
  }

  autoFitColumns(): void {
    const target = this.getTargetRange();
    console.log(`📏 Auto-fitting columns: ${target.col} to ${target.col + target.colCount - 1}`);
    
    for (let col = target.col; col < target.col + target.colCount; col++) {
      this.sheet.autoFitColumn(col);
    }
  }

  // ================================
  // HELPER METHODS
  // ================================
  
  private parseValue(rawValue: string): any {
    if (!rawValue) return null;
    
    const cleanValue = rawValue.trim();
    const numericValue = parseFloat(cleanValue);
    
    if (!isNaN(numericValue) && isFinite(numericValue)) {
      return numericValue;
    }
    
    // Basic date detection
    if (/^\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4}$/.test(cleanValue)) {
      const parsed = new Date(cleanValue);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    return cleanValue;
  }

  private applyStyleToRange(target: SelectionInfo, styleModifier: (style: GC.Spread.Sheets.Style) => void): void {
    for (let r = 0; r < target.rowCount; r++) {
      for (let c = 0; c < target.colCount; c++) {
        const row = target.row + r;
        const col = target.col + c;
        const style = this.sheet.getStyle(row, col) || new GC.Spread.Sheets.Style();
        styleModifier(style);
        this.sheet.setStyle(row, col, style);
      }
    }
  }
}

// ================================
// COMMAND REGISTRY WITH STANDARDIZED API
// ================================

export const SPREADSHEET_COMMANDS = {
  // Clipboard operations
  copy: (api: SpreadsheetAPI) => api.copy(),
  paste: (api: SpreadsheetAPI) => api.paste(),
  pasteValues: (api: SpreadsheetAPI) => api.pasteValues(),
  
  // Formatting operations
  bold: (api: SpreadsheetAPI) => api.setBold(true),
  italic: (api: SpreadsheetAPI) => api.setItalic(true),
  
  // Border operations
  borderTop: (api: SpreadsheetAPI) => api.setBorder('top'),
  borderBottom: (api: SpreadsheetAPI) => api.setBorder('bottom'),
  borderLeft: (api: SpreadsheetAPI) => api.setBorder('left'),
  borderRight: (api: SpreadsheetAPI) => api.setBorder('right'),
  borderAll: (api: SpreadsheetAPI) => api.setBorder('all'),
  
  // Data operations
  clearContent: (api: SpreadsheetAPI) => api.clearContent(),
  sortDesc: (api: SpreadsheetAPI) => api.sortDescending(),
  autoFitCol: (api: SpreadsheetAPI) => api.autoFitColumns(),
  
  // Easy to add more:
  // freezePanes: (api: SpreadsheetAPI) => api.freezePanes(),
  // insertRow: (api: SpreadsheetAPI) => api.insertRow(),
  // deleteRow: (api: SpreadsheetAPI) => api.deleteRow(),
} as const;