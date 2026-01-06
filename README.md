# Revena - AI Medical Audit Platform (Prototype)

**Revena** is a next-generation auditing interface designed to automate and streamline the review of medical bills using Artificial Intelligence. This prototype demonstrates the core auditing workflows, real-time AI simulation, and user interaction patterns.

## 🏗 System Architecture

This project is a **Frontend-first simulation**. While it looks and feels like a production app connected to a robust backend, the auditing logic and data persistence are handled entirely on the client-side for demonstration purposes.

### High-Level Design

```mermaid
graph TD
    User[Auditor] -->|Interacts| UI[React UI Layer]
    UI -->|Dispatches Actions| Store[Zustand Audit Store]
    
    subgraph "Core Modules"
        Store -->|Manages| JobQueue[Job Queue & Status]
        Store -->|Manages| Workspace[Audit Workspace State]
        Store -->|Simulates| AIEngine[AI Analysis Engine]
    end
    
    AIEngine -->|Streams Logs| Terminal[Live Log Terminal]
    AIEngine -->|Updates| JobState[Job Status (Queued -> Processing -> Ready)]
    
    Workspace -->|Reads| MockPDF[PDF Viewer]
    Workspace -->|Edits| AuditItems[Detected Items List]
    
    User -->|Exports| XML[XML Report Generator]
```

## 🧩 Core Components

### 1. The Audit Store (`auditStore.ts`)
The "brain" of the application. It uses **Zustand** to manage global state:
*   **Job Lifecycle:** Transitions jobs from `queued` to `processing` to `ready`.
*   **AI Simulation:** Mimics server-side processing delays and emits granular "log" events for the terminal.
*   **Audit Items:** Manages the list of medicines, materials, and procedures detected by the "AI".

### 2. Dashboard & Job Queue
*   **Real-time Monitoring:** Displays active jobs with live status badges.
*   **Batch Upload:** Simulates file uploading handling (`BatchUploadModal`), immediately triggering a new AI simulation cycle.
*   **Auto-Start Onboarding:** Detects first-time visits via `localStorage` to launch a guided tour (`tour.tsx`).

### 3. Audit Workspace
A dual-pane interface optimized for high-velocity auditing:
*   **Source View (Left/Mobile Tab):** Displays the medical record (PDF). In this prototype, we use a mock PDF structure with interactive "Hotspots" that users can click to verify data.
*   **Editor View (Right/Mobile Tab):** Listing of extracted items. Users can:
    *   **Verify Items:** Click "Enter" or hotspots to mark items as checked.
    *   **Edit/Remove:** Modify quantities or prices.
    *   **Keyboard Shortcuts:** Full keyboard control for power users (`↓`, `↑`, `Enter`, `Del`).

### 4. AI Simulation Engine
To create a convincing demo without a backend, we implemented a simulation sequence:
1.  **Context Initialization:** Validates file type.
2.  **Structure Analysis:** "Reads" the PDF pages.
3.  **Entity Extraction:** Identifies items (Medicines, OPMs).
4.  **Rule Validation:** Checks against insurance coverage rules.
*   *Implementation:* Asynchronous `setTimeout` chains that update the store and push log entries.

## 🛠 Tech Stack

*   **Framework:** React 18 + Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + shadcn/ui
*   **State Management:** Zustand
*   **Animations:** Framer Motion + MagicUI (TextAnimate)
*   **Persistence:** LocalStorage (User Preferences & Tour State)
*   **Routing:** React Router DOM (v6)

## 🚀 Key Features

*   **Responsive Design:** Fully adaptive layout. Desktop auditing uses a split-screen; mobile auditing uses a tabbed interface.
*   **Dark Mode Native:** Designed with a "Liquid Glass" dark aesthetic for reduced eye strain during long auditing sessions.
*   **Real Export:** Client-side generation of standard XML audit reports using the internal object state.
*   **Smart Tours:** Context-aware onboarding guides that launch automatically for new users but respect experienced users' settings.

## 📂 Project Structure

```bash
src/
├── components/
│   ├── dashboard/       # Job Queue, Upload Modals
│   ├── workspace/       # Audit Interface, PDF Viewer, Terminal
│   ├── ui/              # Reusable atoms (Buttons, Cards, Badges)
│   └── ...
├── store/
│   └── auditStore.ts    # Central Logic & Simulation Engine
├── lib/                 # Utilities (CN, formatting)
└── App.tsx              # Routing & Global Providers
```
