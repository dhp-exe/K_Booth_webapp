// src/utils/filterUtils.js

/**
 * Matrix Multiplication Helper
 * Multiplies two 4x5 matrices (handling RGBA + Offset)
 * We use a simplified array [ R, G, B, A, Offset ] structure for performance.
 * But for CSS filters (which mostly affect RGB), a 5x5 matrix flattened is standard.
 * * Matrix structure (row-major):
 * [ r1 r2 r3 r4 r5 ]
 * [ g1 g2 g3 g4 g5 ]
 * [ b1 b2 b3 b4 b5 ]
 * [ a1 a2 a3 a4 a5 ]
 */
const multiplyMatrices = (m1, m2) => {
    const result = new Float32Array(20); // 4 rows x 5 cols
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        let sum = 0;
        // Inner product of row from m1 and col from m2
        for (let k = 0; k < 4; k++) {
          sum += m1[row * 5 + k] * m2[k * 5 + col];
        }
        // Add the offset component from m1 if we are computing the offset column
        if (col === 4) {
          sum += m1[row * 5 + 4];
        }
        result[row * 5 + col] = sum;
      }
    }
    return result;
  };
  
  const IDENTITY_MATRIX = new Float32Array([
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0
  ]);
  
  /**
   * Filter Generators (W3C Spec Compliant)
   */
  
  const getBrightnessMatrix = (v) => new Float32Array([
    v, 0, 0, 0, 0,
    0, v, 0, 0, 0,
    0, 0, v, 0, 0,
    0, 0, 0, 1, 0
  ]);
  
  const getContrastMatrix = (v) => {
    const intercept = 128 * (1 - v); // 128 is 0.5 in 0-255 space
    return new Float32Array([
      v, 0, 0, 0, intercept,
      0, v, 0, 0, intercept,
      0, 0, v, 0, intercept,
      0, 0, 0, 1, 0
    ]);
  };
  
  const getGrayscaleMatrix = (v) => {
    // Standard Luma coefficients: 0.2126 R, 0.7152 G, 0.0722 B
    // v = 1 means fully gray. v = 0 means identity.
    const r = 0.2126, g = 0.7152, b = 0.0722;
    return new Float32Array([
      (1-v) + v*r, v*g,       v*b,       0, 0,
      v*r,       (1-v) + v*g, v*b,       0, 0,
      v*r,       v*g,       (1-v) + v*b, 0, 0,
      0,         0,         0,         1, 0
    ]);
  };
  
  const getSepiaMatrix = (v) => new Float32Array([
    (1 - v) + v * 0.393, v * 0.769, v * 0.189, 0, 0,
    v * 0.349, (1 - v) + v * 0.686, v * 0.168, 0, 0,
    v * 0.272, v * 0.534, (1 - v) + v * 0.131, 0, 0,
    0, 0, 0, 1, 0
  ]);
  
  const getSaturateMatrix = (v) => {
    const r = 0.2126, g = 0.7152, b = 0.0722;
    return new Float32Array([
      r * (1 - v) + v, g * (1 - v),     b * (1 - v),     0, 0,
      r * (1 - v),     g * (1 - v) + v, b * (1 - v),     0, 0,
      r * (1 - v),     g * (1 - v),     b * (1 - v) + v, 0, 0,
      0,               0,               0,               1, 0
    ]);
  };
  
  const getHueRotateMatrix = (deg) => {
    const rad = (deg * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return new Float32Array([
      0.213 + 0.787*c - 0.213*s,  0.715 - 0.715*c - 0.715*s,  0.072 - 0.072*c + 0.928*s,  0, 0,
      0.213 - 0.213*c + 0.143*s,  0.715 + 0.285*c + 0.140*s,  0.072 - 0.072*c - 0.283*s,  0, 0,
      0.213 - 0.213*c - 0.787*s,  0.715 - 0.715*c + 0.715*s,  0.072 + 0.928*c + 0.072*s,  0, 0,
      0, 0, 0, 1, 0
    ]);
  };
  
  /**
   * Main Function: Parses CSS string -> Generates Cumulative Matrix -> Applies to Pixels
   */
  export const applyFilterToCanvas = (ctx, width, height, filterCss) => {
    if (!filterCss || filterCss === 'none') return;
  
    // 1. Build the Cumulative Matrix based on string order
    let m = IDENTITY_MATRIX;
  
    // Regex to find all filter functions in order
    // Matches: "name(value)"
    const regex = /([a-z-]+)\(([^)]+)\)/g;
    let match;
  
    // We loop through the string to respect the order of operations
    while ((match = regex.exec(filterCss)) !== null) {
      const name = match[1];
      const valStr = match[2];
      let val = parseFloat(valStr);
      
      // Normalize values
      if (valStr.includes('%') && name !== 'hue-rotate') {
        val /= 100;
      }      
      let nextM = null;
      switch (name) {
        case 'brightness': nextM = getBrightnessMatrix(val); break;
        case 'contrast': nextM = getContrastMatrix(val); break;
        case 'grayscale': nextM = getGrayscaleMatrix(val); break;
        case 'sepia': nextM = getSepiaMatrix(val); break;
        case 'saturate': nextM = getSaturateMatrix(val); break;
        case 'hue-rotate': 
            nextM = getHueRotateMatrix(val); 
            break;
        case 'blur': 
            break;
      }
  
      if (nextM) {
        // Multiply current total by the new filter matrix
        m = multiplyMatrices(nextM, m);
      }
    }
  
    // 2. Apply the Final Matrix to Pixels
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data; // Uint8ClampedArray
  
    // Unpack matrix for speed inside loop
    const r1=m[0], r2=m[1], r3=m[2], r4=m[3], r5=m[4];
    const g1=m[5], g2=m[6], g3=m[7], g4=m[8], g5=m[9];
    const b1=m[10],b2=m[11],b3=m[12],b4=m[13],b5=m[14];
  
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
  
      // Apply Matrix
      data[i]     = r*r1 + g*r2 + b*r3 + r5; // Red
      data[i + 1] = r*g1 + g*g2 + b*g3 + g5; // Green
      data[i + 2] = r*b1 + g*b2 + b*b3 + b5; // Blue
      // Alpha remains unchanged
    }
  
    ctx.putImageData(imageData, 0, 0);
  };