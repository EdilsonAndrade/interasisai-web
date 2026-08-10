import { renderHook, act } from "@testing-library/react";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("next-intl", () => ({
  useLocale: () => "en",
}));

jest.mock("@/i18n/config", () => ({
  locales: ["pt-BR", "en", "es"],
  defaultLocale: "en",
  localeMeta: {},
}));

import { useLanguageSwitch } from "@/hooks/useLanguageSwitch";

describe("useLanguageSwitch (T029)", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    // Simulate a locale-prefixed URL via history
    window.history.pushState({}, "", "/en/sobre");
  });

  it("returns current locale from useLocale", () => {
    const { result } = renderHook(() => useLanguageSwitch());
    expect(result.current.currentLocale).toBe("en");
  });

  it("switchTo calls router.replace with new locale prefix", () => {
    const { result } = renderHook(() => useLanguageSwitch());
    act(() => {
      result.current.switchTo("pt-BR");
    });
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/pt-BR/sobre");
  });

  it("switchTo does NOT call router.replace when same locale", () => {
    const { result } = renderHook(() => useLanguageSwitch());
    act(() => {
      result.current.switchTo("en");
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("switchTo works for spanish locale", () => {
    const { result } = renderHook(() => useLanguageSwitch());
    act(() => {
      result.current.switchTo("es");
    });
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/es/sobre");
  });
});
