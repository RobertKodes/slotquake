/// <reference types="vite/client" />

interface Window {
  Buffer: typeof import("buffer").Buffer;
}

interface ImportMetaEnv {
  readonly VITE_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
