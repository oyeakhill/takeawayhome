## Overview

Your task is to implement a keyboard-driven command interface for a web-based spreadsheet application, similar to Excel's KeyTips feature. This system allows users to execute spreadsheet commands through sequential keyboard shortcuts.

**Time Expectation**: 1-2 hours
**Deliverables**: A working implementation and documentation in a GitHub pull request.

## What are KeyTips?

KeyTips provide keyboard accessibility by:

* Activating with Alt (Windows/Linux) or Cmd (Mac)
* Showing visual overlays of available keyboard shortcuts
* Allowing sequential key presses to navigate and execute commands
* Example: Alt → H → V → V executes "Paste Values"

Watch this [Excel KeyTips demonstration](https://www.youtube.com/watch?v=emU9KcZKw9k) to understand the user experience. Note: The ribbon interface shown is not required for your implementation.

You can also see [how KeyTips are implemented in Meridian](https://drive.google.com/file/d/1-GANv2HjCTGD7TGFt6htRV2emEpIIZDn/view?usp=sharing) for reference. Note: Your UI implementation does not need to look the same as Meridian's interface.

## Why This Matters

For many financial professionals—especially in banking and consulting—Excel is their IDE. They rely almost entirely on the keyboard, navigating and editing at high speed with muscle memory alone. Reaching for the mouse breaks flow. KeyTips aren’t just a nice-to-have—they’re essential to preserving the kind of power-user experience that makes spreadsheets feel seamless. This assignment simulates how we bring that level of keyboard-driven efficiency into a modern, web-based spreadsheet environment.

## Requirements

### 1. Implement These 5 KeyTips

| Shortcut            | Action          | Description                             |
| ------------------- | --------------- | --------------------------------------- |
| Alt/Cmd + H + V + V | Paste Values    | Paste only values (not formulas)        |
| Alt/Cmd + H + B + B | Border Bottom   | Add bottom border to selected cells     |
| Alt/Cmd + H + B + T | Border Top      | Add top border to selected cells        |
| Alt/Cmd + H + O + I | AutoFit Column  | Adjust column width to fit content      |
| Alt/Cmd + A + S     | Sort Descending | Sort selected cells in descending order |

### 2. User Experience Requirements

* **Activation**: Pressing Alt/Cmd should activate the KeyTips system
* **Sequential Input**: Keys are pressed one at a time (not simultaneously)
* **Visual Feedback**: Display the currently active key sequence
* **Cancellation**: Allow users to exit at any point (Esc or clicking away)
* **Action Behavior**: Each action should work equivalently to Google Sheets

### 3. Technical Requirements

* Design the system to support 100+ potential keytips (not just the 5 required)
* Use the provided spreadsheet library
* Create a `keytips.md` file explaining how to add new keytips

### 4. Documentation & Submission

Submit a PR containing:

* Your implementation code
* `keytips.md` - Instructions for adding new keytips
* Updated README listing what you would improve to consider the system "production grade", ranked by importance

## Getting Started & Submission Steps

1. Clone this repository locally and create a separate private repo for permission (add gfang200 as a collaborator)
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the development server:

   ```bash
   npm run start
   ```
4. Implement the KeyTips system
5. Push your work to your cloned private repository and share the link

## What We're Looking For

**No pressure!** We know this is a time-pressured challenge, and we're not expecting a perfect, production-ready system. Our goal is to understand how you approach problems and make decisions within realistic time constraints.

We love to see:

* Clear thought process and systematic approach to tackling implementation challenges
* Intentional balance between features and infrastructure with ruthless prioritization when time or knowledge is limited
* Proactive handling of edge cases and adherence to best practices
* Effective use of AI tools, documentation, and other resources to solve problems efficiently
* Strong ability to autonomously understand and extend requirements from the examples provided

Remember: This is about understanding your development approach, not getting everything perfect. Focus on the MVP requirements and share your thoughts on what you'd improve for production use!

## Tips

* Use AI tools effectively but don't get stuck. SpreadJS documentation ([https://developer.mescius.com/spreadjs/docs/overview](https://developer.mescius.com/spreadjs/docs/overview)) is also a great resource
* Try performing these operations manually in Google Sheets to understand the expected behavior and user experience
* Consider how the system should handle cases like invalid key sequences
* Feel free to make implementation decisions that best showcase your skills!

Good luck! If you have questions about how any specific Google Sheets behavior works, please ask for clarification.

---

## 🚀 Production-Grade Improvements

**Ranked by importance for production deployment:**

### **1. User-Facing KeyTips Customization UI** 🎯 **CRITICAL**
**Impact**: High - Enables end users to create custom shortcuts without developer intervention
- Settings panel accessible from spreadsheet UI
- Visual editor for creating/editing/deleting keytips  
- Real-time conflict detection and validation
- Import/export of keytip configurations
- Command discovery with user-friendly names
- Persistence to user profile/localStorage

### **2. SpreadJS Cell Editor Interference Resolution** 🐛 **HIGH**
**Impact**: High - Currently causes data loss when using keytips
- Research SpreadJS APIs to disable cell editing during keytip collection
- Implement cell value preservation during keytip sequences
- Add invisible overlay to capture keyboard events before SpreadJS
- Test edge cases with formulas, formatted cells, and protected ranges

### **3. Comprehensive Command Library** 📚 **HIGH** 
**Impact**: High - Essential for feature parity with Excel
- Implement 50+ common spreadsheet commands
- Categorize commands (Format, Data, Insert, View, etc.)
- Add complex operations (pivot tables, charts, conditional formatting)
- Support for multi-step commands and sub-menus
- Contextual command availability based on selection

### **4. Advanced KeyTips Discovery & Help** 💡 **MEDIUM**
**Impact**: Medium - Improves user adoption and discoverability  
- Interactive help overlay showing available keytips
- Search functionality for commands
- Tutorial mode for new users
- Contextual hints based on current selection
- Quick reference card (printable/PDF)

### **5. Accessibility & Internationalization** 🌍 **MEDIUM**
**Impact**: Medium - Required for global enterprise deployment
- Screen reader compatibility with ARIA labels
- High contrast mode support  
- Keyboard layout adaptation (QWERTY, AZERTY, etc.)
- Localization of command names and keytips
- Right-to-left language support

### **6. Performance & Scalability Optimization** ⚡ **MEDIUM**
**Impact**: Medium - Important for large spreadsheets and many custom keytips
- Lazy loading of command executors
- Efficient prefix tree implementation for 1000+ keytips
- Memory optimization for large datasets
- Web Worker usage for complex commands
- Caching of frequently used command results

### **7. Enterprise Integration & Security** 🔒 **MEDIUM** 
**Impact**: Medium - Required for corporate environments
- Admin-defined keytip templates and restrictions
- Integration with corporate identity systems
- Audit logging of keytip usage
- Data loss prevention hooks
- Compliance with enterprise security policies

### **8. Advanced UX Polish** ✨ **LOW**
**Impact**: Low - Nice-to-have improvements for user experience
- Animated transitions and micro-interactions
- Sound feedback (optional)
- Themeable overlay design
- Mobile/touch device support
- Gesture recognition for tablets

### **9. Analytics & Telemetry** 📊 **LOW**
**Impact**: Low - Useful for product improvement but not user-critical
- Usage analytics for popular keytips
- Performance metrics and error tracking
- A/B testing framework for new features
- User feedback collection system
- Command execution latency monitoring

### **10. Developer Experience Enhancements** 🛠️ **LOW**
**Impact**: Low - Helpful for maintainability but not user-facing
- Comprehensive test suite (unit, integration, e2e)
- TypeScript strict mode compliance
- Automated conflict detection in CI/CD
- Performance benchmarking suite
- Plugin architecture for third-party commands

---

**MVP Status**: Core functionality complete with registry-based architecture supporting 100+ keytips, conflict detection, and full documentation. Ready for user customization UI implementation.
