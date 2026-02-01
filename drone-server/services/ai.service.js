import axios from "axios";

export async function triggerAIAnalysis({ sessionId, bucket, rawVideoKey }) {
  const url = `${process.env.AI_SERVICE_URL}/analyze`;

  const resp = await axios.post(url, {
    sessionId,
    bucket,
    rawVideoKey,
  });

  return resp.data;
}
