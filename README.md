# Precision Teleprompter

A web-based teleprompter with a draggable/resizable viewport and high-performance scroll logic.

## Features

- **Smooth scrolling** — `requestAnimationFrame` + `transform: translateY()` for hardware-accelerated, sub-pixel motion
- **Draggable & resizable** viewport with boundary clamping
- **Keyboard controls** — Space (play/pause), S (speed up), A (slow down)
- **Edit / Prompt modes** — toggle between writing and reading
- **Visual cue line** — fixed reading guide at the center of the viewport
- **Customizable** — font size (20–150px), text color (white/yellow), text alignment (left/center/right)
- **High-contrast theme** — black background with high-visibility text

## Usage

Open `teleprompter.html` in a browser. No build step or dependencies required.
