export const getRequiredEnv = (key) => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const getRequiredUrl = (key) => getRequiredEnv(key).replace(/\/$/, "");
