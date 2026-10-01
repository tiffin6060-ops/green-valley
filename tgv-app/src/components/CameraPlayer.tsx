"use client";
import { useEffect, useRef, useState } from "react";

export default function CameraPlayer({ id, name }: { id: string; name: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"loading" | "live" | "offline" | "unsupported">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const src = `/stream/${id}/live.m3u8`;
    let hls: import("hls.js").default | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let dead = false;
    const fail = () => { if (!dead) { setStatus("offline"); retry = setTimeout(() => setAttempt((a) => a + 1), 6000); } };
    setStatus("loading");

    if (v.canPlayType("application/vnd.apple.mpegurl")) {          // Safari / iOS: native HLS
      v.src = src;
      v.onerror = fail;
      v.onplaying = () => setStatus("live");
      v.play().catch(() => {});
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (dead) return;
        if (!Hls.isSupported()) return setStatus("unsupported");
        hls = new Hls({ liveSyncDurationCount: 3, manifestLoadingMaxRetry: 1, levelLoadingMaxRetry: 2 });
        hls.loadSource(src);
        hls.attachMedia(v);
        hls.on(Hls.Events.MANIFEST_PARSED, () => v.play().catch(() => {}));
        hls.on(Hls.Events.FRAG_LOADED, () => setStatus("live"));
        hls.on(Hls.Events.ERROR, (_e, d) => { if (d.fatal) { hls?.destroy(); hls = null; fail(); } });
      });
    }
    return () => { dead = true; clearTimeout(retry); hls?.destroy(); if (v) { v.onerror = null; v.onplaying = null; v.removeAttribute("src"); v.load(); } };
  }, [id, attempt]);

  return (
    <div className="cam-box">
      <video ref={ref} muted autoPlay playsInline controls aria-label={`Live camera: ${name}`} />
      {status !== "live" && (
        <div className="cam-overlay">
          {status === "loading" && "Connecting…"}
          {status === "offline" && "Camera offline — reconnecting…"}
          {status === "unsupported" && "This browser cannot play live video. Try Chrome, Edge, Firefox or Safari."}
        </div>
      )}
      {status === "live" && <span className="cam-live">● LIVE</span>}
    </div>
  );
}
