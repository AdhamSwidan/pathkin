// FIX: Removed reference to "vite/client" which was not found and caused an error.
// Added a declaration for process.env to satisfy TypeScript checking for `process.env.API_KEY`
// used in geminiService.ts, as required by the coding guidelines.
declare var process: {
  env: {
    API_KEY?: string;
  };
};
