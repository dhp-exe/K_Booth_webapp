# ✨ K-Booth Webapp

A modern, interactive Korean-style photobooth web application built with React and Vite. K-Booth brings the fun of photo strips directly to your browser, working seamlessly on both laptops and mobile devices.

![K-Booth Preview](https://img.shields.io/badge/Status-Live-pink)

## 📸 Features

* **Multiple Layouts:** Choose from 3 trendy styles:
    * **2x6" Strip:** Classic vertical photobooth strip (4 photos).
    * **4x6" Vertical:** Standard photo frame with a 2x2 grid.
    * **2x3 Grid:** A 6-photo collage layout.
* **Live Camera:** Real-time webcam feed with a countdown timer (3s) for the perfect pose.
* **Live Preview:** See your photo strip fill up in real-time as you snap pictures.
* **Photo Editing:**
    * **6 Stunning Filters:** Original, Mono, Warm, Cool, Soft, and Vintage.
    * **Custom Frames:** Change the border color (White, Black, Pastel Pink, Sky Blue, Cream, Lilac).
* **Upload Support:** Don't have a webcam? Upload existing photos to create your strip.
* **Instant Download:** Save your creation as a high-quality PNG image.
* **Mobile Responsive:** Optimized UI that works great on phones and desktops.

## 🛠️ Tech Stack

* **Framework:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Image Generation:** [html2canvas](https://html2canvas.hertzen.com/)


## Prerequisites

* Node.js (v16 or higher) installed.

## 📂 Project Structure

```text
src/
├── components/
│   ├── CameraCapture.jsx     # Webcam view 
│   ├── LayoutSelection.jsx   # Initial screen (choose layout)
│   └── PhotoEditor.jsx       # Editing screen 
├── constants/
│   └── config.js             # Configuration (layouts, filters, colors)
├── utils/
│   └── html2canvasLoader.js  # Helper to load image
├── App.jsx                   # Main application logic 
└── index.css                 # Global styles & Tailwind directives