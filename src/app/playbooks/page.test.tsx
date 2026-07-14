import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/playbooks/playbooksList", () => ({
  PlaybooksList: () => <div>lista de playbooks</div>,
}));

import PlaybooksPage from "./page";

describe("PlaybooksPage", () => {
  it("renders the page heading and delegates the list to PlaybooksList", () => {
    render(<PlaybooksPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Playbooks" }),
    ).toBeInTheDocument();
    expect(screen.getByText("lista de playbooks")).toBeInTheDocument();
  });
});
