# Vertical3DTech

An interactive 3D canopy configurator built with React, TypeScript, Vite, Redux Toolkit, and Three.js. Customize canopy colors, graphics, walls, frames, and accessories, then preview the result in 3D.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

1. Clone the repository and open its directory:

   ```sh
   git clone https://github.com/dileepmaurya800/Vertical3DTech.git
   cd Vertical3DTech
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

   Open the local URL printed by Vite (by default, `http://localhost:3000`).

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Vite development server |
| `npm run build` | Type-check the project and create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## Deploy to Vercel

Import the GitHub repository into Vercel. The project includes `vercel.json` with the production build command and `dist` output directory. The regenerated `package-lock.json` also resolves optional dependencies that previously caused npm 12 to fail during Vercel's install step; keep the lockfile committed when deploying.
