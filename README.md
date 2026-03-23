# Simple Search — Zen Browser Mod

A mod for [Zen Browser](https://www.zen-browser.app/) managed via [Sine](https://github.com/CosmoCreeper/Sine).

Adds a **universal `Shift+Space` keyboard shortcut** that instantly activates tab search across all open tabs and workspaces — no matter what page you're on.

## What it does

Pressing `Shift+Space` anywhere in the browser will:
1. Focus the URL bar
2. Activate Firefox's built-in **tab search mode** (the `%` prefix)
3. Leave the cursor ready for you to type a tab name

This works across **all workspaces simultaneously**, since Zen's tab search via `%` already covers every open tab.

## Installation via Sine

### Option A — Direct GitHub link (recommended for testing)
1. Open Zen Browser settings → **Sine**
2. Click **"Install from URL"** or the external mod option
3. Paste: `https://github.com/manuelcontrera/simple-search`
4. Click Install

### Option B — Sine Marketplace
Search for **"Simple Search"** in the Sine built-in marketplace.

## Configuring the shortcut

After installing, go to **Settings → Sine → Simple Search → Preferences** to customize:

| Option | Default | Description |
|--------|---------|-------------|
| Trigger Key | `Space` (` `) | The main key to press |
| Require Shift | ✅ Yes | Hold Shift |
| Require Ctrl | ❌ No | Hold Ctrl |
| Require Alt | ❌ No | Hold Alt |

Changes apply **immediately** without a browser restart.

## License

MIT
