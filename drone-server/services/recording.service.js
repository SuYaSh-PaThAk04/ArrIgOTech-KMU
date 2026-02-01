import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const activeRecordings = new Map(); 
// sessionId -> { ffmpeg, localPath, startedAt }

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function startRecording(sessionId, inputUrlOrPath) {
  ensureDir("recordings");

  const localPath = path.join("recordings", `${sessionId}.mp4`);

  // -re makes reading input in realtime for local file
  const args = [
    "-y",
    "-re",
    "-i", inputUrlOrPath,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "28",
    "-movflags", "+faststart",
    localPath
  ];

  const ffmpeg = spawn("ffmpeg", args);

  ffmpeg.stderr.on("data", (data) => {
    // ffmpeg logs come on stderr
    // console.log(`[ffmpeg ${sessionId}] ${data.toString()}`);
  });

  ffmpeg.on("close", (code) => {
    console.log(`[ffmpeg] session ${sessionId} closed with code ${code}`);
  });

  activeRecordings.set(sessionId, {
    ffmpeg,
    localPath,
    startedAt: Date.now(),
  });

  console.log(`[recorder] recording started: ${localPath}`);
  return localPath;
}

export function stopRecording(sessionId) {
  const rec = activeRecordings.get(sessionId);
  if (!rec) throw new Error("No active recording for this sessionId");

  rec.ffmpeg.kill("SIGINT");
  activeRecordings.delete(sessionId);

  console.log(`[recorder] recording stopped: ${sessionId}`);
  return rec.localPath;
}

export function isRecording(sessionId) {
  return activeRecordings.has(sessionId);
}
