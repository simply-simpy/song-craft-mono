# CSS Organization Strategy

## **Problem Solved: Smart CSS Validation**

We've implemented a sophisticated CSS validation system that separates concerns and provides functional linting.

## **CSS Organization Conventions**

### **1. File Structure**

```
src/styles/
├── components/          # Component-specific styles
│   ├── button.css      # Button variants
│   ├── forms.css       # Form controls
│   └── editor.css      # Rich text editor
├── tokens.css          # Design tokens
├── theme.css           # Theme definitions
└── theme-variants.css  # Theme variations
```

### **2. Class Naming Conventions**

#### **Tailwind Classes** (Standard)

- Use standard Tailwind classes: `bg-blue-500`, `text-lg`, `p-4`
- Responsive: `sm:text-lg`, `md:p-6`
- States: `hover:bg-blue-600`, `focus:ring-2`
- Dark mode: `dark:bg-gray-800`

#### **Custom Theme Classes** (Design System)

- **Surface**: `bg-surface-base`, `bg-surface-elevated`
- **Text**: `text-fg-primary`, `text-fg-secondary`
- **Borders**: `border-border-primary`, `border-border-focus`
- **Brand**: `bg-brand-primary`, `text-brand-primary`

#### **Component Classes** (BEM-like)

- **Buttons**: `.btn-primary`, `.btn-secondary`
- **Forms**: `.form-control`, `.form-error`
- **Editor**: `.rich-text-editor`, `.rich-text-toolbar`

### **3. @apply Usage Guidelines**

#### **✅ Good Examples**

```css
.btn-primary {
  @apply bg-brand-primary text-white px-4 py-2 rounded-md;
  @apply hover:bg-brand-hover focus:ring-2 focus:ring-brand-primary;
}

.form-control {
  @apply bg-surface-base border-border-primary text-fg-primary;
  @apply focus:ring-2 focus:ring-border-focus focus:border-transparent;
}
```

#### **❌ Bad Examples**

```css
/* Don't mix comments in @apply */
.btn-bad {
  @apply bg-blue-500 /* This is a comment */ text-white;
}

/* Don't use malformed CSS */
.btn-bad {
  @apply bg-blue-500 { /* Missing closing brace */ text-white;
}
```

### **4. Validation Rules**

#### **Smart Detection**

- ✅ **Valid Tailwind**: `bg-blue-500`, `text-lg`, `hover:bg-gray-100`
- ✅ **Custom Theme**: `bg-surface-base`, `text-fg-primary`
- ✅ **Arbitrary Values**: `w-[200px]`, `bg-[#123456]`
- ✅ **Responsive/Variants**: `sm:text-lg`, `dark:bg-gray-800`

#### **Error Detection**

- ❌ **Invalid Classes**: `bg-invalid-class`
- ⚠️ **Malformed CSS**: Comments/braces in `@apply`

## **Usage**

### **Run Validation**

```bash
# Check all CSS files
npm run validate:css --workspace=songcraft

# Check specific file
npm run validate:css --workspace=songcraft src/components/editor/editor.css
```

### **Build Process Integration**

```bash
# Full frontend check (TypeScript + CSS)
npm run check:frontend
```

## **Benefits**

1. **Catches Real Issues**: Invalid `@apply` classes that break production
2. **Smart Detection**: Recognizes valid Tailwind patterns and custom classes
3. **Clear Separation**: Distinguishes between Tailwind, custom theme, and component classes
4. **Malformed CSS Detection**: Catches syntax errors in CSS files
5. **Build Integration**: Prevents broken CSS from reaching production

## **Next Steps**

1. **Fix Malformed CSS**: Clean up comments and syntax errors in CSS files
2. **Add Missing Classes**: Update validator with any new custom classes
3. **IDE Integration**: Install Tailwind CSS IntelliSense for real-time validation
4. **CI/CD Integration**: Add CSS validation to build pipeline
