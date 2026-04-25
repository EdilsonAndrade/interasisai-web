import { optimizeAudioForBff } from "./audioOptimization";

type MockAudioBuffer = {
  numberOfChannels: number;
  sampleRate: number;
  length: number;
  duration: number;
  getChannelData: (channel: number) => Float32Array;
};

function createMockAudioBuffer(length: number, sampleRate: number): MockAudioBuffer {
  return {
    numberOfChannels: 1,
    sampleRate,
    length,
    duration: length / sampleRate,
    getChannelData: () => new Float32Array(length).fill(0.2),
  };
}

describe("optimizeAudioForBff", () => {
  const decodedBuffer = createMockAudioBuffer(1000, 1000);

  beforeEach(() => {
    const renderedBuffer = createMockAudioBuffer(800, 1000);

    class MockAudioContext {
      decodeAudioData = jest.fn().mockResolvedValue(decodedBuffer as unknown as AudioBuffer);
      close = jest.fn().mockResolvedValue(undefined);
    }

    class MockOfflineAudioContext {
      destination = {} as AudioDestinationNode;
      createBufferSource() {
        return {
          buffer: null,
          playbackRate: { value: 1 },
          connect: jest.fn(),
          start: jest.fn(),
        };
      }
      startRendering = jest.fn().mockResolvedValue(renderedBuffer as unknown as AudioBuffer);
    }

    Object.defineProperty(globalThis, "AudioContext", {
      configurable: true,
      writable: true,
      value: MockAudioContext,
    });

    Object.defineProperty(globalThis, "OfflineAudioContext", {
      configurable: true,
      writable: true,
      value: MockOfflineAudioContext,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("retorna áudio otimizado com duração reduzida", async () => {
    const result = await optimizeAudioForBff({
      audioBlob: new Blob(["raw"], { type: "audio/webm" }),
      originalDurationMs: 1000,
      optimizationFactor: 1.2,
    });

    expect(result.originalDurationMs).toBe(1000);
    expect(result.optimizedDurationMs).toBe(800);
    expect(result.optimizedDurationMs).toBeLessThan(result.originalDurationMs);
    expect(result.optimizedBlob.size).toBeGreaterThan(0);
  });

  it("falha quando não consegue reduzir a duração", async () => {
    const sameDurationBuffer = createMockAudioBuffer(1000, 1000);

    class MockOfflineAudioContextNoReduction {
      destination = {} as AudioDestinationNode;
      createBufferSource() {
        return {
          buffer: null,
          playbackRate: { value: 1 },
          connect: jest.fn(),
          start: jest.fn(),
        };
      }
      startRendering = jest.fn().mockResolvedValue(sameDurationBuffer as unknown as AudioBuffer);
    }

    Object.defineProperty(globalThis, "OfflineAudioContext", {
      configurable: true,
      writable: true,
      value: MockOfflineAudioContextNoReduction,
    });

    await expect(
      optimizeAudioForBff({
        audioBlob: new Blob(["raw"], { type: "audio/webm" }),
        originalDurationMs: 1000,
      }),
    ).rejects.toThrow("Não foi possível reduzir a duração do áudio gravado");
  });
});
