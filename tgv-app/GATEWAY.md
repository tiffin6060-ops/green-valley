# Connecting your real cameras (CCTV gateway)

Browsers cannot play camera RTSP streams. A small program called **MediaMTX** (free, single file) reads RTSP from your
NVR/cameras and turns it into HLS. This website then passes that HLS to logged-in users through `/stream/...`.

```
Camera / NVR --RTSP--> MediaMTX (same server, private) --HLS--> Website (/stream, login required) --> Investor's browser
```
The camera address, camera password and gateway address are **never** sent to browsers, and MediaMTX only listens on 127.0.0.1.

## 1) Requirements on your cameras
- Video codec must be **H.264** (not H.265/HEVC — browsers cannot play it). In the NVR/camera settings pick H.264 for the
  sub-stream (640×360 to 1280×720 is plenty and saves bandwidth).
- The server running the website must be able to reach the NVR (same network, or a VPN/port-forward to the NVR's RTSP port, usually 554).
  Do not expose the NVR admin page to the internet.

## 2) Install MediaMTX on the same server as the website
Download the release for your OS from https://github.com/bluenviron/mediamtx/releases, unzip, and edit `mediamtx.yml`:

```yaml
hlsAddress: 127.0.0.1:8888      # only the website (same machine) can reach it
hlsVariant: mpegts              # most compatible with this site's player
hlsSegmentDuration: 2s
hlsSegmentCount: 6
rtspAddress: 127.0.0.1:8554
webrtc: no
srt: no
rtmp: no

paths:
  cattle:                       # one block per camera
    source: rtsp://CAM_USER:CAM_PASS@192.168.1.10:554/stream2   # <- your camera/NVR RTSP address (sub-stream)
    sourceOnDemand: yes         # only pulls video while someone is watching
  fishpond:
    source: rtsp://CAM_USER:CAM_PASS@192.168.1.11:554/stream2
    sourceOnDemand: yes
```
Common RTSP paths: Hikvision `rtsp://u:p@IP:554/Streaming/Channels/102`, Dahua `rtsp://u:p@IP:554/cam/realmonitor?channel=1&subtype=1`.
Run it (`./mediamtx`), or as a service with pm2: `pm2 start ./mediamtx --name mediamtx && pm2 save`.

## 3) Add the camera in the website
Admin → **Live & Video** → Add camera:
- Name: `Cattle Shed`
- Gateway address: `http://127.0.0.1:8888/cattle/index.m3u8`  (path = the name you used under `paths:`)

Click **Preview**. Investors see it under **Live Farm** after they sign in. Use **Hide** to switch a camera off instantly.

## Troubleshooting
- "Camera offline — reconnecting": open `http://127.0.0.1:8888/cattle/index.m3u8` on the server (`curl`); if that fails, MediaMTX cannot reach the camera (check the RTSP URL/credentials/network).
- Video never starts but the playlist loads: the camera is sending H.265 — switch the stream to H.264.
- Delay of 5–10 seconds is normal for HLS.
- Many viewers at once: each viewer pulls a copy through the website. Fine for a small group; for dozens of viewers put a CDN or use MediaMTX's WebRTC instead.
