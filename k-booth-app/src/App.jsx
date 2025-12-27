// src/App.jsx
import React, { useState, useRef, useEffect } from 'react';
import { LAYOUTS, FILTERS, FRAME_COLORS } from './constants/config';
import { loadHtml2Canvas } from './utils/html2canvasLoader.js';
import LayoutSelection from './components/LayoutSelection';
import CameraCapture from './components/CameraCapture';
import PhotoEditor from './components/PhotoEditor';

export default function App() {
  // State
  const [step, setStep] = useState('layout'); // layout -> capture -> edit
  const [selectedLayout, setSelectedLayout] = useState(LAYOUTS[0]);
  const [photos, setPhotos] = useState([]);
  const [stream, setStream] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedFrame, setSelectedFrame] = useState(FRAME_COLORS[0]);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // --- NEW: Auto Capture State ---
  const [isAutoMode, setIsAutoMode] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const printRef = useRef(null);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // --- NEW: Auto Capture Logic ---
  // Watch for changes in 'photos'. If in Auto Mode and slots aren't full, trigger next shot.
  useEffect(() => {
    if (isAutoMode && step === 'capture' && photos.length > 0 && photos.length < selectedLayout.slots) {
       // Wait 1.5 seconds so user can see their last shot, then start countdown again
       const timer = setTimeout(() => {
           takePhoto();
       }, 1500);
       return () => clearTimeout(timer);
    }
  }, [photos, isAutoMode, step]);


  // --- Actions ---

  const startCamera = async () => {
    try {
      // UPDATED: Request 1080p (Full HD) or 4K if available
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', 
          width: { ideal: 1920, max: 3840 }, 
          height: { ideal: 1080, max: 2160 } 
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera Error:", err);
      alert("Unable to access camera. Please allow permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleLayoutSelect = (layout) => {
    setSelectedLayout(layout);
    setPhotos([]);
    setStep('capture');
    startCamera();
  };

  const takePhoto = () => {
    if (countdown !== null) return;

    let count = 3;
    setCountdown(count);
    
    const timer = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(timer);
        captureFrame();
        setCountdown(null);
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Standardize Aspect Ratios: Strip = 4:3 (Landscape) | Grid = 2:3 (Portrait)
    const isStrip = selectedLayout.id === 'strip4';
    const targetRatio = isStrip ? 4/3 : 2/3;
    
    // Calculate Crop based on actual video size (now likely 1920x1080)
    const videoRatio = video.videoWidth / video.videoHeight;
    let renderWidth, renderHeight, startX, startY;

    if (videoRatio > targetRatio) {
      renderHeight = video.videoHeight;
      renderWidth = video.videoHeight * targetRatio;
      startX = (video.videoWidth - renderWidth) / 2;
      startY = 0;
    } else {
      renderWidth = video.videoWidth;
      renderHeight = video.videoWidth / targetRatio;
      startX = 0;
      startY = (video.videoHeight - renderHeight) / 2;
    }

    canvas.width = renderWidth;
    canvas.height = renderHeight;
    
    // Draw & Flip
    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    // UPDATED: High quality smoothing settings
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    
    context.drawImage(
      video,
      startX, startY, renderWidth, renderHeight,
      0, 0, canvas.width, canvas.height
    );
    
    // UPDATED: Use PNG (Lossless) instead of JPEG
    const imageUrl = canvas.toDataURL('image/png');
    
    const newPhotos = [...photos, imageUrl];
    setPhotos(newPhotos);

    if (newPhotos.length >= selectedLayout.slots) {
      setTimeout(() => {
        stopCamera();
        setStep('edit');
        setIsAutoMode(false); // Reset auto mode when finished
      }, 500);
    }
  };

  const processUploadedFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // 1. Determine Target Ratio (Same as Camera logic)
          const isStrip = selectedLayout.id === 'strip4';
          const targetRatio = isStrip ? 4/3 : 2/3;

          // 2. Calculate Center Crop
          const imgRatio = img.width / img.height;
          let renderWidth, renderHeight, startX, startY;

          if (imgRatio > targetRatio) {
            // Image is wider than target -> Crop sides
            renderHeight = img.height;
            renderWidth = img.height * targetRatio;
            startX = (img.width - renderWidth) / 2;
            startY = 0;
          } else {
            // Image is taller than target -> Crop top/bottom
            renderWidth = img.width;
            renderHeight = img.width / targetRatio;
            startX = 0;
            startY = (img.height - renderHeight) / 2;
          }

          // 3. Set Canvas Size (Keep original high resolution)
          canvas.width = renderWidth;
          canvas.height = renderHeight;

          // 4. Draw (No Mirroring for Uploads)
          ctx.drawImage(
            img,
            startX, startY, renderWidth, renderHeight,
            0, 0, canvas.width, canvas.height
          );

          resolve(canvas.toDataURL('image/png'));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remainingSlots = selectedLayout.slots - photos.length;
    const filesToProcess = files.slice(0, remainingSlots);

    // Process files one by one to ensure they are cropped
    for (const file of filesToProcess) {
      const processedUrl = await processUploadedFile(file);
      setPhotos(prev => {
        if (prev.length >= selectedLayout.slots) return prev;
        return [...prev, processedUrl];
      });
    }
    
    // Trigger transition to Edit step if full
    // (Using length + count logic to handle the async updates)
    if (photos.length + filesToProcess.length >= selectedLayout.slots) {
       setTimeout(() => {
         stopCamera();
         setStep('edit');
       }, 1000); // Increased timeout slightly to allow processing
    }
  };

  const downloadStrip = async () => {
    if (!printRef.current) return;
    setIsDownloading(true);

    try {
      await loadHtml2Canvas();
      const canvas = await window.html2canvas(printRef.current, {
        scale: 4, // UPDATED: Higher scale for print quality (4x)
        useCORS: true,
        backgroundColor: null,
        onclone: (clonedDoc) => {
          const images = clonedDoc.querySelectorAll('img');
          images.forEach((img) => {
            if (img.style.filter && img.style.filter !== 'none') {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.filter = img.style.filter;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                img.src = canvas.toDataURL('image/png');
                img.style.filter = 'none';
              } catch (err) {
                console.error("Filter apply error", err);
              }
            }
          });
        }
      });
      
      const link = document.createElement('a');
      link.download = `photobooth-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const restart = () => {
    stopCamera();
    setPhotos([]);
    setStep('layout');
    setSelectedFilter(FILTERS[0]);
    setSelectedFrame(FRAME_COLORS[0]);
    setIsAutoMode(false); // Ensure auto mode is off on restart
  };

  const deleteLastPhoto = () => {
    setPhotos(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-pink-100">
      {step === 'layout' && (
        <LayoutSelection 
          layouts={LAYOUTS} 
          onSelect={handleLayoutSelect} 
        />
      )}
      
      {step === 'capture' && (
        <CameraCapture 
          stream={stream}
          videoRef={videoRef}
          canvasRef={canvasRef}
          photos={photos}
          layout={selectedLayout}
          countdown={countdown}
          onTakePhoto={takePhoto}
          onUpload={handleFileUpload}
          onUndo={deleteLastPhoto}
          onBack={restart}
          // --- NEW Props ---
          isAutoMode={isAutoMode}
          setIsAutoMode={setIsAutoMode}
        />
      )}
      
      {step === 'edit' && (
        <PhotoEditor 
          photos={photos}
          layout={selectedLayout}
          printRef={printRef}
          selectedFilter={selectedFilter}
          filters={FILTERS}
          onFilterChange={setSelectedFilter}
          selectedFrame={selectedFrame}
          frames={FRAME_COLORS}
          onFrameChange={setSelectedFrame}
          onDownload={downloadStrip}
          isDownloading={isDownloading}
          onRestart={restart}
        />
      )}
    </div>
  );
}