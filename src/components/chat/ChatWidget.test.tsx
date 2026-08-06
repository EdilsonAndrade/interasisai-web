import { fireEvent, render, screen } from "@testing-library/react";

import ChatWidget from "./ChatWidget";

const mockUseChat = jest.fn();
const mockUseChatAssistant = jest.fn();

jest.mock("@/context/ChatContext", () => ({
  useChat: () => mockUseChat(),
}));

jest.mock("@/hooks/useChatAssistant", () => ({
  useChatAssistant: () => mockUseChatAssistant(),
}));

jest.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

describe("ChatWidget", () => {
  beforeEach(() => {
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      writable: true,
      value: jest.fn(),
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    mockUseChat.mockReturnValue({
      isOpen: true,
      open: jest.fn(),
      close: jest.fn(),
      toggle: jest.fn(),
    });

    mockUseChatAssistant.mockReturnValue({
      messages: [],
      isLoading: false,
      isRecording: false,
      recordingTime: 0,
      audioBlob: null,
      audioError: "BFF indisponível",
      canRetry: true,
      sendMessage: jest.fn(),
      retryLastMessage: jest.fn(),
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("exibe erro acessível e botão de retry sem travar a interação", () => {
    render(<ChatWidget />);

    expect(screen.getByText("BFF indisponível")).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: "Tentar novamente" });
    fireEvent.click(retryButton);

    const hookState = mockUseChatAssistant.mock.results[0].value;
    expect(hookState.retryLastMessage).toHaveBeenCalledTimes(1);

    const textarea = screen.getByPlaceholderText("Digite sua mensagem...");
    fireEvent.change(textarea, { target: { value: "Nova mensagem" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    expect(hookState.sendMessage).toHaveBeenCalledWith("Nova mensagem");
  });
});
