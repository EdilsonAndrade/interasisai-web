export type OptimizeAudioForBffInput = {
  audioBlob: Blob;
  originalDurationMs: number;
  optimizationFactor?: number;
};

export type OptimizeAudioForBffResult = {
  optimizedBlob: Blob;
  originalDurationMs: number;
  optimizedDurationMs: number;
  optimizationFactor: number;
};

const DEFAULT_OPTIMIZATION_FACTOR = 1.15;

async function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === "function") {
    return blob.arrayBuffer();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler áudio para otimização."));
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
        return;
      }

      reject(new Error("Falha ao ler áudio para otimização."));
    };
    reader.readAsArrayBuffer(blob);
  });
}

function encodeWavFromAudioBuffer(audioBuffer: AudioBuffer): Blob {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;
  const dataLength = audioBuffer.length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let sample = 0; sample < audioBuffer.length; sample += 1) {
    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      const channelData = audioBuffer.getChannelData(channel);
      const clamped = Math.max(-1, Math.min(1, channelData[sample]));
      const pcm = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      view.setInt16(offset, pcm, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function validateOptimizationFactor(factor: number): number {
  if (!Number.isFinite(factor) || factor <= 1) {
    throw new Error("Fator de otimização inválido.");
  }

  if (factor > 1.35) {
    return 1.35;
  }

  return factor;
}

export async function optimizeAudioForBff(input: OptimizeAudioForBffInput): Promise<OptimizeAudioForBffResult> {
  if (input.audioBlob.size <= 0) {
    throw new Error("Não foi possível otimizar um áudio vazio.");
  }

  if (typeof AudioContext === "undefined" || typeof OfflineAudioContext === "undefined") {
    throw new Error("Seu navegador não suporta otimização de áudio.");
  }

  const factor = validateOptimizationFactor(input.optimizationFactor ?? DEFAULT_OPTIMIZATION_FACTOR);
  const audioContext = new AudioContext();

  try {
    const sourceArrayBuffer = await readBlobAsArrayBuffer(input.audioBlob);
    const decodedBuffer = await audioContext.decodeAudioData(sourceArrayBuffer.slice(0));

    const originalDurationMs = input.originalDurationMs > 0 ? input.originalDurationMs : Math.round(decodedBuffer.duration * 1000);
    const optimizedDurationSeconds = Math.max(decodedBuffer.duration / factor, 0.05);

    const offlineContext = new OfflineAudioContext(
      decodedBuffer.numberOfChannels,
      Math.ceil(optimizedDurationSeconds * decodedBuffer.sampleRate),
      decodedBuffer.sampleRate,
    );

    const source = offlineContext.createBufferSource();
    source.buffer = decodedBuffer;
    source.playbackRate.value = factor;
    source.connect(offlineContext.destination);
    source.start(0);

    const renderedBuffer = await offlineContext.startRendering();
    const optimizedDurationMs = Math.round((renderedBuffer.length / renderedBuffer.sampleRate) * 1000);

    if (optimizedDurationMs >= originalDurationMs) {
      throw new Error("Não foi possível reduzir a duração do áudio gravado.");
    }

    return {
      optimizedBlob: encodeWavFromAudioBuffer(renderedBuffer),
      originalDurationMs,
      optimizedDurationMs,
      optimizationFactor: factor,
    };
  } finally {
    await audioContext.close();
  }
}
