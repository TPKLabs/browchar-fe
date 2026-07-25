import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DesignSystemPreview } from "@/components/dev/designSystemPreview";

const SECTION_TITLES = [
  "Button — variants × sizes",
  "Button — icon sizes",
  "Badge",
  "Card",
  "Input / Textarea",
  "Checkbox / Radio / Select",
  "Skeleton / Spinner",
  "Empty",
];

describe("DesignSystemPreview", () => {
  it("renders every current UI primitive section in light and dark themes", () => {
    const { container } = render(<DesignSystemPreview />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Design system" }),
    ).toBeInTheDocument();

    for (const title of SECTION_TITLES) {
      expect(
        screen.getAllByRole("heading", { level: 2, name: title }),
      ).toHaveLength(2);
    }

    const darkTheme = container.querySelector<HTMLElement>(".dark");
    expect(darkTheme).not.toBeNull();
    expect(within(darkTheme!).getByText("Oscuro")).toBeInTheDocument();
    expect(screen.getByText("Claro")).toBeInTheDocument();
  });

  it("uses unique ids across both theme columns", () => {
    const { container } = render(<DesignSystemPreview />);
    const ids = Array.from(container.querySelectorAll("[id]"), (element) =>
      element.getAttribute("id"),
    );

    expect(new Set(ids).size).toBe(ids.length);
  });
});
