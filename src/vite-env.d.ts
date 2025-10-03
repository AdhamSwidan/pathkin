// Fix: The original `/// <reference types="vite/client" />` was causing a type resolution error and has been removed.
// Manual definitions for import.meta.env, used in firebase.ts, are provided below.

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Fix: `declare var process` caused a redeclaration error. The correct way to add types
// for an environment variable on `process.env` is to augment the `NodeJS.ProcessEnv` interface.
// This works because the build tool (Vite) replaces `process.env.API_KEY` with a string,
// and this provides the necessary type information to TypeScript without creating a new `process` variable.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
  }
}
