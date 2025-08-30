import React, { useRef, useEffect, useState } from 'react';
import * as GC from '@mescius/spread-sheets';
import { SpreadSheets } from '@mescius/spread-sheets-react';
import '@mescius/spread-sheets/styles/gc.spread.sheets.excel2013white.css';
import './App.css';
import { execute, type CommandId } from './keytips/CommandExecutor';
import { useKeyTips } from './keytips/useKeyTips';
import { KeyTipsOverlay } from './keytips/KeyTipsOverlay';
import { KeyTipsSettings } from './keytips/KeyTipsSettings';
import { loadUserKeytips } from './keytips/DynamicKeytips';

function App() {
  const spreadRef = useRef<any>(null);
  const { active, sequence, invalidFlash, controller } = useKeyTips();
  const [showSettings, setShowSettings] = useState(false);

  // Load user keytips on app start
  useEffect(() => {
    loadUserKeytips();
  }, []);

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

  // Enhanced KeyTips with Cell Editor Protection
  useEffect(() => {
    let preservedCellValue: any = null;
    let preservedCellRow: number = -1;
    let preservedCellCol: number = -1;
    let spreadEditorDisabled = false;

    // Helper function to disable SpreadJS editing
    const disableSpreadJSEditor = () => {
      if (!spreadRef.current || spreadEditorDisabled) return;
      
      try {
        const currentSpread = spreadRef.current.spread || spreadRef.current;
        if (!currentSpread) {
          console.warn('⚠️ Cannot disable SpreadJS editor - spread not available');
          return;
        }
        
        const sheet = currentSpread.getActiveSheet();
        if (!sheet) {
          console.warn('⚠️ Cannot disable SpreadJS editor - no active sheet');
          return;
        }
        
        // Preserve current cell value before disabling editing
        try {
          preservedCellRow = sheet.getActiveRowIndex();
          preservedCellCol = sheet.getActiveColumnIndex();
          preservedCellValue = sheet.getValue(preservedCellRow, preservedCellCol);
        } catch (error) {
          console.warn('⚠️ Could not preserve cell value:', error);
        }
        
        // Try to disable cell editing via SpreadJS APIs
        try {
          if (sheet.options) {
            sheet.options.isProtected = true;
            console.log('🔒 SpreadJS editing temporarily disabled');
            spreadEditorDisabled = true;
          }
        } catch (error) {
          console.warn('⚠️ Could not set sheet protection:', error);
        }
      } catch (error) {
        console.warn('⚠️ Could not disable SpreadJS editor via API:', error);
      }
    };

    // Helper function to re-enable SpreadJS editing
    const enableSpreadJSEditor = () => {
      if (!spreadRef.current || !spreadEditorDisabled) return;
      
      try {
        const currentSpread = spreadRef.current.spread || spreadRef.current;
        if (!currentSpread) {
          console.warn('⚠️ Cannot re-enable SpreadJS editor - spread not available');
          return;
        }
        
        const sheet = currentSpread.getActiveSheet();
        if (!sheet) {
          console.warn('⚠️ Cannot re-enable SpreadJS editor - no active sheet');
          return;
        }
        
        // Re-enable editing
        try {
          if (sheet.options) {
            sheet.options.isProtected = false;
            console.log('🔓 SpreadJS editing re-enabled');
          }
        } catch (error) {
          console.warn('⚠️ Could not remove sheet protection:', error);
        }
        
        // Restore cell value if it was corrupted during KeyTips sequence
        if (preservedCellRow >= 0 && preservedCellCol >= 0) {
          try {
            const currentValue = sheet.getValue(preservedCellRow, preservedCellCol);
            
            // Check if value was corrupted (contains single letters that could be from KeyTips)
            if (currentValue && typeof currentValue === 'string' && 
                currentValue.length === 1 && /^[A-Za-z]$/.test(currentValue) &&
                currentValue !== preservedCellValue) {
              
              console.log(`🔄 Restoring corrupted cell R${preservedCellRow}C${preservedCellCol}: "${currentValue}" → "${preservedCellValue}"`);
              sheet.setValue(preservedCellRow, preservedCellCol, preservedCellValue);
            }
          } catch (error) {
            console.warn('⚠️ Could not restore cell value:', error);
          }
        }
        
        spreadEditorDisabled = false;
        preservedCellValue = null;
        preservedCellRow = -1;
        preservedCellCol = -1;
      } catch (error) {
        console.warn('⚠️ Could not re-enable SpreadJS editor:', error);
      }
    };

    // Handle command execution
    const originalOnMatchedCommand = controller['events'].onMatchedCommand;
    controller['events'].onMatchedCommand = (cmd: string) => {
      originalOnMatchedCommand?.(cmd);
      
      // Get the spread instance more reliably
      const spread = spreadRef.current?.spread || spreadRef.current;
      
      if (!spread) {
        console.error('❌ Spread instance not available - retrying...');
        // Retry after a short delay
        setTimeout(async () => {
          const retrySpread = spreadRef.current?.spread || spreadRef.current;
          if (retrySpread) {
            console.log('✅ Spread instance found on retry');
            await execute(cmd as CommandId, { spread: retrySpread });
          } else {
            console.error('❌ Spread instance still not available after retry');
          }
        }, 100);
        return;
      }
      
      console.log('🎬 Executing command with spread instance:', !!spread);
      execute(cmd as CommandId, { spread }).catch(error => {
        console.error('❌ Command execution failed:', error);
      });
    };

    // Enhanced activation handler
    const originalOnActivate = controller['events'].onActivate;
    controller['events'].onActivate = () => {
      console.log('🚀 KeyTips activated - protecting cell data');
      disableSpreadJSEditor();
      originalOnActivate?.();
    };

    // Enhanced cancel/reset handlers
    const originalOnCancel = controller['events'].onCancel;
    controller['events'].onCancel = () => {
      console.log('⛔ KeyTips cancelled - restoring editor');
      enableSpreadJSEditor();
      originalOnCancel?.();
    };

    // Enhanced invalid handler
    const originalOnInvalid = controller['events'].onInvalid;
    controller['events'].onInvalid = (seq) => {
      console.log('❌ KeyTips invalid - restoring editor');
      enableSpreadJSEditor();
      originalOnInvalid?.(seq);
    };

    // Ultra-aggressive event blocking with highest priority
    const blockAllEvents = (e: Event) => {
      if (controller.getMode() === 'collecting') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Also try to prevent default behavior
        if ('returnValue' in e) {
          (e as any).returnValue = false;
        }
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
        e.stopImmediatePropagation();
        controller.activate();
        return false;
      }

      if (isEsc && controller.getMode() === 'collecting') {
        console.log('⏸️ Escape pressed - cancelling KeyTips');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        controller.cancel();
        return false;
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
      if (controller.getMode() === 'collecting') {
        console.log('🖱️ Mouse click detected - cancelling KeyTips');
        controller.cancel();
      }
    };

    // Add event listeners with maximum priority (capture phase + immediate)
    const eventTypes = ['keydown', 'keypress', 'keyup', 'input', 'textInput', 'beforeinput'];
    
    // Add keyup handler first
    document.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('keyup', handleKeyUp, true);
    
    // Add ultra-aggressive blocking for all other keyboard events
    eventTypes.forEach(eventType => {
      if (eventType !== 'keyup') {
        document.addEventListener(eventType, blockAllEvents, true);
        window.addEventListener(eventType, blockAllEvents, true);
        // Also add to document.body for extra coverage
        document.body?.addEventListener(eventType, blockAllEvents, true);
      }
    });
    
    // Mouse event handling
    document.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('mousedown', handleMouseDown, true);

    return () => {
      // Cleanup: restore editor if KeyTips was active
      if (spreadEditorDisabled) {
        enableSpreadJSEditor();
      }
      
      // Remove event listeners
      document.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      
      eventTypes.forEach(eventType => {
        if (eventType !== 'keyup') {
          document.removeEventListener(eventType, blockAllEvents, true);
          window.removeEventListener(eventType, blockAllEvents, true);
          document.body?.removeEventListener(eventType, blockAllEvents, true);
        }
      });
      
      document.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, [controller]);

  return (
    <div className="App" style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Settings Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 0, 
        padding: '10px', 
        backgroundColor: '#f5f5f5', 
        borderBottom: '1px solid #ddd' 
      }}>
        <h2 style={{ margin: 0 }}>Meridian Take Home</h2>
        <button 
          onClick={() => setShowSettings(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          ⌨️ KeyTips Settings
        </button>
      </div>
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
        
        {/* Invisible overlay to prevent SpreadJS from receiving keyboard events during KeyTips */}
        {active && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              zIndex: 10000, // Higher than SpreadJS but lower than KeyTipsOverlay
              pointerEvents: 'auto', // Allow mouse events to cancel
              userSelect: 'none',
              cursor: 'default'
            }}
            onKeyDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🛡️ Overlay blocked keydown:', e.key);
            }}
            onKeyPress={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🛡️ Overlay blocked keypress:', e.key);
            }}
            onInput={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🛡️ Overlay blocked input');
            }}
            onClick={() => {
              console.log('🛡️ Overlay click - cancelling KeyTips');
              controller.cancel();
            }}
            tabIndex={-1} // Make it focusable to capture keyboard events
            ref={(el) => {
              if (el && active) {
                el.focus();
              }
            }}
          />
        )}
        
        {/* KeyTips Settings Modal */}
        <KeyTipsSettings 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onKeytipsChange={() => {
            // Refresh the controller with new keytips
            console.log('🔄 User keytips updated - system refreshed');
          }}
        />
      </div>
    </div>
  );
}

export default App;