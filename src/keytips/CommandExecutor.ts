// ==============================================
// File: src/keytips/CommandExecutor.ts
// Executes actual spreadsheet commands via standardized SpreadsheetAPI
// ==============================================

import * as GC from '@mescius/spread-sheets';
import { SpreadsheetAPI, SPREADSHEET_COMMANDS } from './SpreadsheetAPI';

export type CommandId = keyof typeof SPREADSHEET_COMMANDS;

export interface CommandContext {
  spread: GC.Spread.Sheets.Workbook;
}

export async function execute(cmd: CommandId, ctx: CommandContext): Promise<void> {
  if (!ctx || !ctx.spread) {
    console.error('❌ Cannot execute command - invalid context or spread instance');
    return;
  }
  
  console.log(`🎬 Executing command: ${cmd}`);
  
  try {
    // Create standardized API instance
    const api = new SpreadsheetAPI(ctx.spread);
    
    // Get command function and execute it
    const commandFn = SPREADSHEET_COMMANDS[cmd];
    if (!commandFn) {
      console.error(`❌ Unknown command: ${cmd}`);
      return;
    }
    
    // Execute command - the API handles all SpreadJS complexity
    await commandFn(api);
    
    console.log(`✅ Command ${cmd} executed successfully`);
  } catch (error) {
    console.error(`❌ Command ${cmd} failed:`, error);
  }
}

// That's it! No more manual SpreadJS API calls needed.
// Adding new commands is now as simple as:
// 1. Add to SPREADSHEET_COMMANDS in SpreadsheetAPI.ts
// 2. Add to AVAILABLE_COMMANDS in DynamicKeytips.ts
// 3. Business users can immediately use it!
