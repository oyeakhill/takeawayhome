// ==============================================
// File: src/keytips/KeyTipsController.ts
// Headless controller for KeyTips state machine
// ==============================================

import { matchChordPrefix } from "./KeyTipsRegistry";

export type Mode = "inactive" | "collecting";

export interface KeyTipsEvents {
  onActivate?: () => void;
  onSequenceChange?: (seq: string[]) => void;
  onMatchedCommand?: (commandId: string) => void;
  onInvalid?: (seq: string[]) => void;
  onCancel?: () => void;
}

export class KeyTipsController {
  private mode: Mode = "inactive";
  private seq: string[] = [];
  private events: KeyTipsEvents;

  constructor(events: KeyTipsEvents = {}) {
    this.events = events;
  }

  getMode() { 
    return this.mode; 
  }
  
  getSequence() { 
    return [...this.seq]; 
  }

  activate() {
    if (this.mode === "collecting") return;
    this.mode = "collecting";
    this.seq = [];
    console.log("🚀 KeyTips activated");
    this.events.onActivate?.();
    this.events.onSequenceChange?.(this.seq);
  }

  appendKey(raw: string) {
    if (this.mode !== "collecting") return;
    const k = raw.toUpperCase();
    if (!/^[A-Z]$/.test(k)) return; // MVP: letters only

    this.seq.push(k);
    console.log(`📝 KeyTips sequence: [${this.seq.join(' → ')}]`);
    this.events.onSequenceChange?.(this.seq);

    // Check against registry for matches
    const { isExact, isPrefix, match } = matchChordPrefix(this.seq);

    if (isExact && match) {
      // Exact match found - execute command and reset
      console.log(`✅ Matched: ${match.command} (${match.label})`);
      this.events.onMatchedCommand?.(match.command);
      this.reset();
      return;
    }

    if (!isPrefix) {
      // No valid prefix - invalid sequence
      console.log(`❌ Invalid sequence: [${this.seq.join(' → ')}]`);
      this.events.onInvalid?.(this.seq);
      this.reset();
      return;
    }

    // Valid prefix - continue collecting
    console.log(`🔄 Valid prefix: [${this.seq.join(' → ')}] - continue collecting`);
  }

  cancel() {
    if (this.mode === "inactive") return;
    console.log("⛔ KeyTips cancelled");
    this.mode = "inactive";
    this.seq = [];
    this.events.onCancel?.();
  }

  reset() {
    console.log("🔄 KeyTips reset");
    this.mode = "inactive";
    this.seq = [];
    this.events.onSequenceChange?.(this.seq);
  }
}
