```markdown
# ArchiTech: Frontend Development Prompt & Architecture Guide
**Target Role:** Top-notch Software Development Engineer & UI/UX Designer  
**Core Reference Standards:** AWS Builder Center Design Language (`DESIGN.md`) & ArchiTech SRS (`WORLDCRAFT_README_ALIGNED.md`)  
**Objective:** Build a professional, compact, and high-performance React/Next.js/TypeScript frontend for **ArchiTech**, leaving clean hooks, decoupled state containers, and clear API boundaries for backend, AI inference (Python/FastAPI), and 3D rendering (Three.js/React Three Fiber) integration.

---

## 1. Global Design System & Styling Rules (Extracted from AWS Builder Center)

To maintain absolute visual and functional parity with the AWS Builder Center design language, adhere strictly to these tokenized values:

*   **Color Palette:**
    *   `--bg-primary` (`#16191f`): Primary dark theme background for headers, toolbars, and primary containers.
    *   `--bg-surface` (`#ffffff`): Card surfaces, modal backgrounds, and high-contrast element backgrounds.
    *   `--text-primary` (`#16191f` on light, `#ffffff` on dark): High-legibility typography.
    *   `--text-secondary` (`#687078`): Subtitles, metadata, and inactive states.
    *   `--brand-secondary` (`#ff9900`): Accent highlights, primary interactive triggers, active states.
    *   `--brand-accent` (`#7300e5`): Secondary interactive highlights and badges.
    *   `--neutral-border` (`#eaeded` / `#232b37`): Clean separation lines and borders.
*   **Typography:**
    *   **Font Family:** `Amazon Ember`, system-ui, sans-serif (`AmazonEmberDuospace_Rg` for code/coordinates).
    *   **Type Scale:** Headings (`h1`: 40px/48px, `h2`: 24px/22px, `h3`: 16px/24px), Body (`14px` regular, `16px` lead).
*   **Spacing & Layout:**
    *   Base Unit: `2px` scale (use multipliers: 8px, 12px, 16px, 24px, 32px).
    *   Border Radius: `sm` (`4px`) for cards, buttons, and panels; `0px` for raw layout grids matching AWS enterprise patterns.
*   **Elevations & Shadows:**
    *   `box-shadow: rgba(0, 7, 22, 0.1) 0px 4px 20px 1px;` (Standard card elevation).

---

## 2. Multi-Page Architecture & Component Blueprint


```

src/
├── components/
│   ├── common/             # Reusable design system atoms (Button, Card, Input, Modal, Badge)
│   ├── navigation/         # Navbar, Breadcrumbs, Status indicators
│   ├── landing/            # Page 1: Hero, 3D Preview Canvas, 3-Card Feature breakdown
│   ├── workspace/          # Page 2: Main 3D Canvas, Upload Panel, Floating Prompt Bar, History Panel
│   └── renovation/         # Page 3: Product Explorer, Budget Filters, Comparison Grid
├── hooks/                  # Custom state hooks for API/Backend integration points
├── types/                  # TypeScript definitions matching the Scene Schema
└── services/               # API client stubs (Backend connection boundaries)

```

---

## 3. Page-by-Page Technical Specifications & Integration Hooks

### Page 1: Landing Page
*   **Visual Style:** Full-viewport immersive dark theme (`#16191f`). Clean Google Sans-like typography (`Amazon Ember`).
*   **Hero Section:** 
    *   Prominent title: **ArchiTech** (AI-Powered Spatial Intelligence & 3D Interior Design).
    *   Embedding a lightweight rotating room interior container (placeholder for Three.js canvas or interactive model view).
*   **How It Works Cards:** Exactly 3 compact, informative cards sourced directly from the README (`WORLDCRAFT_README_ALIGNED.md`):
    1. *Visual Reconstruction:* Convert 2D photos, floor plans, or short videos into editable 3D environments.
    2. *Spatial Intelligence:* Automatic object detection, constraint validation, and collision checking.
    3. *Natural-Language & Voice Editing:* Modify wall colors, replace furniture, and iterate via speech or text commands.
*   **Primary Action:** A prominent primary button (`background: #ff9900` or crisp white border variant) reading **"Visualize Space"**, routing to Page 2.

---

### Page 2: ArchiTech Visualization Workspace (The Core Experience)
*   **Navigation Bar:** Clean top bar housing items: `Home`, `About`, `Settings`, `Menu`, with user session status.
*   **Layout Grid:** CSS Grid (`280px` left panel | `1fr` center 3D viewport | `330px` right history panel).
*   **Center Workspace (3D Viewport):**
    *   *Empty State:* Clean helper message directing users to upload references or type a prompt.
    *   *Active State:* React Three Fiber / Three.js canvas container. Supports rotation, zoom, object selection, and manual manipulation.
*   **Left Panel (Upload References):**
    *   Input constraints clearly enforced: Images (Max 2), Video (Max 1, Max duration 10s).
    *   *Backend Integration Hook:* `onUploadFiles(files: FileList)` -> dispatches multipart form-data to FastAPI backend.
*   **Bottom Floating Prompt Bar:**
    *   Supports Text input + Voice toggle button.
    *   *Backend Integration Hook:* `onSubmitPrompt(promptText: string, inputMethod: 'text' | 'voice')` -> sends instruction payload to LLM/Scene Engine.
*   **Right Panel (Versions & Process History):**
    *   Displays Version History (Version 1, Version 2, etc.) and Process Status log.
    *   *Backend Integration Hook:* `onSelectVersion(versionId: string)` & `onRevertToOriginal()` to restore previous scene states without overwriting history.

