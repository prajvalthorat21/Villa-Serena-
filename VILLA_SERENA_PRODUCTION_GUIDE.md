# VILLA SERENA PRODUCTION GUIDE

**Version:** 1.0  
**Project Type:** Luxury Real Estate Demo Website  
**Purpose:** Portfolio / Client Demonstration

---

## 1. Project Overview

Villa Serena is a premium cinematic real estate website built to demonstrate luxury web design, interactive storytelling, and scroll-driven image sequences.

This is **not** a live property listing.

The project is intended for:
- Claude (development)
- Antigravity (UI generation)
- Future expansion

---

## 2. Project Goal

Create a desktop-first cinematic experience where visitors explore the villa by scrolling through image sequences generated from Google Flow videos.

---

## 3. Current Folder Structure

```text
Villa-Serena-Cinematic-Assets/

├── Brand/
│   └── logo.jpg
│
├── Videos/
│   ├── Hero-Exterior.mp4
│   ├── Living-Room.mp4
│   ├── Kitchen.mp4
│   ├── Master-Bedroom.mp4
│   ├── Bathroom.mp4
│   ├── Pool-Garden.mp4
│   └── Final-Exterior.mp4
│
├── Gallery/
│   ├── Estate-Exterior/
│   ├── Grand-Living/
│   ├── Master-Suite/
│   ├── Pool-Garden/
│   └── Staircase/
│
└── Scroll-Image-Sequence/
    ├── Hero-Exterior/
    ├── Living-Room/
    ├── Kitchen/
    ├── Master-Bedroom/
    ├── Bathroom/
    ├── Pool-Garden/
    └── Final-Exterior/
```

---

## 4. Folder Guide

### Brand
Contains the Villa Serena logo and future branding assets.

Current:
- logo.jpg

Purpose:
- Loader
- Navigation
- Branding

---

### Videos

Contains original Google Flow cinematic videos.

Mapping:
- Hero-Exterior.mp4 → Hero
- Living-Room.mp4 → Grand Living
- Kitchen.mp4 → Kitchen
- Master-Bedroom.mp4 → Master Suite
- Bathroom.mp4 → Bathroom
- Pool-Garden.mp4 → Pool & Garden
- Final-Exterior.mp4 → Ending / CTA

Rules:
- Never swap videos.
- Never rename without updating references.
- Use for frame extraction and continuity.

---

### Gallery

Each gallery folder contains images and one representative video.

Example:

Grand-Living/
- living-01.jpg
- living-02.jpg
- living-03.jpg
- Grand-Living.mp4

Keep every asset inside its matching category.

---

### Scroll-Image-Sequence

Contains numbered JPG frames.

Example:

Hero-Exterior/
- 0001.jpg
- 0002.jpg
- 0003.jpg

Rules:
- Keep numbering.
- Do not rename.
- Do not skip numbers.
- Used only for scroll animation.

---

## 5. Claude Instructions

Claude must:
- Preserve folder structure.
- Preserve architecture.
- Follow section order.
- Use supplied assets only.
- Keep desktop-first design.

Claude must not:
- Swap videos.
- Rename assets.
- Invent rooms.
- Redesign the villa.

---

## 6. Antigravity Instructions

- Build modular components.
- Use scroll image sequences.
- Preserve folder paths.
- Prioritize smooth scrolling.
- Keep assets reusable.

---

## 7. Website Section Order

1. Hero Exterior
2. Living Room
3. Kitchen
4. Master Bedroom
5. Bathroom
6. Pool & Garden
7. Final Exterior
8. Book Private Viewing

---

## 8. Design Principles

- Luxury
- Minimal
- Cinematic
- Editorial typography
- Desktop first
- Smooth animations

---

## 9. Future Scope

Possible future additions:
- Interactive floor plan
- 3D viewer
- Night sequence
- Drone sequence
- Custom cursor

---

## 10. Final Notes

This document is the master guide for Villa Serena.

Any future assets should follow the same folder structure and naming conventions.
