// =================================================
// File: src/keytips/useKeyTips.ts (React integration)
// =================================================
import { useMemo, useState } from "react";
import { KeyTipsController } from "./KeyTipsController";

export function useKeyTips() {
  const [active, setActive] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);
  const [invalidFlash, setInvalidFlash] = useState(false);

  const controller = useMemo(() => new KeyTipsController({
    onActivate: () => {
      console.log('KeyTips activated - normal typing disabled');
      setActive(true);
      setSequence([]);
      setInvalidFlash(false);
    },
    onSequenceChange: (seq) => {
      setSequence(seq);
      setInvalidFlash(false);
    },
    onMatchedCommand: (cmd) => {
      console.log(`Command matched: ${cmd}`);
      // Command will be executed by the caller
      // Reset to inactive after command execution
      setTimeout(() => {
        setActive(false);
        setSequence([]);
        console.log('KeyTips reset - normal typing restored');
      }, 100);
    },
    onInvalid: (seq) => {
      console.log('Invalid sequence detected');
      setInvalidFlash(true);
      // Flash invalid for 300ms, then hide overlay
      setTimeout(() => {
        setInvalidFlash(false);
        setActive(false);
        setSequence([]);
        console.log('KeyTips reset after invalid sequence - normal typing restored');
      }, 300);
    },
    onCancel: () => {
      console.log('KeyTips cancelled - normal typing restored');
      setActive(false);
      setSequence([]);
      setInvalidFlash(false);
    },
  }), []);

  return { active, sequence, invalidFlash, controller };
}
