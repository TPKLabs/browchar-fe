import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Navbar } from "./navbar";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));

vi.mock("next/navigation", () => ({ usePathname }));

describe("Navbar", () => {
  it("renders the brand link to the dashboard", () => {
    usePathname.mockReturnValue("/");
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /browchar/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders navigation links to the dashboard, games and playbooks", () => {
    usePathname.mockReturnValue("/");
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
    usePathname.mockReturnValue("/");
    render(<Navbar />);
    expect(
      screen.getAllByRole("button", { name: "Crear personaje" })[0],
    ).toHaveAttribute("href", "/characters/new");
  });

  it("marca como activo el link de la sección actual", () => {
    usePathname.mockReturnValue("/games");
    render(<Navbar />);
    expect(screen.getByRole("button", { name: "Juegos" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("button", { name: "Dashboard" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("el menú mobile está cerrado por defecto y se abre al tocar el botón", () => {
    usePathname.mockReturnValue("/");
    render(<Navbar />);

    expect(
      screen.queryByRole("button", { name: "Cerrar menú" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));

    expect(
      screen.getByRole("button", { name: "Cerrar menú" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Playbooks" })).toHaveLength(
      2,
    );
  });
});
