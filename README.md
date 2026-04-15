<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/22d1140f-df4a-4f56-99ea-82067fe8eced

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Deploy (Preview / Production)

This project already includes deployment config for both Vercel (`vercel.json`) and Netlify (`netlify.toml`).

### Option A: Vercel (Recommended)
1. Push this repo to GitHub.
2. In Vercel, click **Add New Project** and import the repo.
3. Build settings are auto-detected (`npm run build`, output `dist`).
4. Deploy and get your public URL.

### Option B: Netlify
1. Push this repo to GitHub.
2. In Netlify, click **Add new site > Import an existing project**.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Deploy and get your public URL.
