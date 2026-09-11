export function listenReducedMotion(cb: (on: boolean) => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => undefined;
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handler = () => cb(mq.matches);
  handler();
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}
