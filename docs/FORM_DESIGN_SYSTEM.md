# Invoro Form Design System & Style Reference

A plug-and-play design reference for prototyping and building forms (Sales, Rental, Repair, Service Invoices & Quotations) matching Invoro's exact UI style and dark mode aesthetics.

---

## 1. Design Tokens & Color Palette

### Colors

| Token | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| **App Background** | `#F2F2F2` / `bg-gray-100` | `#1F1F20` / `bg-[#1F1F20]` | Page body / canvas |
| **Surface / Card** | `#FFFFFF` / `bg-white` | `#242528` or `#1E1E20` | Modal / Drawer / Form container |
| **Input Background** | `#FFFFFF` / `bg-white` | `#27272A` (`zinc-800`) | Text inputs, datepickers, selects |
| **Borders** | `#E5E7EB` / `border-gray-200` | `#404040` / `#2C2A2A` / `#434343` | Form element borders |
| **Input Shadow Ring** | `shadow-sm` | `shadow-[0px_0px_1px_1px_#404040]` | Dark mode input outline |
| **Text Primary** | `#171718` / `text-gray-900` | `#FFFFFF` / `text-white` | Headings, active values |
| **Text Secondary** | `#4B5563` / `text-gray-700` | `#D1D5DB` / `text-gray-300` | Field labels |
| **Text Muted / Placeholder**| `#9CA3AF` / `text-gray-400` | `#71717A` (`neutral-500`) | Placeholders, helper notes |
| **Primary Accent Button** | `#2B2D33` &rarr; `#111317` | `#7A3714` &rarr; `#C2410C` (`orange-600`) | Primary action (`Next`, `Submit`) |
| **Secondary Button** | `#FFFFFF` (border `#E5E5E5`)| `#382C22` (border `#382C22`) | `Save as draft`, `Back` |

### Typography & Spacing
- **Font Family**: `'Outfit', 'Inter', system-ui, -apple-system, sans-serif`
- **Section Headings**: `text-lg font-medium text-black dark:text-white`
- **Field Labels**: `text-sm font-normal text-gray-800 dark:text-gray-100 flex items-center gap-1 mb-2`
- **Input Height**: `h-10 py-2 px-3 text-sm`
- **Border Radius**: `rounded-lg` (8px) for inputs, `rounded-xl` for cards, `rounded-md` for buttons
- **Grid Layout**: `grid grid-cols-2 gap-4 mb-3` for pairs, `w-full mb-3` for full-width fields

---

## 2. Standalone HTML + Tailwind CSS (Ready to Copy-Paste)

Copy and paste this full modal snippet into any prototype workspace:

