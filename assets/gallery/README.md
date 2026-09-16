# AarambhX Gallery Assets Folder

Drop your photos and videos into these folders:

```
assets/gallery/
├── photos/        <-- Drop all photos & screenshots here (.png, .jpg, .jpeg, .webp)
└── videos/        <-- Drop short micro-clips & UI demo loops here (.mp4, .webm)
```

---

## 📸 1. Guidelines for Photos
- **Recommended Formats**: `.jpg`, `.jpeg`, `.png`, `.webp`
- **Optimal Resolution**: `1920x1080` (Full HD 16:9) or `1200x800`
- **Naming Tip**: Use lowercase letters with hyphens describing the content:
  - *Examples*:
    - `workshop-iot-esp32-hands-on.jpg`
    - `concert-qr-scanner-gate.jpg`
    - `college-bootcamp-students-coding.png`
    - `vms-visitor-pass-thermal-print.jpg`

---

## 🎥 2. Guidelines for Videos

### A. Short UI Demos & Micro-Clips (< 30 seconds)
- Drop directly into `assets/gallery/videos/`.
- **Formats**: `.mp4` (H.264) or `.webm`
- **File Size**: Try to keep under **5 MB – 10 MB** for instant, stutter-free mobile playback.
- **Audio**: Muted / silent loops work best for background and card showcases.

### B. Long Demos, Event Recaps & Vlogs (> 1 minute)
- Upload to **YouTube** (Public or Unlisted).
- Just share the YouTube URL or Video ID (e.g., `https://youtu.be/xxxxxx`).
- We will lazy-load the YouTube video player inside a sleek glassmorphic modal so it streams in 4K/1080p with zero buffering and zero server lag!

---

## ⚡ What AarambhX Assistant Will Do Once You Add Files:
1. Automatically convert and optimize images to next-gen **WebP** for instant loading.
2. Build responsive picture tags with zero layout shift (CLS < 0.05).
3. Connect the media to your **Work & Gallery Showcases** with full-screen zoom lightbox and category filters.
