import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

const mockSwitchTo = jest.fn();

jest.mock("@/hooks/useLanguageSwitch", () => ({
  useLanguageSwitch: () => ({
    currentLocale: "en",
    switchTo: mockSwitchTo,
  }),
}));

jest.mock("@/i18n/config", () => ({
  localeMeta: {
    "pt-BR": { code: "pt-BR", flag: "🇧🇷", nativeName: "Português", dir: "ltr" },
    en: { code: "en", flag: "🇺🇸", nativeName: "English", dir: "ltr" },
    es: { code: "es", flag: "🇪🇸", nativeName: "Español", dir: "ltr" },
  },
}));

describe("LanguageSwitcher component (T030, T031)", () => {
  beforeEach(() => {
    mockSwitchTo.mockClear();
  });

  it("renders trigger button with current locale flag", () => {
    render(<LanguageSwitcher />);
    const trigger = screen.getByTestId("language-switcher-trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger.textContent).toContain("🇺🇸");
  });

  it("renders all 3 language options when opened", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId("language-switcher-trigger"));

    expect(screen.getByTestId("lang-option-pt-BR")).toBeInTheDocument();
    expect(screen.getByTestId("lang-option-en")).toBeInTheDocument();
    expect(screen.getByTestId("lang-option-es")).toBeInTheDocument();
  });

  it("highlights current locale with aria-selected on option", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId("language-switcher-trigger"));

    // Find the li[role="option"] containing the en button
    const options = screen.getAllByRole("option");
    const enOption = options.find(
      (opt) => opt.getAttribute("aria-selected") === "true",
    );
    expect(enOption).toBeInTheDocument();
    expect(enOption!.textContent).toContain("English");
  });

  it("calls switchTo with correct locale on option click", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId("language-switcher-trigger"));
    fireEvent.click(screen.getByTestId("lang-option-pt-BR"));

    expect(mockSwitchTo).toHaveBeenCalledWith("pt-BR");
  });

  it("closes dropdown after selecting a language", async () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId("language-switcher-trigger"));

    // Dropdown should be open
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("lang-option-es"));

    // AnimatePresence keeps element during exit animation; wait for removal
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  // Accessibility tests (T031)
  it("has proper aria attributes on trigger button", () => {
    render(<LanguageSwitcher />);
    const trigger = screen.getByTestId("language-switcher-trigger");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-label");
  });

  it("sets aria-expanded=true when dropdown is open", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId("language-switcher-trigger"));
    expect(screen.getByTestId("language-switcher-trigger")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("dropdown has listbox role and aria-label", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId("language-switcher-trigger"));
    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeInTheDocument();
    expect(listbox).toHaveAttribute("aria-label", "Select language");
  });

  it("closes on Escape key press", async () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByTestId("language-switcher-trigger"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });
});
