import React, { useState, useEffect } from 'react';
import { 
  getAllKeytips, 
  addUserKeytip, 
  removeUserKeytip, 
  loadUserKeytips,
  AVAILABLE_COMMANDS 
} from './DynamicKeytips';
import { KeyTip } from './KeyTipsRegistry';

interface KeyTipsSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onKeytipsChange?: () => void;
}

export function KeyTipsSettings({ isOpen, onClose, onKeytipsChange }: KeyTipsSettingsProps) {
  const [userKeytips, setUserKeytips] = useState<KeyTip[]>([]);
  const [newSequence, setNewSequence] = useState<string[]>([]);
  const [selectedCommand, setSelectedCommand] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadKeytips();
    }
  }, [isOpen]);

  const loadKeytips = () => {
    const userTips = loadUserKeytips();
    setUserKeytips(userTips);
  };

  const handleAddKey = (key: string) => {
    const newSeq = [...newSequence, key.toUpperCase()];
    setNewSequence(newSeq);
    validateSequence(newSeq);
  };

  const validateSequence = (sequence: string[]) => {
    if (sequence.length === 0) {
      setValidationMessage('');
      setIsValid(true);
      return;
    }

    const allKeytips = getAllKeytips();
    const sequenceStr = sequence.join(',');
    
    // Check for exact duplicates
    const duplicate = allKeytips.find(kt => kt.chord.join(',') === sequenceStr);
    if (duplicate) {
      setValidationMessage(`Sequence already exists: ${duplicate.label || duplicate.command}`);
      setIsValid(false);
      return;
    }

    // Check for prefix conflicts
    const hasConflict = allKeytips.some(kt => {
      const existing = kt.chord.join(',');
      return existing.startsWith(sequenceStr + ',') || sequenceStr.startsWith(existing + ',');
    });
    
    if (hasConflict) {
      setValidationMessage('Sequence conflicts with existing KeyTips');
      setIsValid(false);
      return;
    }

    setValidationMessage('Valid sequence ✓');
    setIsValid(true);
  };

  const handleAddKeytip = () => {
    if (!newSequence.length || !selectedCommand || !customLabel) {
      setValidationMessage('Please fill all fields');
      setIsValid(false);
      return;
    }

    const success = addUserKeytip({
      chord: newSequence,
      command: selectedCommand as any,
      label: customLabel
    });

    if (success) {
      setNewSequence([]);
      setSelectedCommand('');
      setCustomLabel('');
      setValidationMessage('KeyTip added successfully!');
      setIsValid(true);
      loadKeytips();
      onKeytipsChange?.();
    } else {
      setValidationMessage('Failed to add KeyTip');
      setIsValid(false);
    }
  };

  const handleRemoveKeytip = (chord: string[]) => {
    const success = removeUserKeytip(chord);
    if (success) {
      loadKeytips();
      onKeytipsChange?.();
    }
  };

  const clearSequence = () => {
    setNewSequence([]);
    setValidationMessage('');
    setIsValid(true);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 20000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80%',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: '#1a73e8' }}>KeyTips Settings</h2>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer'
          }}>×</button>
        </div>

        {/* Add New Section */}
        <div style={{ marginBottom: '32px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Add New KeyTip</h3>
          
          {/* Key Sequence Builder */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Key Sequence:</label>
            <div style={{
              padding: '8px',
              border: `2px solid ${isValid ? '#4CAF50' : '#f44336'}`,
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
              marginBottom: '8px'
            }}>
              <span>Alt/Cmd → {newSequence.join(' → ') || 'Click letters below...'}</span>
              {newSequence.length > 0 && (
                <button onClick={clearSequence} style={{
                  marginLeft: '10px',
                  background: '#ff4444',
                  color: 'white',
                  border: 'none',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}>Clear</button>
              )}
            </div>
            
            {/* Letter Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: '4px', marginBottom: '8px' }}>
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                <button
                  key={letter}
                  onClick={() => handleAddKey(letter)}
                  style={{
                    padding: '8px',
                    border: '1px solid #ddd',
                    background: 'white',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>
            
            <div style={{ fontSize: '12px', color: isValid ? '#4CAF50' : '#f44336' }}>
              {validationMessage}
            </div>
          </div>

          {/* Command Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Command:</label>
            <select
              value={selectedCommand}
              onChange={(e) => {
                setSelectedCommand(e.target.value);
                const cmd = AVAILABLE_COMMANDS.find(c => c.id === e.target.value);
                setCustomLabel(cmd?.label || '');
              }}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Select a command...</option>
              {AVAILABLE_COMMANDS.map(cmd => (
                <option key={cmd.id} value={cmd.id}>
                  {cmd.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Label */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Label:</label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="e.g., 'My Custom Clear'"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <button
            onClick={handleAddKeytip}
            disabled={!isValid || !newSequence.length || !selectedCommand || !customLabel}
            style={{
              padding: '10px 20px',
              background: (isValid && newSequence.length && selectedCommand && customLabel) ? '#1a73e8' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (isValid && newSequence.length && selectedCommand && customLabel) ? 'pointer' : 'not-allowed'
            }}
          >
            Add KeyTip
          </button>
        </div>

        {/* Manage Section */}
        <div>
          <h3>Your Custom KeyTips ({userKeytips.length})</h3>
          
          {userKeytips.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No custom KeyTips yet. Create one above!
            </p>
          ) : (
            <div>
              {userKeytips.map((tip, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '8px'
                }}>
                  <div>
                    <strong>{tip.label}</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Alt/Cmd → {tip.chord.join(' → ')} → {tip.command}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveKeytip(tip.chord)}
                    style={{
                      background: '#ff4444',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* System KeyTips Reference */}
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#666' }}>Built-in KeyTips (Reference)</h4>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <div>Alt/Cmd → H → V → V → Paste Values</div>
              <div>Alt/Cmd → H → B → B → Border Bottom</div>
              <div>Alt/Cmd → H → B → T → Border Top</div>
              <div>Alt/Cmd → H → O → I → AutoFit Columns</div>
              <div>Alt/Cmd → A → S → Sort Descending</div>
              <div>Alt/Cmd → H → C → C → Clear Content</div>
              <div style={{ marginTop: '8px', fontSize: '12px', fontStyle: 'italic' }}>
                All {AVAILABLE_COMMANDS.length} commands are now available for custom KeyTips!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}