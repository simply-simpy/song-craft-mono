/**
 * Design System Color Guidelines
 * 
 * This document explains the proper approach to colors in a design system
 * and why hardcoded colors should be avoided.
 */

import React from "react";

// Import Button component for examples
interface ButtonProps {
  children: React.ReactNode;
  color?: string;
}

const Button: React.FC<ButtonProps> = ({ children }) => <button>{children}</button>;

// ============================================================================
// ❌ BAD: Hardcoded Colors (Don't Do This)
// ============================================================================

// These are hardcoded and don't adapt to theme changes
const BadButtonExamples = () => (
  <div>
    <Button color="crimson">Crimson</Button>
    <Button color="blue">Blue</Button>
    <Button color="green">Green</Button>
    <Button color="orange">Orange</Button>
  </div>
);

// ============================================================================
// ✅ GOOD: Semantic Colors (Do This Instead)
// ============================================================================

// These use semantic naming that adapts to theme changes
const GoodButtonExamples = () => (
  <div>
    <Button>Primary</Button>           {/* Uses current accent color */}
    <Button color="red">Destructive</Button>    {/* Semantic: error/danger */}
    <Button color="green">Success</Button>      {/* Semantic: success/positive */}
    <Button color="orange">Warning</Button>     {/* Semantic: warning/caution */}
  </div>
);

// ============================================================================
// 🎯 Design System Color Principles
// ============================================================================

/*
1. SEMANTIC NAMING
   - Use names that describe purpose, not appearance
   - "Primary", "Destructive", "Success", "Warning"
   - Not "Blue", "Red", "Green", "Orange"

2. THEME ADAPTATION
   - Colors should change when theme changes
   - Primary button uses current accent color
   - Destructive always uses red (semantic)
   - Success always uses green (semantic)

3. ACCESSIBILITY
   - Semantic colors ensure proper contrast
   - Screen readers understand purpose
   - Color-blind users aren't confused

4. CONSISTENCY
   - Same semantic meaning across all components
   - Destructive actions always look the same
   - Success states always use same color
*/

// ============================================================================
// 🎨 Recommended Color Palette
// ============================================================================

const DesignSystemColors = {
  // Primary (adapts to theme accent color)
  primary: "var(--accent-9)",
  primaryHover: "var(--accent-10)",
  primaryText: "var(--accent-contrast)",
  
  // Semantic colors (fixed meanings)
  destructive: "var(--red-9)",
  destructiveHover: "var(--red-10)",
  destructiveText: "var(--red-contrast)",
  
  success: "var(--green-9)",
  successHover: "var(--green-10)",
  successText: "var(--green-contrast)",
  
  warning: "var(--orange-9)",
  warningHover: "var(--orange-10)",
  warningText: "var(--orange-contrast)",
  
  // Neutral colors (adapt to gray theme)
  neutral: "var(--gray-4)",
  neutralHover: "var(--gray-5)",
  neutralText: "var(--gray-11)",
  
  // Surface colors
  surface: "var(--gray-2)",
  surfaceElevated: "var(--gray-3)",
  surfaceHover: "var(--gray-4)",
};

// ============================================================================
// 🔧 Component Implementation
// ============================================================================

const buttonVariants = {
  variants: {
    variant: {
      // Primary: Uses current theme accent color
      primary: "bg-[var(--accent-9)] text-[var(--accent-contrast)] hover:bg-[var(--accent-10)]",
      
      // Destructive: Always red for danger/delete actions
      destructive: "bg-[var(--red-9)] text-[var(--red-contrast)] hover:bg-[var(--red-10)]",
      
      // Success: Always green for positive actions
      success: "bg-[var(--green-9)] text-[var(--green-contrast)] hover:bg-[var(--green-10)]",
      
      // Warning: Always orange for caution
      warning: "bg-[var(--orange-9)] text-[var(--orange-contrast)] hover:bg-[var(--orange-10)]",
      
      // Secondary: Neutral gray
      secondary: "bg-[var(--gray-4)] text-[var(--gray-11)] hover:bg-[var(--gray-5)]",
      
      // Outline: Transparent with border
      outline: "border border-[var(--gray-6)] bg-transparent hover:bg-[var(--gray-4)] text-[var(--gray-12)]",
      
      // Ghost: Transparent, hover background
      ghost: "hover:bg-[var(--gray-4)] text-[var(--gray-11)]",
      
      // Link: Text only with underline
      link: "text-[var(--accent-11)] underline-offset-4 hover:underline",
    }
  }
};

// ============================================================================
// 📝 Usage Guidelines
// ============================================================================

/*
WHEN TO USE EACH VARIANT:

Primary:
- Main call-to-action buttons
- Submit forms
- Primary navigation actions
- "Save", "Continue", "Next"

Destructive:
- Delete actions
- Remove items
- Cancel subscriptions
- "Delete", "Remove", "Cancel"

Success:
- Confirm positive actions
- Complete processes
- "Confirm", "Complete", "Done"

Warning:
- Cautionary actions
- Reversible destructive actions
- "Archive", "Suspend", "Disable"

Secondary:
- Secondary actions
- Alternative options
- "Back", "Skip", "Cancel"

Outline:
- Subtle actions
- Secondary navigation
- "View Details", "Learn More"

Ghost:
- Minimal actions
- Icon buttons
- "Edit", "Settings"

Link:
- Text-based actions
- Navigation links
- "Learn more", "Read more"
*/

export { DesignSystemColors, buttonVariants };
