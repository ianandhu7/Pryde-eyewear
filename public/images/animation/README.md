# Frame-by-Frame Animation Folder

Place your sequence of image frames into this folder: `public/images/animation/`

### Supported Naming Formats:
By default, the high-performance Hero Scroll Canvas component expects numbered files such as:
- `frame_001.jpg`, `frame_002.jpg`, ... `frame_120.jpg` (or `.webp` / `.png`)
OR
- `0001.jpg`, `0002.jpg`, ... `0120.jpg`

### Instructions:
1. Copy all frame images from your folder into this `public/images/animation/` directory.
2. In `src/components/home/ScrollAnimationHero.tsx`, customize:
   - `TOTAL_FRAMES`: The total number of frame images you uploaded (e.g. 120, 240, etc.).
   - `FRAME_EXTENSION`: `.jpg`, `.webp`, or `.png`.
   - `FRAME_PREFIX`: `frame_` or empty `""`.
   - `PAD_ZEROES`: Number of digits in zero-padded filenames (e.g. 3 for `frame_001.jpg` or 4 for `frame_0001.jpg`).