```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
  <div class="w-full max-w-xl rounded-2xl bg-white dark:bg-[#1E1E20] border border-gray-200 dark:border-[#333336] shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
    
    <!-- Modal Header -->
    <div class="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-[#2C2A2A]">
      <div>
        <h2 class="text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">Create New Service Invoice</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Type: Service</p>
      </div>
      <button type="button" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 text-sm transition-colors">
        ✕
      </button>
    </div>

    <!-- Scrollable Form Body -->
    <div class="flex-1 overflow-y-auto px-6 py-4 space-y-6">
      
      <!-- Section: Header -->
      <div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">Header</h3>
        
        <!-- Full-width Input: Title -->
        <div class="mb-3">
          <label class="block text-sm font-normal text-gray-800 dark:text-gray-100 mb-1.5">Title</label>
          <input 
            type="text" 
            placeholder="Enter invoice title (e.g. Web Design & Development)" 
            class="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:shadow-[0px_0px_1px_1px_#404040] dark:focus:ring-1 dark:focus:ring-blue-500"
          />
        </div>

        <!-- 2 Column: Invoice Date & Due Date -->
        <div class="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label class="block text-sm font-normal text-gray-800 dark:text-gray-100 mb-1.5">Invoice Date</label>
            <div class="relative flex items-center">
              <span class="absolute left-3 text-gray-400 pointer-events-none text-sm">📅</span>
              <input 
                type="text" 
                value="September 13, 2026" 
                class="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040]"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-normal text-gray-800 dark:text-gray-100 mb-1.5">Due Date</label>
            <div class="relative flex items-center">
              <span class="absolute left-3 text-gray-400 pointer-events-none text-sm">📅</span>
              <input 
                type="text" 
                value="October 13, 2026" 
                class="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040]"
              />
            </div>
          </div>
        </div>

        <!-- Full-width Textarea: Note -->
        <div class="mb-3">
          <label class="block text-sm font-normal text-gray-800 dark:text-gray-100 mb-1.5">Note</label>
          <textarea 
            rows="3" 
            placeholder="Type your message..." 
            class="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none dark:border-transparent dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:shadow-[0px_0px_1px_1px_#404040]"
          ></textarea>
        </div>
      </div>

      <!-- Section: Customer Details -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Customer Details</h3>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-white/10 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-200">
            ✓ Saved customer
          </span>
        </div>

        <!-- Searchable Name Input -->
        <div class="relative mb-3">
          <label class="block text-sm font-normal text-gray-800 dark:text-gray-100 mb-1.5">Name</label>
          <div class="relative flex items-center">
            <svg class="absolute left-3 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search customer or add new" 
              class="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:shadow-[0px_0px_1px_1px_#404040]"
            />
          </div>
        </div>

        <!-- 2 Column: Email & Number -->
        <div class="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label class="block text-sm font-normal text-gray-800 dark:text-gray-100 mb-1.5">Email</label>
            <input 
              type="email" 
              placeholder="Enter Email" 
              class="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:shadow-[0px_0px_1px_1px_#404040]"
            />
          </div>
          <div>
            <label class="block text-sm font-normal text-gray-800 dark:text-gray-100 mb-1.5">Number</label>
            <input 
              type="text" 
              placeholder="Enter Number" 
              class="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:shadow-[0px_0px_1px_1px_#404040]"
            />
          </div>
        </div>

        <!-- 2 Column: Company & Tax ID -->
        <div class="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label class="block text-sm font-normal text-gray-800 dark:text-gray-100 mb-1.5">Company</label>
            <input 
              type="text" 
              placeholder="Enter Company" 
              class="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:shadow-[0px_0px_1px_1px_#404040]"
            />
          </div>
          <div>
            <label class="block text-sm font-normal text-gray-800 dark:text-gray-100 mb-1.5">
              Tax ID <span class="text-xs text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
            </label>
            <input 
              type="text" 
              placeholder="Tax ID" 
              class="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:shadow-[0px_0px_1px_1px_#404040]"
            />
          </div>
        </div>

        <!-- Full-width Input: Address -->
        <div class="mb-3">
          <label class="block text-sm font-normal text-gray-800 dark:text-gray-100 mb-1.5">Address</label>
          <input 
            type="text" 
            placeholder="Address" 
            class="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:shadow-[0px_0px_1px_1px_#404040]"
          />
        </div>
      </div>

      <!-- Section: Alternative Currency (Optional) -->
      <div>
        <div class="flex items-center gap-2 mb-3">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Alternative Currency</h3>
          <span class="text-xs text-gray-400 dark:text-gray-500">(optional)</span>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label class="block text-sm font-normal text-gray-800 dark:text-gray-100 mb-1.5">
              Display Currency <span class="text-xs text-gray-400 dark:text-gray-500">(base: USD)</span>
            </label>
            <div class="relative">
              <select class="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-900 focus:outline-none dark:border-transparent dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] cursor-pointer">
                <option value="">— None —</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="LKR">LKR — Sri Lankan Rupee</option>
                <option value="AED">AED — UAE Dirham</option>
              </select>
              <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400">▼</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-normal text-gray-800 dark:text-gray-100 mb-1.5">Exchange Rate</label>
            <input 
              type="text" 
              placeholder="—" 
              disabled 
              class="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400 dark:border-transparent dark:bg-zinc-800/50 dark:text-zinc-500 dark:shadow-[0px_0px_1px_1px_#404040] disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

    </div>

    <!-- Modal Footer Actions -->
    <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-[#2C2A2A] bg-gray-50/50 dark:bg-[#1A1A1C]">
      <button 
        type="button" 
        class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 dark:bg-[#382C22] dark:border-[#382C22] dark:text-white dark:hover:bg-[#4E3D2F] transition-colors"
      >
        Save as draft
      </button>

      <button 
        type="button" 
        class="rounded-lg px-5 py-2 text-sm font-semibold text-white bg-[#7A3714] hover:bg-orange-700 active:bg-orange-800 shadow-sm transition-colors"
      >
        Next
      </button>
    </div>

  </div>
</div>
```

