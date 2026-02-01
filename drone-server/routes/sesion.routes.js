import express from "express";
import { v4 as uuidv4 } from "uuid";

import { getSession, createSession,updateSession, listSessions  } from "../config/db.js";
import { startRecording, stopRecording, isRecording } from "./../services/recording.service.js";
import { uploadFileToS3, getSignedUrlForKey } from "../services/s3.service.js";
import { triggerAIAnalysis } from "../services/ai.service.js";

const router = express.Router();


router.get("/", (req, res) => {
  res.json(listSessions());
});

router.post("/start", async (req, res) => {
  const sessionId = uuidv4();

  const input = process.env.STREAM_INPUT;
  if (!input) return res.status(500).json({ message: "STREAM_INPUT missing in .env" });

  startRecording(sessionId, input);

  const session = createSession({
    sessionId,
    status: "RECORDING",
    rawVideoKey: null,
    analysis: null,
    createdAt: new Date().toISOString(),
  });

  res.json(session);
});

// ✅ Stop recording + upload to S3
router.post("/:sessionId/stop", async (req, res) => {
  const { sessionId } = req.params;

  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ message: "Session not found" });

  if (!isRecording(sessionId)) {
    return res.status(400).json({ message: "This session is not recording" });
  }

  const localPath = stopRecording(sessionId);

  const rawKey = `raw/${sessionId}.mp4`;
  await uploadFileToS3(localPath, rawKey, "video/mp4");

  const updated = updateSession(sessionId, {
    status: "UPLOADED",
    rawVideoKey: rawKey,
    endedAt: new Date().toISOString(),
  });

  res.json(updated);
});

// ✅ Get session metadata
router.get("/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ message: "Session not found" });
  res.json(session);
});

// ✅ Get signed URLs
router.get("/:sessionId/results", async (req, res) => {
  const { sessionId } = req.params;

  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ message: "Session not found" });

  const result = { ...session };

  if (session.rawVideoKey) {
    result.rawVideoUrl = await getSignedUrlForKey(session.rawVideoKey);
  }

  if (session.analysis?.overlayKey) {
    result.overlayUrl = await getSignedUrlForKey(session.analysis.overlayKey);
  }

  if (session.analysis?.stressKey) {
    result.stressUrl = await getSignedUrlForKey(session.analysis.stressKey);
  }

  if (session.analysis?.reportKey) {
    result.reportUrl = await getSignedUrlForKey(session.analysis.reportKey);
  }

  res.json(result);
});

// ✅ Trigger AI analysis
router.post("/:sessionId/analyze", async (req, res) => {
  const { sessionId } = req.params;

  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ message: "Session not found" });

  if (!session.rawVideoKey) {
    return res.status(400).json({ message: "Raw video not uploaded yet. Stop session first." });
  }

  updateSession(sessionId, { status: "ANALYZING" });

  const aiData = await triggerAIAnalysis({
    sessionId,
    bucket: process.env.S3_BUCKET,
    rawVideoKey: session.rawVideoKey,
  });

  const updated = updateSession(sessionId, {
    status: "DONE",
    analysis: aiData,
  });

  res.json(updated);
});

export default router;
