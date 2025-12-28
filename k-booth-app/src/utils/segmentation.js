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
      // 0 = General (256x256)
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

        ctx.filter = 'blur(4px) brightness(0.7) contrast(250%)';
        
        ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);
        
        ctx.filter = 'none';

        ctx.globalCompositeOperation = "source-in";
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        ctx.restore();
        resolve(canvas.toDataURL("image/png"));
      });

      await segmenter.send({ image: img });
    };
  });
};