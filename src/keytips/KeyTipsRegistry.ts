// ==============================================
// File: src/keytips/KeyTipsRegistry.ts
// Declarative registry of all KeyTips sequences
// ==============================================

import { CommandId } from "./CommandExecutor";

export interface KeyTip {
  chord: string[];
  command: CommandId;
  group?: string;
  label?: string;
}

// Registry of all KeyTips (MVP: 5 required sequences)
// ⚠️ IMPORTANT: Run `validateRegistry()` after adding new keytips to check for conflicts
export const KEYTIPS: KeyTip[] = [
  {
    chord: ["H", "V", "V"],
    command: "pasteValues",
    group: "H",
    label: "Paste Values"
  },
  {
    chord: ["H", "B", "B"],
    command: "borderBottom",
    group: "H", 
    label: "Border Bottom"
  },
  {
    chord: ["H", "B", "T"],
    command: "borderTop",
    group: "H",
    label: "Border Top"
  },
  {
    chord: ["H", "O", "I"],
    command: "autoFitCol",
    group: "H",
    label: "AutoFit Column"
  },
  {
    chord: ["A", "S"],
    command: "sortDesc",
    group: "A",
    label: "Sort Descending"
  },
  {
    chord: ["H", "C", "C"],
    command: "clearContent",
    group: "H",
    label: "Clear Content"
  }
];

// Helper to find matching KeyTips by prefix
export interface ChordMatch {
  isExact: boolean;
  isPrefix: boolean;
  match?: KeyTip;
  possibleMatches?: KeyTip[];
}

export function matchChordPrefix(sequence: string[]): ChordMatch {
  if (sequence.length === 0) {
    return { isExact: false, isPrefix: true, possibleMatches: KEYTIPS };
  }

  let exactMatch: KeyTip | undefined;
  let prefixMatches: KeyTip[] = [];

  for (const keytip of KEYTIPS) {
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

// Helper to get all possible next keys from current sequence
export function getNextKeys(sequence: string[]): string[] {
  const { possibleMatches } = matchChordPrefix(sequence);
  if (!possibleMatches || sequence.length === 0) return [];
  
  const nextKeys = new Set<string>();
  for (const keytip of possibleMatches) {
    if (keytip.chord.length > sequence.length) {
      nextKeys.add(keytip.chord[sequence.length]);
    }
  }
  
  return Array.from(nextKeys).sort();
}

// ==============================================
// CONFLICT DETECTION SYSTEM
// ==============================================

export interface ConflictReport {
  hasConflicts: boolean;
  conflicts: {
    type: 'prefix' | 'extension' | 'duplicate' | 'commandId';
    keytip1: KeyTip;
    keytip2: KeyTip;
    description: string;
  }[];
}

// Validate registry for conflicts
export function validateRegistry(keytips: KeyTip[] = KEYTIPS): ConflictReport {
  const conflicts: ConflictReport['conflicts'] = [];
  const seenCommands = new Set<string>();
  const seenSequences = new Set<string>();

  for (let i = 0; i < keytips.length; i++) {
    const keytip1 = keytips[i];
    const sequence1Str = keytip1.chord.join(',');

    // Check for duplicate command IDs
    if (seenCommands.has(keytip1.command)) {
      const duplicate = keytips.find(kt => kt.command === keytip1.command && kt !== keytip1)!;
      conflicts.push({
        type: 'commandId',
        keytip1,
        keytip2: duplicate,
        description: `Command ID '${keytip1.command}' is used by multiple keytips`
      });
    }
    seenCommands.add(keytip1.command);

    // Check for duplicate sequences
    if (seenSequences.has(sequence1Str)) {
      const duplicate = keytips.find(kt => kt.chord.join(',') === sequence1Str && kt !== keytip1)!;
      conflicts.push({
        type: 'duplicate',
        keytip1,
        keytip2: duplicate,
        description: `Sequence [${keytip1.chord.join(' → ')}] is used by multiple commands`
      });
    }
    seenSequences.add(sequence1Str);

    // Check for prefix/extension conflicts with other keytips
    for (let j = i + 1; j < keytips.length; j++) {
      const keytip2 = keytips[j];
      
      // Check if keytip1 is a prefix of keytip2
      if (isPrefix(keytip1.chord, keytip2.chord)) {
        conflicts.push({
          type: 'prefix',
          keytip1,
          keytip2,
          description: `Sequence [${keytip1.chord.join(' → ')}] is a prefix of [${keytip2.chord.join(' → ')}]. The shorter sequence will always trigger first.`
        });
      }
      
      // Check if keytip2 is a prefix of keytip1
      if (isPrefix(keytip2.chord, keytip1.chord)) {
        conflicts.push({
          type: 'prefix',
          keytip1: keytip2,
          keytip2: keytip1,
          description: `Sequence [${keytip2.chord.join(' → ')}] is a prefix of [${keytip1.chord.join(' → ')}]. The shorter sequence will always trigger first.`
        });
      }
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts
  };
}

// Helper: Check if sequence A is a prefix of sequence B
function isPrefix(a: string[], b: string[]): boolean {
  if (a.length >= b.length) return false;
  return a.every((key, index) => key === b[index]);
}

// Helper: Log conflicts to console (for development)
export function logConflicts(keytips: KeyTip[] = KEYTIPS): void {
  const report = validateRegistry(keytips);
  
  if (!report.hasConflicts) {
    console.log('✅ KeyTips Registry: No conflicts detected');
    return;
  }
  
  console.warn(`⚠️ KeyTips Registry: ${report.conflicts.length} conflict(s) detected:`);
  report.conflicts.forEach((conflict, index) => {
    console.warn(`${index + 1}. [${conflict.type.toUpperCase()}] ${conflict.description}`);
    console.warn(`   Keytip 1: [${conflict.keytip1.chord.join(' → ')}] → ${conflict.keytip1.command}`);
    console.warn(`   Keytip 2: [${conflict.keytip2.chord.join(' → ')}] → ${conflict.keytip2.command}`);
  });
}

// Run validation on module load (development check)
if (process.env.NODE_ENV === 'development') {
  logConflicts();
}
