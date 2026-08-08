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
