// ===============================================
// File: src/keytips/KeyTipsOverlay.tsx (UI widget)
// ===============================================
import React from "react";

export function KeyTipsOverlay({ active, sequence, invalidFlash }: {
  active: boolean;
  sequence: string[];
  invalidFlash?: boolean;
}) {
  if (!active && sequence.length === 0) return null;
  
  return (
    <div style={{
      position: "fixed",
      top: 12,
      right: 12,
      background: invalidFlash ? "#ffefef" : "#1f2937",
      color: invalidFlash ? "#b91c1c" : "#f9fafb",
      border: invalidFlash ? "1px solid #fecaca" : "1px solid #374151",
      borderRadius: 8,
      padding: "10px 12px",
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
      fontSize: 14,
      boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
      zIndex: 9999,
      userSelect: "none",
      pointerEvents: "none",
      transition: "background 150ms ease, border 150ms ease, color 150ms ease",
    }}>
      <div style={{ opacity: 0.8, fontSize: 12, marginBottom: 4 }}>KeyTips</div>
      <div>
        {sequence.length === 0 ? (
          <span style={{ opacity: 0.9 }}>Press keys…</span>
        ) : (
          <span>{["Alt/Cmd", ...sequence].join(" → ")}</span>
        )}
      </div>
    </div>
  );
}
