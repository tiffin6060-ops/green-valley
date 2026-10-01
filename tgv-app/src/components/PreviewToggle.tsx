"use client";
import { useState } from "react";
import CameraPlayer from "@/components/CameraPlayer";

export default function PreviewToggle({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" className="mini-btn" onClick={() => setOpen(!open)}>{open ? "Hide preview" : "Preview"}</button>
      {open && <div style={{ marginTop: 10, maxWidth: 480 }}><CameraPlayer id={id} name={name} /></div>}
    </div>
  );
}
