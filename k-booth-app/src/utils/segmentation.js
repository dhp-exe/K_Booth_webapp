// src/utils/segmentation.js
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

let segmenter = null;

const initSegmenter = () => {
  if (segmenter) return Promise.resolve(segmenter);

  return new Promise((resolve) => {
    const s = new SelfieSegmentation({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });

    s.setOptions({
      // 0 = General (256x256) - Better edges, especially for hair
      modelSelection: 0, 
    });

    s.onResults(() => {});
    segmenter = s;
    resolve(segmenter);
  });
};

export const removeBackground = async (imageSrc) => {
  const segmenter = await initSegmenter();

  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "Anonymous";

    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");

      segmenter.onResults((results) => {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- STEP 1: Draw the Mask with Erosion ---
        // 1. blur(4px): Softens the pixelated edges of the raw mask.
        // 2. brightness(0.7): Darkens the mask (shrinking the white area). 
        //    This effectively pulls the edge INWARDS, hiding the background halo.
        // 3. contrast(250%): Re-sharpens the edge so it isn't too blurry, 
        //    but keeps the "shrunken" boundary.
        ctx.filter = 'blur(4px) brightness(0.7) contrast(250%)';
        
        ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);
        
        // Reset filter for the actual image drawing
        ctx.filter = 'none';

        // --- STEP 2: Composite the Person ---
        // 'source-in' keeps the image only where the mask (drawn above) exists
        ctx.globalCompositeOperation = "source-in";
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        ctx.restore();
        resolve(canvas.toDataURL("image/png"));
      });

      await segmenter.send({ image: img });
    };
  });
};