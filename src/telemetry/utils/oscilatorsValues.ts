export const getOscillatedValue = (
  min: number,
  max: number,
  frequency: number = 0.1,
): number => {
  const time = Date.now() / 1000;
  const variation = (Math.sin(time * frequency) + 1) / 2;
  return min + variation * (max - min);
};
