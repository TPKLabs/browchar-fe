import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";

import { QueryProvider } from "./query-provider";

function Probe() {
  const queryClient = useQueryClient();
  return <p>{queryClient ? "con QueryClient" : "sin QueryClient"}</p>;
}

describe("QueryProvider", () => {
  it("expone un QueryClient a sus hijos", () => {
    render(
      <QueryProvider>
        <Probe />
      </QueryProvider>,
    );
    expect(screen.getByText("con QueryClient")).toBeInTheDocument();
  });
});
