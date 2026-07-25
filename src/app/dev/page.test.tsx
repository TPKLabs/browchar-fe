import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import DevPage from "@/app/dev/page";

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/components/dev/designSystemPreview", () => ({
  DesignSystemPreview: () => <div>Design system preview</div>,
}));

describe("DevPage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    notFoundMock.mockReset();
  });

  it("renders the design system preview outside production", () => {
    vi.stubEnv("NODE_ENV", "development");

    render(<DevPage />);

    expect(screen.getByText("Design system preview")).toBeInTheDocument();
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it("returns not found in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    notFoundMock.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    expect(() => render(<DevPage />)).toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
