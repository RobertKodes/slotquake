import { Buffer } from "buffer";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

window.Buffer = Buffer;

const root = document.getElementById("root");
if (!root) {
  throw new Error("root missing");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
