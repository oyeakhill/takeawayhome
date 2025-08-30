// ==============================================
// DYNAMIC KEYTIPS SYSTEM - Production Version
// This extends your existing registry with user customization
// ==============================================

import { CommandId } from './CommandExecutor';
import { KeyTip, KEYTIPS, validateRegistry } from './KeyTipsRegistry';

// User keytips are stored separately and merged at runtime
let USER_KEYTIPS: KeyTip[] = [];

// Load user keytips from localStorage
export function loadUserKeytips(): KeyTip[] {
  try {
    const saved = localStorage.getItem('user-keytips');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate that all user keytips are well-formed
      USER_KEYTIPS = parsed.filter((keytip: any) => 
        keytip.chord && keytip.command && keytip.label
      );
      console.log(`📁 Loaded ${USER_KEYTIPS.length} user keytips from localStorage`);
      return USER_KEYTIPS;
    }
  } catch (error) {
    console.warn('Failed to load user keytips:', error);
  }
  return [];
}

// Save user keytips to localStorage
export function saveUserKeytips(keytips: KeyTip[]): boolean {
  try {
    // Validate before saving
    const allKeytips = [...KEYTIPS, ...keytips];
    const report = validateRegistry(allKeytips);
    
    if (report.hasConflicts) {
      console.error('❌ Cannot save user keytips due to conflicts:', report.conflicts);
      return false;
    }
    
    USER_KEYTIPS = keytips;
    localStorage.setItem('user-keytips', JSON.stringify(keytips));
    console.log(`💾 Saved ${keytips.length} user keytips to localStorage`);
    return true;
  } catch (error) {
    console.error('Failed to save user keytips:', error);
    return false;
  }
}

// Get all keytips (system + user) for the controller to use
export function getAllKeytips(): KeyTip[] {
  return [...KEYTIPS, ...USER_KEYTIPS];
}

// Add a new user keytip
export function addUserKeytip(keytip: Omit<KeyTip, 'group'>): boolean {
  const newKeytip = { ...keytip, group: keytip.chord[0] };
  const testKeytips = [...USER_KEYTIPS, newKeytip];
  
  if (saveUserKeytips(testKeytips)) {
    console.log(`➕ Added user keytip: [${keytip.chord.join(' → ')}] → ${keytip.label}`);
    return true;
  }
  return false;
}

// Remove a user keytip
export function removeUserKeytip(chord: string[]): boolean {
  const chordStr = chord.join(',');
  const filteredKeytips = USER_KEYTIPS.filter(
    keytip => keytip.chord.join(',') !== chordStr
  );
  
  if (filteredKeytips.length !== USER_KEYTIPS.length) {
    saveUserKeytips(filteredKeytips);
    console.log(`➖ Removed user keytip: [${chord.join(' → ')}]`);
    return true;
  }
  return false;
}

// Get available commands for UI - ONLY commands that are implemented in SpreadsheetAPI.ts
export const AVAILABLE_COMMANDS = [
  // Clipboard operations
  { id: 'copy', label: 'Copy Selection' },
  { id: 'paste', label: 'Paste' },
  { id: 'pasteValues', label: 'Paste Values Only' },
  
  // Formatting operations
  { id: 'bold', label: 'Make Bold' },
  { id: 'italic', label: 'Make Italic' },
  
  // Border operations
  { id: 'borderTop', label: 'Add Top Border' },
  { id: 'borderBottom', label: 'Add Bottom Border' },
  { id: 'borderLeft', label: 'Add Left Border' },
  { id: 'borderRight', label: 'Add Right Border' },
  { id: 'borderAll', label: 'Add All Borders' },
  
  // Data operations
  { id: 'clearContent', label: 'Clear Content' },
  { id: 'sortDesc', label: 'Sort Descending' },
  { id: 'autoFitCol', label: 'AutoFit Columns' },
] as const;

// Enhanced match function that includes user keytips
export function matchChordPrefixDynamic(sequence: string[]) {
  const allKeytips = getAllKeytips();
  
  if (sequence.length === 0) {
    return { isExact: false, isPrefix: true, possibleMatches: allKeytips };
  }

  let exactMatch: KeyTip | undefined;
  let prefixMatches: KeyTip[] = [];

  for (const keytip of allKeytips) {
    const { chord } = keytip;
    
    if (chord.length === sequence.length && chord.every((k, i) => k === sequence[i])) {
      exactMatch = keytip;
    }
    
    if (chord.length >= sequence.length && sequence.every((k, i) => k === chord[i])) {
      prefixMatches.push(keytip);
    }
  }

  return {
    isExact: !!exactMatch,
    isPrefix: prefixMatches.length > 0,
    match: exactMatch,
    possibleMatches: prefixMatches
  };
}

// Initialize user keytips on module load
loadUserKeytips();

export default {
  loadUserKeytips,
  saveUserKeytips,
  getAllKeytips,
  addUserKeytip,
  removeUserKeytip,
  matchChordPrefixDynamic,
  AVAILABLE_COMMANDS
};
