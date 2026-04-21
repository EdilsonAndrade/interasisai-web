import { renderHook, act } from "@testing-library/react";
import { useChatAssistant } from "./useChatAssistant";

// Mock MediaRecorder globally
class MockMediaRecorder {
  static isTypeSupported = () => true;
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  start() {}
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

  // Test 4 — audio error sets audioError to a non-null string
  it("sets audioError when getUserMedia is denied", async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error("Permission denied"));

    const { result } = renderHook(() => useChatAssistant());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.audioError).toBe("Permissão de microfone necessária");
  });
});
