import tailwindConfig from "../../tailwind.config";

import {
  designTokenGovernance,
  designTokens,
  tailwindThemeExtension,
  tokenCorrespondence,
} from "../theme/design-tokens";

describe("design token synchronization", () => {
  it("covers the canonical semantic groups from the official skill", () => {
    expect(designTokens.brand).toMatchObject({
      primary: expect.any(String),
      primaryHover: expect.any(String),
      primarySoft: expect.any(String),
      secondary: expect.any(String),
      secondarySoft: expect.any(String),
    });

    expect(designTokens.surface).toMatchObject({
      page: expect.any(String),
      base: expect.any(String),
      subtle: expect.any(String),
      heroStart: expect.any(String),
      heroEnd: expect.any(String),
    });

    expect(designTokens.text).toMatchObject({
      strong: expect.any(String),
      body: expect.any(String),
      inverse: expect.any(String),
    });

    expect(designTokens.border).toMatchObject({
      subtle: expect.any(String),
    });

    expect(designTokens.shape).toMatchObject({
      card: expect.any(String),
      button: expect.any(String),
      pill: expect.any(String),
    });

    expect(designTokens.depth).toMatchObject({
      card: expect.any(String),
      floating: expect.any(String),
    });
  });

  it("exposes stable tokens for Tailwind colors, radius and depth", () => {
    expect(tailwindThemeExtension.colors).toMatchObject({
      brand: {
        primary: expect.any(String),
        secondary: expect.any(String),
      },
      surface: {
        base: expect.any(String),
        page: expect.any(String),
      },
      text: {
        strong: expect.any(String),
        body: expect.any(String),
      },
    });

    expect(tailwindThemeExtension.borderRadius).toMatchObject({
      card: designTokens.shape.card,
      button: designTokens.shape.button,
      pill: designTokens.shape.pill,
    });

    expect(tailwindThemeExtension.boxShadow).toMatchObject({
      card: designTokens.depth.card,
      floating: designTokens.depth.floating,
    });

    expect(tailwindConfig.darkMode).toBe("class");
  });

  it("records governance metadata, the reference image and the naming mismatch", () => {
    expect(designTokenGovernance).toMatchObject({
      sourceSkillPath: ".ai/skills/deisgn-token/SKILL.MD",
      referenceImagePath: ".ai/skills/deisgn-token/examples/example-page.webp",
      namingMismatch: {
        expected: "design-token",
        actual: "deisgn-token",
        documented: true,
      },
    });

    expect(tokenCorrespondence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceTokenName: "brand.primary",
          projectTokenName: "brand.primary",
        }),
        expect.objectContaining({
          sourceTokenName: "surface.heroStart",
          projectTokenName: "surface.hero.start",
        }),
        expect.objectContaining({
          sourceTokenName: "accent.campaign",
          projectTokenName: "accent.campaign",
        }),
      ]),
    );
  });
});