---

## 3. Individual React / JSX Component Blueprints

### A. Base Input Field (`InputField.jsx`)

```jsx
import React from 'react';

export const InputField = ({
  label,
  optional = false,
  startIcon,
  placeholder,
  value,
  onChange,
  disabled = false,
  type = 'text',
  className = '',
}) => {
  return (
    <div className={`w-full mb-3 space-y-1 ${className}`}>
      {label && (
        <label className="text-sm font-normal text-gray-800 dark:text-gray-100 flex items-center gap-1 mb-1.5">
          {label}
          {optional && <span className="text-gray-400 dark:text-gray-500 text-xs">(optional)</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {startIcon && (
          <div className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none">
            {startIcon}
          </div>
        )}
        <input
          type={type}
          disabled={disabled}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-10 w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:shadow-[0px_0px_1px_1px_#404040] disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
            startIcon ? 'pl-9 pr-3' : 'px-3'
          }`}
        />
      </div>
    </div>
  );
};
```

---

### B. Text Area Field (`TextAreaField.jsx`)

```jsx
import React from 'react';

export const TextAreaField = ({
  label,
  optional = false,
  placeholder,
  value,
  onChange,
  rows = 3,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`w-full mb-3 space-y-1 ${className}`}>
      {label && (
        <label className="text-sm font-normal text-gray-800 dark:text-gray-100 flex items-center gap-1 mb-1.5">
          {label}
          {optional && <span className="text-gray-400 dark:text-gray-500 text-xs">(optional)</span>}
        </label>
      )}
      <textarea
        rows={rows}
        disabled={disabled}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none dark:border-transparent dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:shadow-[0px_0px_1px_1px_#404040] disabled:cursor-not-allowed disabled:opacity-50 transition-all"
      />
    </div>
  );
};
```

---

### C. Base Select Dropdown (`BaseSelect.jsx`)

```jsx
import React from 'react';

export const BaseSelect = ({
  label,
  optional = false,
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`w-full mb-3 space-y-1 ${className}`}>
      {label && (
        <label className="text-sm font-normal text-gray-800 dark:text-gray-100 flex items-center gap-1 mb-1.5">
          {label}
          {optional && <span className="text-gray-400 dark:text-gray-500 text-xs">(optional)</span>}
        </label>
      )}
      <div className="relative">
        <select
          disabled={disabled}
          value={value}
          onChange={onChange}
          className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-9 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};
```

---

### D. Primary & Secondary Buttons (`BaseButton.jsx`)

```jsx
import React from 'react';

export const BaseButton = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };

  const variantClasses = {
    primary:
      'text-white bg-[#7A3714] hover:bg-orange-700 active:bg-orange-800 dark:bg-[#7A3714] dark:hover:bg-orange-700 shadow-sm',
    secondary:
      'text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 dark:bg-[#382C22] dark:border-[#382C22] dark:text-white dark:hover:bg-[#4E3D2F]',
    danger:
      'text-white bg-red-600 hover:bg-red-700 active:bg-red-800',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
        sizeClasses[size] || sizeClasses.md
      } ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
```

---

## 4. Framer Motion Spotlight Hover Effect (Invoro Signature)

To give inputs that signature radial cursor tracking glow:

```jsx
import { useMotionTemplate, useMotionValue, motion } from 'framer-motion';
import React, { useState } from 'react';

export const GlowInputWrapper = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      style={{
        background: useMotionTemplate`
          radial-gradient(
            ${visible ? '100px' : '0px'} circle at ${mouseX}px ${mouseY}px,
            #3b82f6,
            transparent 80%
          )
        `,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="group group/input rounded-lg p-[2px] transition duration-300 flex w-full relative"
    >
      {children}
    </motion.div>
  );
};
```
