export const loadEnv = (env: string) => {
  if (!process.env[env]) {
    throw new Error(`${env} is not defined`);
  }

  return process.env[env];
};
