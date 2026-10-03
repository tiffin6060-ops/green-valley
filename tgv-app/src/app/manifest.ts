import type { MetadataRoute } from "next";
import en from "../../messages/en.json";
import { site } from "@/data/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Green Valley",
    description: en.meta.description,
    start_url: "/",
    display: "browser",
    background_color: "#f5f3eb",
    theme_color: "#123f2d",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
