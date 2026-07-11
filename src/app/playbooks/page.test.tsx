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

  it("renders a create-character action per playbook", () => {
    render(<PlaybooksPage />);
    expect(
      screen.getAllByRole("button", { name: "Crear personaje" }),
    ).toHaveLength(3);
  });
});
