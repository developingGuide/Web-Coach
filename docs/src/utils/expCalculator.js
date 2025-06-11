export const getLevelFromExp = (exp) => {
  return Math.floor(Math.sqrt(exp / 100));
};

export const getExpForLevel = (level) => {
  return 100 * level * level;
};