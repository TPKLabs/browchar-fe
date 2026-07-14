import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./footer";

describe("Footer", () => {
  it("muestra el copyright con el año actual", () => {
    render(<Footer />);
    expect(
      screen.getByText(`© ${new Date().getFullYear()} Browchar`),
    ).toBeInTheDocument();
  });

  it("linkea a juegos y playbooks", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Juegos" })).toHaveAttribute(
      "href",
      "/games",
    );
    expect(screen.getByRole("link", { name: "Playbooks" })).toHaveAttribute(
      "href",
      "/playbooks",
    );
  });
});
