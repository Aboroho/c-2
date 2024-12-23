// kernel.ts
export const kernelFunction = function (width, height, hue) {
  const x = this.thread.x;
  const mod = (x + 1) % 4;

  let col = Math.ceil(x / 4) % width;
  if (col == 0) col = width;
  const row = Math.ceil(Math.ceil(x / 4) / width);

  const l = Math.min(1 - row / height, 0.8);
  const s = Math.min(col / width, 0.9);

  const h = Math.floor(hue * 360);
  const c = (1 - Math.abs(2 * l - 1)) * s; 
  const X = c * (1 - Math.abs(((h / 60) % 2) - 1)); 
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = X;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = X;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = X;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = X;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = X;
    g = 0;
    b = c;
  } else if (h >= 300 && h <= 360) {
    r = c;
    g = 0;
    b = X;
  }

  // // Adjust colors to the 0-255 range
  r = Math.floor((r + m) * 255);
  g = Math.floor((g + m) * 255);
  b = Math.floor((b + m) * 255);

  if (mod === 0) {
    return 255;
  } else if (mod === 1) {
    return r;
  } else if (mod === 2) {
    return g;
  } else {
    return b;
  }
};
