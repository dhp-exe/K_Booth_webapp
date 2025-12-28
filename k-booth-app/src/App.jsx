// src/App.jsx
import React, { useState, useRef, useEffect } from 'react';
import { LAYOUTS, FILTERS, FRAME_COLORS } from './constants/config';
// REMOVED: import { loadHtml2Canvas } ...
import LayoutSelection from './components/LayoutSelection';
import CameraCapture from './components/CameraCapture';
import PhotoEditor from './components/PhotoEditor';

export default function App() {
  const [step, setStep] = useState('layout'); 
  const [selectedLayout, setSelectedLayout] = useState(LAYOUTS[0]);
  const [photos, setPhotos] = useState([]);
  const [stream, setStream] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedFrame, setSelectedFrame] = useState(FRAME_COLORS[0]);
  const [isAutoMode, setIsAutoMode] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (isAutoMode && step === 'capture' && photos.length > 0 && photos.length < selectedLayout.slots) {
       const timer = setTimeout(() => {
           takePhoto();
       }, 1500);
       return () => clearTimeout(timer);
    }
  }, [photos, isAutoMode, step]);


  const startCamera = async () => {
    try {
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
    const isStrip = selectedLayout.id === 'strip4';
    const targetRatio = isStrip ? 4/3 : 2/3;
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
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(video, startX, startY, renderWidth, renderHeight, 0, 0, canvas.width, canvas.height);
    const imageUrl = canvas.toDataURL('image/png');
    const newPhotos = [...photos, imageUrl];
    setPhotos(newPhotos);
    if (newPhotos.length >= selectedLayout.slots) {
      setTimeout(() => {
        stopCamera();
        setStep('edit');
        setIsAutoMode(false); 
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
          const isStrip = selectedLayout.id === 'strip4';
          const targetRatio = isStrip ? 4/3 : 2/3;
          const imgRatio = img.width / img.height;
          let renderWidth, renderHeight, startX, startY;
          if (imgRatio > targetRatio) {
            renderHeight = img.height;
            renderWidth = img.height * targetRatio;
            startX = (img.width - renderWidth) / 2;
            startY = 0;
          } else {
            renderWidth = img.width;
            renderHeight = img.width / targetRatio;
            startX = 0;
            startY = (img.height - renderHeight) / 2;
          }
          canvas.width = renderWidth;
          canvas.height = renderHeight;
          ctx.drawImage(img, startX, startY, renderWidth, renderHeight, 0, 0, canvas.width, canvas.height);
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
    for (const file of filesToProcess) {
      const processedUrl = await processUploadedFile(file);
      setPhotos(prev => {
        if (prev.length >= selectedLayout.slots) return prev;
        return [...prev, processedUrl];
      });
    }
    if (photos.length + filesToProcess.length >= selectedLayout.slots) {
       setTimeout(() => {
         stopCamera();
         setStep('edit');
       }, 1000);
    }
  };

  const restart = () => {
    stopCamera();
    setPhotos([]);
    setStep('layout');
    setSelectedFilter(FILTERS[0]);
    setSelectedFrame(FRAME_COLORS[0]);
    setIsAutoMode(false); 
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
          isAutoMode={isAutoMode}
          setIsAutoMode={setIsAutoMode}
        />
      )}
      
      {step === 'edit' && (
        <PhotoEditor 
          photos={photos}
          layout={selectedLayout}
          selectedFilter={selectedFilter}
          filters={FILTERS}
          onFilterChange={setSelectedFilter}
          selectedFrame={selectedFrame}
          frames={FRAME_COLORS}
          onFrameChange={setSelectedFrame}

          onRestart={restart}
        />
      )}
    </div>
  );
}