# UI Migration Strategy: DaisyUI → Radix + Design Tokens

This document outlines the incremental migration strategy from DaisyUI to our new design system using Radix UI primitives and semantic design tokens.

## ✅ Phase 1: Foundation (COMPLETED)

- [x] **Install Radix UI primitives** alongside DaisyUI
- [x] **Create semantic design token system** with dual output (CSS vars + TypeScript types)  
- [x] **Configure Tailwind** with `rgb(var(--token) / <alpha-value>)` pattern
- [x] **Build parallel component structure** (`src/components/ui-v2/`)
- [x] **Create CVA-based Button component** with disciplined props (size/variant/intent)
- [x] **Implement dual-layer theming** (`[data-theme]` + `[data-skin]`)
- [x] **Build thin ThemeProvider** for data attribute management
- [x] **Set up demo page** to showcase new components (`/ui-simple`)

## 🚧 Phase 2: Core Component Library (IN PROGRESS)

### Component Priority Order (Leaf → Complex)

1. **Basic Elements** (No dependencies)
   - [ ] Input
   - [ ] Label  
   - [ ] Textarea
   - [ ] Checkbox
   - [ ] Switch
   - [ ] Slider

2. **Interactive Elements** (Few dependencies)
   - [ ] Dialog/Modal
   - [ ] Dropdown Menu
   - [ ] Popover
   - [ ] Tooltip
   - [ ] Tabs

3. **Form Components** (Depends on basic elements)
   - [ ] Select
   - [ ] Combobox
   - [ ] Form field wrapper
   - [ ] Form validation utilities

4. **Layout Components** (Depends on interactive elements)
   - [ ] Card
   - [ ] Sheet/Drawer
   - [ ] Accordion
   - [ ] Separator

## 📋 Phase 3: Application Components (PLANNED)

5. **Navigation** (Complex composition)
   - [ ] Navigation menu
   - [ ] Breadcrumbs
   - [ ] Command palette

6. **Data Display** (Most complex)
   - [ ] DataTable
   - [ ] Pagination
   - [ ] Toast notifications
   - [ ] Progress indicators

## 🔄 Phase 4: Migration & Cleanup (FINAL)

7. **Component Migration**
   - [ ] Update `SongCard` to use new system
   - [ ] Update `DataTable` components
   - [ ] Update form components
   - [ ] Update layout/navigation

8. **System Integration**
   - [ ] A11y testing integration
   - [ ] Component documentation/Storybook
   - [ ] Performance validation
   - [ ] Bundle size analysis

9. **Cleanup**
   - [ ] Remove DaisyUI dependency
   - [ ] Remove unused Tailwind plugins
   - [ ] Clean up old component files
   - [ ] Update imports throughout codebase

## 🎯 Migration Guidelines

### Component Development Rules
1. **Props discipline**: Limit to `size`, `variant`, `intent` - complex behavior goes in composite components
2. **Always include asChild**: Use Radix Slot for composition flexibility
3. **Semantic tokens only**: No raw color values, use `bg-bg-primary` not `bg-white`
4. **A11y first**: Test keyboard navigation, focus management, screen readers
5. **Theme agnostic**: Components work in both light/dark + all skins

### File Naming Convention
```
src/components/
├── ui/           # Current DaisyUI components (keep during migration)
├── ui-v2/        # New Radix + token components  
└── lib/          # Shared utilities
```

### Import Strategy
```tsx
// During migration, import from specific locations
import { Button } from '@/components/ui/button';     // Old DaisyUI version
import { Button } from '@/components/ui-v2/button';  // New version

// After migration, update index exports to point to v2
import { Button } from '@/components/ui-v2';
```

### Testing Strategy
1. **Side-by-side comparison**: Demo pages showing old vs new
2. **Feature parity**: Ensure new components match old functionality
3. **Visual regression**: Screenshots of key pages before/after
4. **Accessibility audit**: Test with screen readers and keyboard nav
5. **Performance comparison**: Bundle size and runtime performance

## 📊 Progress Tracking

### Completed Components
- [x] Button (with full variant system)
- [x] ThemeProvider + ThemeToggle

### In Development
- [ ] Input component
- [ ] Dialog component  
- [ ] Select component

### Key Metrics
- **Bundle size reduction**: Target 20-30% smaller after removing DaisyUI
- **Design token coverage**: 100% semantic tokens, 0% hardcoded colors
- **Accessibility score**: Maintain or improve current WCAG compliance
- **Developer experience**: Faster development with better TypeScript support

## 🚀 Benefits of New System

### For Developers
- **Type safety**: Full TypeScript support with autocomplete
- **Consistency**: Semantic tokens prevent color/spacing inconsistencies
- **Composition**: asChild pattern enables flexible component usage
- **Performance**: Tree-shakeable components, optimized CSS

### For Users  
- **Accessibility**: WCAG 2.1 AA compliant out of the box
- **Theming**: Smooth theme transitions, system preference support
- **Performance**: Faster load times, better runtime performance
- **Mobile**: Better touch targets, responsive design

## 📝 Next Steps

1. **Start Input component**: Most commonly used after Button
2. **Add Dialog component**: Needed for modals throughout app
3. **Create component documentation**: Help team adopt new patterns
4. **Set up A11y testing**: Automated accessibility validation
5. **Plan DataTable migration**: Most complex component to migrate

---

## 🔗 Related Files

- `src/design-tokens/tokens.ts` - Design token definitions
- `src/components/ui-v2/` - New component library
- `src/lib/ui-utils.ts` - Shared utilities
- `src/routes/ui-simple.tsx` - Component demo page
- `scripts/generate-tokens.cjs` - Token build script