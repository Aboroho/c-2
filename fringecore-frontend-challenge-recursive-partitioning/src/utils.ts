export const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export function getFormatedLabel(size: number) {
  if (size === 50) return "1/2";
  if (size.toFixed(2) === (300 / 4).toFixed(2)) return "3/4";
  if (size.toFixed(2) === (100 / 4).toFixed(2)) return "1/4";
  return size.toFixed(2) + "%";
}

export const generateRandomId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);
