import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PlaybooksPage from "./page";

describe("PlaybooksPage", () => {
  it("renders the page heading", () => {
    render(<PlaybooksPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Playbooks" }),
    ).toBeInTheDocument();
  });

  it("renders each mock playbook with its game and version", () => {
    render(<PlaybooksPage />);
    expect(screen.getByText("Guerrero")).toBeInTheDocument();
    expect(screen.getByText("Clérigo")).toBeInTheDocument();
    expect(screen.getByText("Piromante")).toBeInTheDocument();
    expect(screen.getAllByText("D&D 5e")).toHaveLength(2);
    expect(screen.getByText("Pathfinder")).toBeInTheDocument();
    expect(screen.getByText("v3")).toBeInTheDocument();
  });

  it("links each playbook to the create-character form with its id", () => {
    render(<PlaybooksPage />);
    // base-ui Button con `nativeButton={false}` renderiza un <a> con role button.
    const actions = screen.getAllByRole("button", { name: "Crear personaje" });
    expect(actions).toHaveLength(3);
    expect(actions[0]).toHaveAttribute(
      "href",
      "/characters/new?playbookId=guerrero",
    );
  });
});
