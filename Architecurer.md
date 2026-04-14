# Project Architecture:

This document outlines the architectural patterns, folder structure, and technical stack to use in this project. This structure is designed for scalability, maintainability, and high-performance in a modern React environment.

## Technical Stack

- **Framework:** [React 19](https://react.dev/)

- **Build Tool:** [Vite](https://vitejs.dev/)

- **Language:** [TypeScript](https://www.typescriptlang.org/)

- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)

- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) & [Redux Persist](https://github.com/rt2zz/redux-persist)

- **Routing:** [React Router DOM 7](https://reactrouter.com/)

- **UI Components:** [Radix UI](https://www.radix-ui.com/) (Primitives) & [Lucide React](https://lucide.dev/) (Icons)

- **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) (Validation)

- **Data Visualization:** [Recharts](https://recharts.org/)

- **Animations:** [Framer Motion](https://www.framer.com/motion/)

---

## Folder Structure

The project follows a modular, feature-based directory structure:

## Project Structure & Guidelines

### 1. Directory Tree

src/
├── common/             # Complex shared components (DynamicTable, DynamicForm, etc.)
├── components/         # Atomic UI primitives (Button, Input, Badge)
├── hooks/              # Global custom React hooks
├── Layout/             # Layout wrappers (DashboardLayout, PublicLayout)
├── pages/
│   ├── Dashboard/      # Protected pages grouped by role
│   │   ├── Admin/
│   │   │   ├── Overview/
│   │   │   │   ├── Overview.tsx
│   │   │   │   └── Components/ # Page-specific components
│   │   │   └── Clients/
│   │   └── User/       # User-specific dashboard modules
│   └── Public/         # Unprotected pages (Home, About, Contact)
│       └── Home/
│           ├── Home.tsx
│           └── Components/
├── routes/             # Route configs (AdminRoutes, PublicRoutes, ProtectedRoutes)
├── store/
│   ├── api/            # RTK Query services + API Type definitions
│   ├── features/       # Redux slices (Auth, UI state, etc.)
│   └── store.ts        # Store configuration
├── utils/
│   └── Generator/      # Logic for Routes, Breadcrumbs, Menus, and Zod Schemas
└── types/              # Global shared TypeScript interfaces

---

## Key Architectural Patterns

### 1. Feature-Based Organization *****

Pages are grouped logically by actor (Admin, Supporter, etc.) and then by feature. Each feature folder inside `pages/Admin/` (like `Support`) contains its own `Components/` subfolder for local, feature-specific components.

### 2. Centralized Routing *****

Routes are defined in `src/routes/` as configuration objects. This allows for dynamic menu generation and centralized permission management.

### 3. Separation of Concerns (UI vs. Logic)

- **UI Components:** Found in `src/components/ui`, these are pure, reusable primitives.

- **Common Components:** Found in `src/common`, these handle more complex shared logic like dynamic data rendering.

- **Feature Components:** Located within the page folders, these are specific to a single module.

### 4. State Management Strategy

- **Global State:** Managed via Redux Toolkit slices (`src/store/`).

- **Persistence:** Sensitive or necessary data (like auth tokens) is persisted using `redux-persist`.

- **Local State:** React `useState` and `useMemo` are preferred for component-specific logic.

### 5. Type Safety *****

The project enforces strict TypeScript usage. Global types reside in `src/types/`, while component-specific interfaces are defined within the component files for proximity and clarity.

### 6. API & Type Strictness
To maintain a high-integrity data layer, the project follows a strict colocation rule for RTK Query:
- **Colocation:** Every API service (e.g., `userApi.ts`) must have a sibling file named `userApiTypes.ts` in the same directory.
- **Explicit Naming:** Response and Payload types must be explicitly named (e.g., `GetUserResponse`, `UpdateUserPayload`) to avoid confusion with UI component props.
- **Single Source of Truth:** Types defined in `apiTypes.ts` are the master definitions; components must import these types rather than redefining them locally.

### 7. Optimized Performance (Code Splitting)
To ensure the dashboard remains performant as it scales:
- **Lazy Loading:** All page-level components in `src/routes/` are imported using `React.lazy()`. This splits the application into smaller "chunks."
- **Suspense Boundaries:** The main `Routes.tsx` wrapper uses a `<Suspense>` boundary with a global fallback (e.g., a top-bar progress loader) to manage the loading state between route transitions.

## Design & Aesthetic Guidelines

1. **Premium Aesthetics:** Use high-contrast text, vibrant primary colors, and soft backgrounds (`#F8FAFC`). Use global variable for all the components design. Everything from colors, fonts, spacing, etc. should be in the global variable. So its get easier to change the design later or maintain the site accuracy.

2. **Borders:** Consistent use of `border` and `border-gray-200` across the application.

3. **Rounded Corners:** Consistent use of `rounded-md` and `rounded-lg` across the application.

4. **Micro-interactions:** Smooth transitions using CSS transitions and Framer Motion for modal entries and hover states.

5. **Data Presentation:** Use striped tables with interactive hover states and descriptive empty states.

6. **Global Styles (`index.css`):** The file `src/index.css` is the single global styling entry point.

---

## Routing & Navigation Architecture

The application uses a **Generator-Based Routing System**. This ensures that the Sidebar, Breadcrumbs, and actual Application Routes are always in sync by deriving them from a single configuration file.

### 1. Configuration Files
- **`AdminRoutes.tsx` / `SupporterRoutes.tsx`**: These files define the structure of the application. Each route can include metadata:
  - `name/label`: For display in menus and breadcrumbs.
  - `icon`: Lucide-react components for the sidebar.
  - `element`: The React component to render.
  - `children`: Nested routes for layouts.

### 2. The Generator Utilities
To keep the UI and logic decoupled, the system uses three generators:
- **Routes Generator**: Converts custom route objects into standard `react-router-dom` objects. It handles the normalization of nested paths.
- **Menu Generator**: Transforms the config into a `MenuItem` array. It automatically filters out "internal-only" routes (routes without labels) so they don't appear in the Sidebar.
- **Breadcrumbs Generator**: Flattens the nested route tree into a key-value map (`path -> { name, icon }`). This allows for $O(1)$ lookup time when rendering breadcrumb trails.

### 3. Security & Layouts
- **RBAC (Role-Based Access Control)**: Routes are wrapped in a `ProtectedRoute` component that validates the user's role against the required permissions stored in Redux.
- **Hierarchical Layouts**: The `DashboardLayout` is applied at the top level of protected groups, ensuring a consistent UI (Sidebar/Navbar) for all authenticated pages.

### 4. How to add a new Route

#### Standard Sidebar Link
1. Navigate to the relevant route config (e.g., `AdminRoutes.tsx`).
2. Add a new object to the `items` array.
3. Define the `path`, `name`, `icon`, and `element`.
4. The Sidebar and Router will update automatically.

#### Dynamic Page (Hidden from Sidebar)
To add a page like "User Details" that should exist in the app but NOT appear in the menu:
1. Locate the parent route in the config (e.g., the `clients` route).
2. Add a child object to the `children` array.
3. Define the `path` using a parameter (e.g., `path: ":id"`) and the `element`.
4. **Do not** provide a `name` or `label`. The generator will automatically exclude it from the sidebar because it lacks a display title.

#### Placeholder / Non-clickable Sidebar Item
There are two ways to add non-link items to the sidebar:
1. **Section Headers**: Wrap your items in a `RouteGroup` and provide a `group` string (e.g., `group: "Support"`). This creates a static text label above those menu items.
2. **Expandable Folders (No Link)**: Define a route with a `name`, `icon`, and `children`, but **omit** the `element` property. The Menu Generator will render this as a clickable dropdown/folder that shows sub-items but doesn't navigate to a page itself.

## Creating New Modules

When adding a new feature (e.g., "Inventory"):

1. Create `src/pages/Admin/Inventory/`.

2. Add the main page component and a `Components/` sub-folder for its sub-sections.

3. Define the route in `src/routes/AdminRoutes.tsx`.

4. If it requires global state, create a slice in `src/store/features`.

5. Use existing UI primitives from `src/components/ui/` to maintain design consistency.