import "@testing-library/jest-dom";

class MockIntersectionObserver implements IntersectionObserver {
	readonly root: Element | Document | null = null;
	readonly rootMargin = "0px";
	readonly thresholds: ReadonlyArray<number> = [0];

	disconnect(): void {}

	observe(): void {}

	takeRecords(): IntersectionObserverEntry[] {
		return [];
	}

	unobserve(): void {}
}

if (typeof window !== "undefined") {
	Object.defineProperty(window, "IntersectionObserver", {
		writable: true,
		configurable: true,
		value: MockIntersectionObserver,
	});
}

// jsdom does not implement HTMLDialogElement.showModal()/close() (as of jsdom 26 —
// https://github.com/jsdom/jsdom/issues/3294), so <dialog> never becomes a real
// modal in tests and native Escape-to-close never fires. This polyfill mimics just
// enough of that native behaviour (showModal/close + Escape-triggered "cancel") so
// components relying on it behave the same under test as in a real browser.
if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
	const openModalDialogs = new Set<HTMLDialogElement>();

	HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
		this.setAttribute("open", "");
		openModalDialogs.add(this);
	};

	HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
		if (!openModalDialogs.has(this) && !this.hasAttribute("open")) return;
		this.removeAttribute("open");
		openModalDialogs.delete(this);
		this.dispatchEvent(new Event("close"));
	};

	document.addEventListener("keydown", (event) => {
		if (event.key !== "Escape" || openModalDialogs.size === 0) return;
		const topDialog = Array.from(openModalDialogs).pop();
		if (!topDialog) return;
		const cancelEvent = new Event("cancel", { cancelable: true });
		const notPrevented = topDialog.dispatchEvent(cancelEvent);
		if (notPrevented) topDialog.close();
	});
}
