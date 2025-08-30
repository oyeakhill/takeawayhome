# Project Overview

This project implements a keyboard-driven command interface for a web-based spreadsheet application. It replicates the **KeyTips** feature similar to Microsoft Excel, where users can execute spreadsheet commands through sequential keyboard shortcuts. This system is designed to improve productivity for power users, especially in environments like finance or consulting, where keyboard navigation is essential.

---

## Objectives

The initial goal of this project was to implement a system that allows users to perform actions in a spreadsheet by entering a series of keyboard shortcuts, much like Excel’s KeyTips.

### Key Features

* **Activation**: The system is activated by pressing `Alt` (Windows/Linux) or `Cmd` (Mac).
* **Sequential Input**: Users enter commands by pressing keys one at a time.
* **Visual Feedback**: The system provides visual feedback on the current key sequence and available options.
* **Action Execution**: Once the correct sequence is entered, the corresponding action is executed (e.g., "Paste Values").

The system supports **5 predefined KeyTips**:

* `Alt/Cmd + H + V + V`: Paste Values
* `Alt/Cmd + H + B + B`: Border Bottom
* `Alt/Cmd + H + B + T`: Border Top
* `Alt/Cmd + H + O + I`: AutoFit Column
* `Alt/Cmd + A + S`: Sort Descending

---

## Additional Features

In addition to the core functionality requested, the system includes a **dynamic KeyTips management system**, allowing users to:

* **Add Custom KeyTips**: Users can define their own key sequences for custom actions.
* **Remove Custom KeyTips**: Custom key sequences can be deleted.
* **Real-time KeyTip Management**: The interface supports real-time updates and validation when adding or removing KeyTips.

### Developer Features:

* **Dynamic Registry**: The KeyTips registry can be updated dynamically during runtime without requiring a full application rebuild.
* **Conflict Detection**: The system includes automatic conflict detection, ensuring that KeyTips do not overlap or cause unintended behavior.
* **Command Integration**: New commands can easily be added by extending the `CommandExecutor` and updating the `KEYTIPS` registry.

---

## Project Structure

Here is a brief overview of the file structure:

```
src/
├── keytips/
│   ├── CommandExecutor.ts       ← Command actions (e.g., Paste, Bold, AutoFit)
│   ├── KeyTipsController.ts     ← Core logic for KeyTips state machine
│   ├── KeyTipsOverlay.tsx       ← UI for displaying key sequence and feedback
│   ├── KeyTipsSettings.tsx      ← React component for managing user KeyTips
│   ├── KeyTipsRegistry.ts       ← Registry of all system and custom KeyTips
│   └── DynamicKeytips.ts        ← User-defined KeyTips and dynamic registry management
├── App.tsx                      ← Main application component
├── App.css                      ← Styles for the app and KeyTips UI
└── index.tsx                    ← React entry point
```

---

## How to Use

### For Business Users

1. **Activate KeyTips**: Press `Alt` (Windows/Linux) or `Cmd` (Mac) to activate the system.
2. **Enter Key Sequences**: After activation, type the corresponding keys for one of the available actions.
3. **Custom KeyTips**: Through the **Settings panel**, you can add your own custom keyboard shortcuts for actions that are not included by default. The sequence should follow the format `Alt/Cmd → Key → Key → Key...`.
4. **Settings Panel**: You can access the KeyTips settings panel by clicking on the "⌨️ KeyTips Settings" button at the top-right of the spreadsheet interface. From there, you can manage, add, or remove KeyTips.

### For Developers

1. **Clone the Repository**: Start by cloning the repository and installing dependencies:

   ```bash
   git clone <repository-url>
   cd project-directory
   npm install
   ```
2. **Run the Development Server**: Start the application:

   ```bash
   npm run start
   ```
3. **Adding New KeyTips**: To add a new KeyTip, follow these steps:

   * **Step 1**: Define the new sequence in the `KEYTIPS` array in `KeyTipsRegistry.ts`.
   * **Step 2**: Implement the corresponding action in the `CommandExecutor.ts`.
   * **Step 3**: Use the **Settings panel** to test your new KeyTip and add/remove it dynamically.
4. **Conflict Management**: If you attempt to add a conflicting KeyTip, the system will automatically detect it and provide feedback. Conflicts can be caused by duplicate sequences or prefix overlaps.

### Example: Add a Custom Command

To add a custom command, such as freezing the first row:

1. Add it to the registry:

   ```typescript
   {
     chord: ["H", "F", "S"],
     command: "freezeFirstRow",
     label: "Freeze First Row"
   }
   ```
2. Implement the command in `CommandExecutor.ts`:

   ```typescript
   case "freezeFirstRow":
     sheet.frozenRowCount(1);
     break;
   ```

---

## KeyTips UI

The **KeyTips Overlay** will display the current sequence as users type. If the sequence is invalid or incomplete, it will flash a warning.

---

## Conclusion

This project offers a robust, customizable system for implementing **keyboard-driven command execution** within a web-based spreadsheet. The dynamic nature of the KeyTips system allows both **business users** to add their own shortcuts and **developers** to extend functionality quickly, making it a versatile solution for enhancing productivity in spreadsheet applications.


