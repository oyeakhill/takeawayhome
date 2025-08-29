import React, { useRef, useEffect } from 'react';
import * as GC from '@mescius/spread-sheets';
import { SpreadSheets } from '@mescius/spread-sheets-react';
import '@mescius/spread-sheets/styles/gc.spread.sheets.excel2013white.css';
import './App.css';
import { execute, type CommandId } from './keytips/CommandExecutor';
import { useKeyTips } from './keytips/useKeyTips';
import { KeyTipsOverlay } from './keytips/KeyTipsOverlay';

function App() {
  const spreadRef = useRef<any>(null);
  const { active, sequence, invalidFlash, controller } = useKeyTips();

  const initSpread = (spread: any) => {
    console.log('Spread initialized');
    const sheet = spread.getActiveSheet();
    
    // Set some initial data
    sheet.setValue(0, 0, "Meridian Take Home");
    sheet.setValue(1, 0, "The following placeholder data is for testing purposes.");
    
    // Style the welcome message
    const style = new GC.Spread.Sheets.Style();
    style.font = "bold 16pt Arial";
    style.foreColor = "#1a73e8";
    sheet.setStyle(0, 0, style);
    
    // Add some sample data
    sheet.setValue(3, 0, "Product");
    sheet.setValue(3, 1, "Price");
    sheet.setValue(3, 2, "Quantity");
    sheet.setValue(3, 3, "Total");
    
    sheet.setValue(4, 0, "Laptop");
    sheet.setValue(4, 1, 999.99);
    sheet.setValue(4, 2, 2);
    sheet.setFormula(4, 3, "=B6*C6");
    
    sheet.setValue(5, 0, "Mouse");
    sheet.setValue(5, 1, 29.99);
    sheet.setValue(5, 2, 5);
    sheet.setFormula(5, 3, "=B7*C7");
    
    sheet.setValue(6, 0, "Keyboard");
    sheet.setValue(6, 1, 79.99);
    sheet.setValue(6, 2, 3);
    sheet.setFormula(6, 3, "=B8*C8");
    
    // Add total formula
    sheet.setValue(8, 2, "Total:");
    sheet.setFormula(8, 3, "=SUM(D6:D8)");
    
    // Add some unsorted test data for sorting (Phase 3)
    sheet.setValue(10, 0, "Sort Test Data:");
    sheet.setValue(11, 0, "Apple");
    sheet.setValue(11, 1, 50);
    sheet.setValue(12, 0, "Zebra");
    sheet.setValue(12, 1, 25);
    sheet.setValue(13, 0, "Banana");
    sheet.setValue(13, 1, 75);
    
    // Format the price columns
    const currencyFormatter = new GC.Spread.Formatter.GeneralFormatter("$#,##0.00");
    sheet.getRange(5, 1, 3, 1).formatter(currencyFormatter);
    sheet.getRange(5, 3, 5, 1).formatter(currencyFormatter);
    
    // Auto fit columns
    sheet.autoFitColumn(0);
    sheet.autoFitColumn(1);
    sheet.autoFitColumn(2);
    sheet.autoFitColumn(3);
  };

  // Phase 4: KeyTips with Visual Feedback
  useEffect(() => {
    // Handle command execution
    const originalOnMatchedCommand = controller['events'].onMatchedCommand;
    controller['events'].onMatchedCommand = (cmd: string) => {
      originalOnMatchedCommand?.(cmd);
      // Execute the actual command
      const spread = spreadRef.current?.spread || spreadRef.current;
      if (spread) {
        execute(cmd as CommandId, { spread });
      } else {
        console.error('Spread instance not available');
      }
    };

    // Block ALL events more aggressively (from Phase 3 - keeping known issue)
    const blockEvent = (e: Event) => {
      if (controller.getMode() === 'collecting') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (controller.getMode() === 'collecting') {
        blockEvent(e);
        return false;
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (controller.getMode() === 'collecting') {
        blockEvent(e);
        return false;
      }
    };

    const handleInput = (e: Event) => {
      if (controller.getMode() === 'collecting') {
        blockEvent(e);
        return false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const isMeta = e.key === 'Meta';
      const isAlt = e.key === 'Alt';
      const isEsc = e.key === 'Escape';

      if (isAlt || isMeta) {
        e.preventDefault();
        e.stopPropagation();
        controller.activate();
        return false;
      }

      if (isEsc) {
        // Phase 5: Enhanced Escape handling
        if (controller.getMode() === 'collecting') {
          console.log('⏸️ Escape pressed - cancelling KeyTips');
          e.preventDefault();
          e.stopPropagation();
          controller.cancel();
        }
        return;
      }

      if (controller.getMode() === 'collecting') {
        if (/^[a-zA-Z]$/.test(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          controller.appendKey(e.key);
          return false;
        }
      }
    };

    const handleMouseDown = () => {
      // Phase 5: Cancel on click outside
      if (controller.getMode() === 'collecting') {
        console.log('🖱️ Mouse click detected - cancelling KeyTips');
        controller.cancel();
      }
    };

    // Add multiple event listeners to catch everything
    const events = ['keydown', 'keypress', 'keyup', 'input', 'textInput'];
    
    events.forEach(eventType => {
      if (eventType === 'keyup') {
        window.addEventListener(eventType, handleKeyUp, true);
      } else if (eventType === 'keydown') {
        window.addEventListener(eventType, handleKeyDown, true);
      } else if (eventType === 'keypress') {
        window.addEventListener(eventType, handleKeyPress, true);
      } else {
        window.addEventListener(eventType, handleInput, true);
      }
    });
    
    window.addEventListener('mousedown', handleMouseDown, true);

    return () => {
      events.forEach(eventType => {
        if (eventType === 'keyup') {
          window.removeEventListener(eventType, handleKeyUp, true);
        } else if (eventType === 'keydown') {
          window.removeEventListener(eventType, handleKeyDown, true);
        } else if (eventType === 'keypress') {
          window.removeEventListener(eventType, handleKeyPress, true);
        } else {
          window.removeEventListener(eventType, handleInput, true);
        }
      });
      window.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, [controller]);

  return (
    <div className="App" style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ 
        margin: 0, 
        padding: '10px', 
        backgroundColor: '#f5f5f5', 
        borderBottom: '1px solid #ddd' 
      }}>
        Meridian Take Home
      </h2>
      <div style={{ flex: 1, position: 'relative' }}>
        <SpreadSheets 
          ref={spreadRef}
          workbookInitialized={initSpread}
          hostStyle={{ 
            width: '100%', 
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
        <KeyTipsOverlay 
          active={active} 
          sequence={sequence} 
          invalidFlash={invalidFlash} 
        />
      </div>
    </div>
  );
}

export default App;