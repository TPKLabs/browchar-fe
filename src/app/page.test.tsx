import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the dashboard welcome heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Bienvenido de nuevo, aventurero",
      }),
    ).toBeInTheDocument();
  });

  it("links the quick actions to the playbooks page", () => {
    render(<Home />);
    expect(
      screen.getByRole("button", { name: /crear personaje/i }),
    ).toHaveAttribute("href", "/playbooks");
    expect(
      screen.getByRole("button", { name: /ver playbooks/i }),
    ).toHaveAttribute("href", "/playbooks");
  });

  it("renders the recent characters", () => {
    render(<Home />);
    expect(screen.getByText("Kaelith Duskbane")).toBeInTheDocument();
    expect(screen.getByText("Voss Ironhollow")).toBeInTheDocument();
    expect(screen.getByText("Nyra Emberfall")).toBeInTheDocument();
  });
});
