import { renderHook, act } from "@testing-library/react";
import { useChatAssistant } from "./useChatAssistant";

// Mock MediaRecorder globally
class MockMediaRecorder {
  static isTypeSupported = (_mimeType: string) => true;
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;

  start() {
    // Simulate ondataavailable after 100ms with a fake audio chunk
    setTimeout(() => {
      if (this.ondataavailable) {
        const fakeBlob = new Blob(["fake-audio"], { type: "audio/webm" });
        this.ondataavailable({ data: fakeBlob });
      }
    }, 100);
  }

  stop() {
    if (this.onstop) this.onstop();
  }
}

Object.defineProperty(global, "MediaRecorder", {
  writable: true,
  value: MockMediaRecorder,
});

const mockGetUserMedia = jest.fn();
Object.defineProperty(global.navigator, "mediaDevices", {
  writable: true,
  value: { getUserMedia: mockGetUserMedia },
});

jest.useFakeTimers();

describe("useChatAssistant", () => {
  beforeEach(() => {
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  // ── Chat message tests ──────────────────────────────────────────────────────

  // Test 1 — sending a message adds it to messages with role: 'user'
  it("adds user message to messages list on sendMessage", () => {
    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("Olá");
    });

    expect(result.current.messages[0]).toMatchObject({
      role: "user",
      content: "Olá",
    });
  });

  // Test 2 — after sending, isLoading becomes true then false after mock resolves
  it("sets isLoading true while waiting for AI reply", async () => {
    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("Teste");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
  });

  // Test 3 — after loading, a mock AI reply is added to messages with role: 'ai'
  it("adds AI reply to messages after loading completes", async () => {
    const { result } = renderHook(() => useChatAssistant());

    act(() => {
      result.current.sendMessage("Olá");
    });

    await act(async () => {
      jest.runAllTimers();
    });

    const aiMessages = result.current.messages.filter((m) => m.role === "ai");
    expect(aiMessages).toHaveLength(1);
    expect(aiMessages[0].content).toBeTruthy();
  });

  // ── Audio recording tests ───────────────────────────────────────────────────

  // T-A1: startRecording → isRecording true
  it("T-A1: sets isRecording to true when startRecording is called", async () => {
    const { result } = renderHook(() => useChatAssistant());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);
  });

  // T-A2: recordingTime increments by 1 each second while recording
  it("T-A2: recordingTime increments by 1 each second while recording", async () => {
    const { result } = renderHook(() => useChatAssistant());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.recordingTime).toBe(3);
  });

  // T-A3: stopRecording → audioBlob has size > 0
  it("T-A3: audioBlob has size > 0 after stopRecording", async () => {
    const { result } = renderHook(() => useChatAssistant());

    await act(async () => {
      await result.current.startRecording();
    });

    // Advance timers to trigger ondataavailable simulation (100ms in MockMediaRecorder.start)
    act(() => {
      jest.advanceTimersByTime(200);
    });

    act(() => {
      result.current.stopRecording();
    });

    expect(result.current.audioBlob).not.toBeNull();
    expect(result.current.audioBlob!.size).toBeGreaterThan(0);
  });

  // T-A4: stopRecording → isRecording false, recordingTime 0
  it("T-A4: stopRecording sets isRecording to false and recordingTime to 0", async () => {
    const { result } = renderHook(() => useChatAssistant());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.stopRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.recordingTime).toBe(0);
  });

  // T-A5: getUserMedia rejected → audioError set, isRecording false
  it("T-A5: sets audioError when getUserMedia is denied", async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error("NotAllowedError"));

    const { result } = renderHook(() => useChatAssistant());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.audioError).toBe("Permissão de microfone necessária");
    expect(result.current.isRecording).toBe(false);
  });

  // T-A6: MediaRecorder not supported → audioError set, isRecording false
  it("T-A6: sets audioError when MediaRecorder is not supported", async () => {
    const originalMediaRecorder = global.MediaRecorder;
    // @ts-expect-error — intentionally removing MediaRecorder to test unsupported path
    global.MediaRecorder = undefined;

    const { result } = renderHook(() => useChatAssistant());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.audioError).toContain("não suportada");
    expect(result.current.isRecording).toBe(false);

    global.MediaRecorder = originalMediaRecorder;
  });
});