---

### Page 3: Furniture, Products and Renovation
*   **User Flow Integration:**
    *   *Step 1:* User selects an object in the 3D model (e.g., Sofa, Light Fixture) or browses options.
    *   *Step 2:* Compact product comparison layout displaying product name, company, price, and category.
    *   *Step 3:* Budget filtering sidebar (Min/Max price sliders, categories, style, dimensions, materials).
    *   *Step 4:* Action triggers: **"View details"** or **"Try in model"**.
*   *Backend Integration Hook:* `fetchProducts(filters: FilterCriteria)` and `applyProductToScene(productId: string, targetObjectId: string)`.

---

## 4. Code Stub Templates for Frontend Developers

### A. TypeScript Scene Schema Definition (`src/types/scene.ts`)
```typescript
export interface SceneObject {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  rotation: { x: number; y: number; z: number };
  movable: boolean;
  confidence?: number | null;
}

export interface ArchiTechScene {
  scene_id: string;
  units: string;
  room: {
    type: string;
    dimensions: { width: number; length: number; height: number; status: string };
  };
  objects: SceneObject[];
  constraints: Array<{ type: string; target: string }>;
}

```

### B. Backend API Service Connector Stub (`src/services/api.ts`)

```typescript
import { ArchiTechScene } from '../types/scene';

// FastAPI Backend Connection Boundary
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const ArchiTechService = {
  async uploadReferences(formData: FormData): Promise<{ scene_id: string; status: string }> {
    // TODO: Connect to Python/FastAPI backend endpoint /api/reconstruct
    const response = await fetch(`${API_BASE_URL}/reconstruct`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Reconstruction failed');
    return response.json();
  },

  async submitEditPrompt(sceneId: string, prompt: string): Promise<ArchiTechScene> {
    // TODO: Connect to LLM Natural-Language Interpretation endpoint /api/edit
    const response = await fetch(`${API_BASE_URL}/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scene_id: sceneId, instruction: prompt }),
    });
    if (!response.json) throw new Error('Edit processing failed');
    return response.json();
  }
};

```

### C. Workspace Component Shell (`src/components/workspace/WorkspaceView.tsx`)

```tsx
'use client';
import React, { useState } from 'react';
import { ArchiTechScene } from '../../types/scene';

export default function WorkspaceView() {
  const [sceneData, setSceneData] = useState<ArchiTechScene null |>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      // Integration hook ready for FastAPI backend service
      // const updatedScene = await ArchiTechService.submitEditPrompt(sceneData?.scene_id || '', prompt);
      // setSceneData(updatedScene);
    } catch (error) {
      console.error("Error executing prompt:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-[280px_1fr_330px] h-screen bg-[#16191f] text-white">
      {/* Left Panel: Upload References */}
      <aside className="border-r border-[#232b37] p-4 flex flex-col gap-4">
        <h2 className="text-[18px] font-bold">Upload References</h2>
        <div className="border border-dashed border-[#687078] p-4 text-center rounded-[4px]">
          <p className="text-[14px] text-[#687078]">Drop images (max 2) or video (max 10s)</p>
        </div>
      </aside>

      {/* Center 3D Working Area */}
      <main className="relative flex flex-col items-center justify-center p-6">
        {!sceneData ? (
          <div className="text-center">
            <h1 className="text-[24px] font-bold mb-2">Workspace Empty</h1>
            <p className="text-[14px] text-[#687078]">Upload references or type a prompt below to generate your 3D model.</p>
          </div>
        ) : (
          <div className="w-full h-full bg-[#0f141a] rounded-[4px] flex items-center justify-center">
            {/* Three.js / R3F Canvas Mount Point */}
            <span className="text-[#ff9900]">3D Viewport Active (Scene Loaded)</span>
          </div>
        )}

        {/* Bottom Floating Prompt Bar */}
        <form onSubmit={handlePromptSubmit} className="absolute bottom-6 w-3/4 max-w-[700px] bg-[#232b37] border border-[#687078] rounded-[4px] p-2 flex items-center gap-2 shadow-lg">
          <input 
            type="text" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe changes (e.g., 'Move the sofa against the left wall')..."
            className="flex-1 bg-transparent border-none text-white px-2 focus:outline-none text-[16px]"
          />
          <button type="button" className="p-2 text-[#687078] hover:text-white" title="Voice Input">
            🎙️
          </button>
          <button type="submit" className="bg-[#ff9900] text-[#16191f] px-4 py-1.5 rounded-[4px] font-medium text-[16px]">
            {loading ? 'Processing...' : 'Generate'}
          </button>
        </form>
      </main>

      {/* Right Panel: Versions & History */}
      <aside className="border-l border-[#232b37] p-4 flex flex-col gap-4">
        <h2 className="text-[18px] font-bold">Versions & History</h2>
        <div className="flex flex-col gap-2">
          <div className="p-3 bg-[#232b37] rounded-[4px] border border-[#ff9900]">
            <span className="text-[14px] font-bold">Version 1 (Current)</span>
            <p className="text-[12px] text-[#687078]">Initial generated room</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

```

---

## 5. Summary Checklist for Frontend Execution

1. **Design Compliance:** Apply `--bg-primary` (`#16191f`), `--brand-secondary` (`#ff9900`), and Amazon Ember typography everywhere.
2. **Modular Components:** Keep UI panels isolated so they can seamlessly consume upcoming API responses.
3. **Decoupled State:** Store scene state in React context or a lightweight store to support undo/redo and version switching effortlessly.

```

```