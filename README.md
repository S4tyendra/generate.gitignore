# generate.gitignore

A modern, fast, and user-friendly tool to generate `.gitignore` files for your projects. Built with performance and developer experience in mind, utilizing Cloudflare Workers for the backend and a React-based frontend.

## 🚀 Tech Stack

**Frontend:**
* **Framework:** [React](https://react.dev/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
* **Runtime/Package Manager:** [Bun](https://bun.sh/)

**Backend:**
* **Serverless Platform:** [Cloudflare Workers](https://workers.cloudflare.com/)
* **Configuration:** `wrangler`

## 📂 Project Structure

```bash
├── gitignore-frontend/   # React frontend application
│   ├── src/
│   │   ├── components/ui/ # shadcn/ui components
│   │   ├── App.jsx        # Main application logic
│   │   └── ...
│   └── vite.config.js
├── src/                  # Cloudflare Worker backend
│   ├── worker.js         # Main worker entry point
│   ├── gitignorefiles.js # Data/Logic for gitignore templates
│   └── repo-ex.sh        # Utility script
├── wrangler.toml         # Cloudflare Worker configuration
└── bun.lock              # Lockfile for dependencies
````

## 🛠️ Getting Started

### Prerequisites

  * [Bun](https://bun.sh/) (v1.0 or higher)
  * [Node.js](https://nodejs.org/) (optional, if you prefer npm/yarn, but Bun is recommended)

### 1\. Backend Setup (Cloudflare Worker)

The backend handles the logic for fetching and serving gitignore templates.

1.  Navigate to the root directory:

    ```bash
    cd generate.gitignore
    ```

2.  Install dependencies:

    ```bash
    bun install
    ```

3.  Start the development server:

    ```bash
    bun run dev
    # OR using wrangler directly
    bunx wrangler dev
    ```

    The worker will typically start on `http://localhost:8787`.

### 2\. Frontend Setup

The frontend is a Vite-powered React app located in the `gitignore-frontend` directory.

1.  Navigate to the frontend directory:

    ```bash
    cd gitignore-frontend
    ```

2.  Install dependencies:

    ```bash
    bun install
    ```

3.  Start the development server:

    ```bash
    bun run dev
    ```

    The application will run on `http://localhost:5173` (by default).

## 🚀 Deployment

### Backend (Cloudflare Workers)

To deploy the worker to your Cloudflare account:

```bash
# In the root directory
bunx wrangler deploy
```

### Frontend (Cloudflare Pages / Vercel / Netlify)

1.  Build the frontend:

    ```bash
    cd gitignore-frontend
    bun run build
    ```

2.  The output will be in `gitignore-frontend/dist`. You can deploy this folder to any static hosting service.

    **For Cloudflare Pages:**

      * Connect your repository to Cloudflare Pages.
      * Set the **Build command** to: `bun run build` (or `npm run build` if using npm).
      * Set the **Build output directory** to: `gitignore-frontend/dist`.
      * **Root directory**: `gitignore-frontend`

## ✨ Features

  * **Search & Generate**: Quickly find `.gitignore` templates for languages, frameworks, and operating systems.
  * **Preview**: View the content of the file before downloading.
  * **Modern UI**: Clean and responsive interface built with Shadcn UI and Tailwind CSS.
  * **Fast**: Powered by Cloudflare Edge Network.
