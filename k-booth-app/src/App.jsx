import React, { useState, useRef, useEffect } from 'react';
import { LAYOUTS, FILTERS, FRAME_COLORS } from './constants/config';
import { loadHtml2Canvas } from './utils/html2canvasLoader';
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

  // --- Actions ---

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Horizontal flip for mirror effect
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
    const newPhotos = [...photos, imageUrl];
    setPhotos(newPhotos);

    if (newPhotos.length >= selectedLayout.slots) {
      setTimeout(() => {
        stopCamera();
        setStep('edit');
      }, 500);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remainingSlots = selectedLayout.slots - photos.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos(prev => {
          if (prev.length >= selectedLayout.slots) return prev;
          return [...prev, ev.target.result];
        });
      };
      reader.readAsDataURL(file);
    });
    
    if (photos.length + filesToProcess.length >= selectedLayout.slots) {
       setTimeout(() => {
         stopCamera();
         setStep('edit');
       }, 800);
    }
  };

  const downloadStrip = async () => {
    if (!printRef.current) return;
    setIsDownloading(true);

    try {
      await loadHtml2Canvas();
      const canvas = await window.html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
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