# Pitch Visualizer — From Words to Storyboard

A web app that takes a sales narrative or customer success story and turns it into a multi-panel visual storyboard. Each scene gets an AI-engineered image prompt with lighting, composition, and mood — ready to paste into DALL·E 3, Midjourney, or Stable Diffusion.

Built with React and the Anthropic Claude API.

-----

## What it does

Paste a 3–5 sentence story, pick a visual style, and hit Generate. The app will:

- Break the narrative into 3–5 key scenes
- Write a vivid visual description for each one
- Engineer a detailed image-generation prompt per scene (not just the raw sentence — actual prompts with lighting, camera angle, atmosphere, and style keywords)
- Display everything as an animated storyboard

**Visual styles:** Cinematic, Concept Art, Minimalist, Editorial, Futuristic. Each one changes the UI color palette and the style keywords baked into every generated prompt.

-----

## Setup

### Requirements

- Node.js v18+
- Anthropic API key → [console.anthropic.com](https://console.anthropic.com)

### Running locally

```bash
git clone https://github.com/YOUR_USERNAME/pitch-visualizer.git
cd pitch-visualizer
npm install
```

Create a `.env` file in the root:

```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Then in `src/PitchVisualizer.jsx`, find the `fetch` call to the Anthropic API and add these two headers:

```js
"x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
"anthropic-version": "2023-06-01"
```

Then start the dev server:

```bash
npm run dev
```

> **Important:** Add `.env` to your `.gitignore` and never commit it. For any real deployment, proxy the API calls through a backend (Node/Express, Flask, etc.) so the key is never exposed client-side.

### Running on Claude.ai

The component is built as a Claude Artifact, so it runs natively on claude.ai with zero setup — the API key is handled automatically by the platform.

-----

## How prompt engineering works

This was the main design challenge. A raw sentence like *“their sales cycles stretched to nine months”* makes a terrible image prompt on its own. So instead of passing sentences directly to an image model, I use Claude as an intermediate layer to rewrite each segment into a proper visual scene description.

The process has three steps:

**1. Segmentation** — Claude reads the full narrative and identifies 3–5 story beats based on logical shifts in the plot, rather than just splitting on periods.

**2. Visual translation** — For each beat, Claude describes what a viewer would *actually see* in that frame. Abstract business language gets converted into concrete visual language.

**3. Prompt enrichment** — Each visual description is expanded with lighting descriptors (e.g. *dramatic rim lighting*, *golden hour*), composition notes (*wide establishing shot*, *close-up*), mood words, and the user’s chosen style keywords. Every prompt in a storyboard uses the same style suffix to keep the panels visually consistent.

Example:

> **Original sentence:** *“Their sales cycles stretched to nine months and deals fell through.”*
> 
> **Engineered prompt:** *A weary executive surrounded by towering stacks of conflicting spreadsheets and legacy monitors, dramatic overhead fluorescent lighting, desaturated blue tones, wide-angle establishing shot, mood of exhaustion and stagnation, film noir, photorealistic, cinematic style.*

-----

## Project structure

```
pitch-visualizer/
├── src/
│   └── PitchVisualizer.jsx   # single-file React component
└── README.md
```

-----

## Possible extensions

- Wire up DALL·E 3 or Stability AI to generate actual images inline
- Export storyboard as PDF or PNG
- PowerPoint / Google Slides export

-----

## License

MIT
