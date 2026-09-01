# Precision Teleprompter

A teleprompter that runs in a browser tab. You paste a script, hit play, and the text
scrolls upward at a steady speed while a cue line marks where you should be reading.

**[Try it](https://teleprompter.ltouret.dev/)**

It's a single HTML page with one CSS and one JS file. No build, no dependencies, no
server. Clone it, open `index.html`.

## What it does

The prompter window sits in the middle of the page. Drag its title bar to move it,
pull the bottom-right corner to resize it, so you can park it under a webcam or beside
whatever else is on screen.

Click **Edit** to get a plain textarea, paste your script, click **Prompt** to go back.
Blank lines separate paragraphs. The text isn't saved anywhere — it lives in the page
until you reload.

Playback runs off `requestAnimationFrame` with a `translateY` transform, so scrolling
stays smooth and sub-pixel instead of stepping a line at a time. It stops on its own at
the end of the script. The mouse wheel scrubs the position manually, whether playing
or paused.

Speed is 0–100 (roughly 0–120 px/sec), font size is 20–150px. Text can be white or
yellow, aligned left, center, or right. Black background throughout.

## Keys

| Key | Action |
|---|---|
| Space | Play / pause |
| S | Faster |
| A | Slower |

Keys are ignored while you're typing in the editor.

## Notes

Dragging listens for mouse events only, so the window can't be moved on a touch screen.
Resizing uses the browser's native CSS `resize` handle.

Public domain — see `UNLICENSE`.
