import { DEFAULT_AUDIO_REPLY_MIME } from "./chatGateway.types";

const BASE64_PATTERN = /^[A-Za-z0-9+/]+=*$/;

export class AudioBase64DecodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AudioBase64DecodeError";
  }
}

function sanitize(input: string): string {
  return input.replace(/\s+/g, "");
}

export function decodeAudioBase64(base64: string, mimeType?: string): Blob {
  if (typeof base64 !== "string" || !base64.trim()) {
    throw new AudioBase64DecodeError("Base64 vazio.");
  }

  const cleaned = sanitize(base64);
  if (!BASE64_PATTERN.test(cleaned)) {
    throw new AudioBase64DecodeError("Base64 inválido.");
  }

  let binary: string;
  try {
    binary = atob(cleaned);
  } catch {
    throw new AudioBase64DecodeError("Falha ao decodificar Base64.");
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType?.trim() || DEFAULT_AUDIO_REPLY_MIME });
}
