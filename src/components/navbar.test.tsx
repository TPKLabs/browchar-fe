import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "./navbar";

describe("Navbar", () => {
  it("renders the brand link to the dashboard", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /browchar/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders navigation links to the dashboard, games and playbooks", () => {
    render(<Navbar />);
    expect(screen.getByRole("button", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("button", { name: "Juegos" })).toHaveAttribute(
      "href",
      "/games",
    );
    expect(screen.getByRole("button", { name: "Playbooks" })).toHaveAttribute(
      "href",
      "/playbooks",
    );
  });

  it("renders a CTA linking straight to the character creation screen", () => {
    render(<Navbar />);
    expect(
      screen.getByRole("button", { name: "Crear personaje" }),
    ).toHaveAttribute("href", "/characters/new");
  });
});
