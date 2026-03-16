# InvestiGrapher — OSINT Graph Visualizer

An interactive graph-based OSINT (Open Source Intelligence) tool for visualizing relationships between entities such as people, transactions, accounts, phone numbers, emails, and national IDs. Built with React Flow, it features a modular **Transforms** system that runs API-backed searches from Supabase and appends results as child nodes in real time.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
  - [Building for Production](#building-for-production)
- [Usage Guide](#usage-guide)
  - [Adding Entities](#adding-entities)
  - [Editing Entities](#editing-entities)
  - [Connecting Nodes](#connecting-nodes)
  - [Deleting Nodes & Edges](#deleting-nodes--edges)
  - [Running Transforms](#running-transforms)
  - [Hover Tooltips](#hover-tooltips)
- [Architecture](#architecture)
  - [Entity Types](#entity-types)
  - [Transforms System](#transforms-system)
  - [Supabase Service](#supabase-service)
- [Adding a New Entity Type](#adding-a-new-entity-type)
- [Adding a New Transform](#adding-a-new-transform)
- [Configuration Reference](#configuration-reference)

---

## Features

| Feature | Description |
|---|---|
| **Interactive Graph** | Drag, pan, zoom, and connect nodes on an infinite canvas |
| **7 OSINT Entity Types** | Person, Transaction, Account, Name, Phone, National ID, Email |
| **Transforms** | Run API-backed searches directly from nodes (Search Person, Search Transactions) |
| **Context Menus** | Right-click nodes for edit/delete/add-child/transforms; right-click canvas to add standalone entities |
| **Edit Modal** | Double-click or use context menu to edit entity attributes |
| **Smart Tooltips** | Hover to see only non-empty attributes with truncation for long values |
| **Delete Actions** | Delete single entity, delete all descendants (recursive), or delete all with confirmation |
| **Custom Edges** | Animated, colored edges with manual edge creation via handles |
| **Dark Theme** | Glassmorphism design with Font Awesome icons |
| **Keyboard Shortcuts** | Backspace/Delete to remove selected nodes or edges |
| **MiniMap & Controls** | Built-in zoom controls and minimap for navigation |
| **Empty Start** | Canvas starts blank with a hint — no predefined nodes |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev) | UI framework |
| [Vite 8](https://vite.dev) | Build tool & dev server |
| [@xyflow/react 12](https://reactflow.dev) | Graph/flow visualization |
| [Font Awesome 7](https://fontawesome.com) | Entity icons |
| [Supabase REST API](https://supabase.com) | Backend data source |

---

## Project Structure

```
Grapher/
├── .env                         # Supabase credentials (gitignored)
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                 # App entry point
    ├── App.jsx                  # Main component — graph state, handlers, layout
    ├── App.css                  # Global styles (delete btn, loading overlay, empty hint)
    ├── index.css                # Dark theme, React Flow control overrides
    │
    ├── config/
    │   ├── entityTypes.json     # Entity type definitions (schema, icons, colors)
    │   └── transforms.json      # Transform definitions (input/output mapping)
    │
    ├── nodes/
    │   ├── EntityNode.jsx       # Custom React Flow node component
    │   ├── NodeStyles.css       # Node, tooltip, and hover styles
    │   ├── CircleNode.jsx       # Legacy circle node (unused)
    │   └── RectangleNode.jsx    # Legacy rectangle node (unused)
    │
    ├── components/
    │   ├── ContextMenu.jsx      # Right-click context menu (node & canvas)
    │   ├── ContextMenu.css
    │   ├── EditModal.jsx        # Edit entity attributes modal
    │   ├── EditModal.css
    │   ├── ConfirmDialog.jsx    # Delete-all confirmation dialog
    │   └── ConfirmDialog.css
    │
    ├── services/
    │   └── supabase.js          # Supabase REST client (reads from .env)
    │
    └── transforms/
        ├── index.js             # Transform registry (maps names → functions)
        ├── searchPerson.js      # Search Person transform
        └── searchTransactions.js # Search Transactions transform
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Supabase** project with `person`, `accounts`, `transactions`, and `banks` tables

### Installation

```bash
# Clone the repository
git clone https://github.com/AhmadMuawya/InvestiGrapher.git
cd InvestiGrapher/Grapher

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** The `VITE_` prefix is required for Vite to expose these variables to the client via `import.meta.env`.

### Running the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
npm run preview   # Preview the production build locally
```

---

## Usage Guide

### Adding Entities

1. **Right-click on the canvas** → a menu appears with all 7 entity types.
2. Click on any entity type (e.g., Person, Name, Phone) to place it on the canvas.
3. **Right-click on an existing node** → under "Add Child Node", select any entity type.
   - The child node is connected to the parent with an animated edge.
   - Multiple children are spread horizontally to avoid overlap.

### Editing Entities

- **Double-click** any node to open the edit modal.
- Or **right-click** → **Edit Entity** from the context menu.
- Modify the label and attribute fields, then click **Save**.
- For entities with `first_name` and `last_name`, the node label auto-updates to `"First Last"`.

### Connecting Nodes

- Drag from a node's **bottom handle** (source) to another node's **top handle** (target) to create a custom edge.
- All edges share consistent animated styling.

### Deleting Nodes & Edges

| Action | How |
|---|---|
| **Delete selected** | Select a node or edge, press **Backspace** or **Delete** |
| **Delete entity** | Right-click node → **Delete Entity** |
| **Delete all descendants** | Right-click node → **Delete All Descendants** (removes all children and their children recursively, keeps the parent) |
| **Delete all** | Click the 🗑️ trash button in the bottom-left → confirm in dialog |

### Running Transforms

1. **Right-click a node** — if transforms are available for that entity type, a **Transforms** section appears at the bottom of the context menu.
2. Click a transform (e.g., "Search Person") — a loading spinner shows while the API call runs.
3. Results are appended as **child nodes**, each populated with the API response data.

**Available transforms:**

| Transform | Input Entities | Output Entity | Description |
|---|---|---|---|
| **Search Person** | Name, Phone, National ID, Email | Person | Searches the `person` table. Uses AND for first+last name, exact match for ID/phone/email |
| **Search Transactions** | Person, Phone, National ID | Transaction | Finds linked accounts, fetches transactions above threshold, enriches with sender/receiver info |

### Hover Tooltips

- Hover over any node to see a compact tooltip showing **only non-empty attributes**.
- Long attribute values are **truncated with `...`** to prevent overflow.
- The tooltip automatically flips **above or below** the node depending on screen position.

---

## Architecture

### Entity Types

Defined in `src/config/entityTypes.json`. Each entity type has:

| Field | Type | Description |
|---|---|---|
| `id` | `number` | Unique numeric ID (used by transforms for input/output matching) |
| `name` | `string` | Display name |
| `icon` | `string` | Font Awesome class (e.g., `"fa-solid fa-user"`) |
| `color` | `string` | Hex color for borders, edges, and icons |
| `searchKey` | `string` | Primary attribute used as the default label/search field |
| `attributes` | `object` | Key-value pairs defining the entity's data schema (values start as `""`) |

**Current entity types:**

| ID | Key | Name | Icon | Color |
|---|---|---|---|---|
| 1 | `person` | Person | 👤 `fa-user` | `#6366f1` |
| 2 | `transaction` | Transaction | 💸 `fa-money-bill-transfer` | `#10b981` |
| 3 | `account` | Account | 🏦 `fa-building-columns` | `#14b8a6` |
| 4 | `name` | Name | 🪪 `fa-id-badge` | `#f59e0b` |
| 5 | `phone` | Phone | 📞 `fa-phone` | `#0ea5e9` |
| 6 | `national_id` | National ID | 🪪 `fa-id-card` | `#f43f5e` |
| 7 | `email` | Email | ✉️ `fa-envelope` | `#8b5cf6` |

### Transforms System

The transforms architecture is fully **decoupled** — JSON config drives the UI, the registry maps function names to implementations, and each transform is a standalone async module.

```
transforms.json          →  ContextMenu (UI)
     ↓                            ↓
Transform Registry        →  App.jsx (execution)
     ↓
Transform Functions       →  Supabase Service (API)
```

**`transforms.json` fields:**

| Field | Type | Description |
|---|---|---|
| `id` | `number` | Unique transform ID |
| `name` | `string` | Display name in the context menu |
| `icon` | `string` | Font Awesome icon class |
| `functionName` | `string` | Key in the transform registry (maps to the JS function) |
| `inputEntityIds` | `number[]` | Array of entity type IDs that can use this transform |
| `outputEntityId` | `number` | The entity type ID of the output nodes |

### Supabase Service

`src/services/supabase.js` provides:
- **`BASE_URL`** — constructed from `VITE_SUPABASE_PROJECT_ID`
- **`HEADERS`** — includes `apikey` and `Authorization` from `VITE_SUPABASE_ANON_KEY`
- **`supabaseGet(url)`** — generic GET helper with 10s timeout, returns `[]` on error

---

## Adding a New Entity Type

1. Open `src/config/entityTypes.json`
2. Add a new entry:

```json
"my_entity": {
  "id": 8,
  "name": "My Entity",
  "icon": "fa-solid fa-star",
  "color": "#ec4899",
  "searchKey": "primary_field",
  "attributes": {
    "primary_field": "",
    "other_field": ""
  }
}
```

3. The new entity automatically appears in all context menus (add child, add standalone).

---

## Adding a New Transform

1. **Create the transform function** in `src/transforms/`:

```javascript
// src/transforms/searchMyData.js
import { BASE_URL, supabaseGet } from '../services/supabase';

export default async function searchMyData(attributes) {
  const value = (attributes.primary_field || '').trim();
  if (!value) return [];
  
  const url = `${BASE_URL}/my_table?select=*&primary_field=eq.${encodeURIComponent(value)}`;
  return supabaseGet(url);
}
```

2. **Register it** in `src/transforms/index.js`:

```javascript
import searchMyData from './searchMyData';

const registry = {
  searchPerson,
  searchTransactions,
  searchMyData,  // ← add here
};
```

3. **Add the config** in `src/config/transforms.json`:

```json
{
  "id": 3,
  "name": "Search My Data",
  "icon": "fa-solid fa-star",
  "functionName": "searchMyData",
  "inputEntityIds": [8],
  "outputEntityId": 8
}
```

4. The transform automatically appears in the context menu for entities with matching `inputEntityIds`.

---

## Configuration Reference

| File | Purpose |
|---|---|
| `.env` | Supabase project ID and anon key |
| `src/config/entityTypes.json` | Entity type definitions (schema, icons, colors, IDs) |
| `src/config/transforms.json` | Transform definitions (input/output entity mapping, function names) |
| `src/transforms/index.js` | Registry mapping `functionName` strings to JS modules |

---

## License

MIT
