import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
import { playbookQueryKey, usePlaybook } from "./usePlaybook";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

const playbook = {
  id: "angel",
  name: "Angel",
  version: 1,
  createdAt: "2026-01-15T12:00:00.000Z",
  game: { gameId: "aw", gameName: "Apocalypse World" },
  template: [],
};

describe("usePlaybook", () => {
  it("trae el playbook desde GET /playbooks/:id", async () => {
    let receivedUrl: string | undefined;
    let receivedMethod: string | undefined;
    server.use(
      http.get("/playbooks/:id", ({ request }) => {
        receivedUrl = new URL(request.url).pathname;
        receivedMethod = request.method;
        return HttpResponse.json(playbook);
      }),
    );

    const { result } = renderHook(() => usePlaybook("angel"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(playbook);
    expect(receivedUrl).toBe("/playbooks/angel");
    expect(receivedMethod).toBe("GET");
  });

  it("no fetchea cuando enabled es false", () => {
    let callCount = 0;
    server.use(
      http.get("/playbooks/:id", () => {
        callCount++;
        return HttpResponse.json(playbook);
      }),
    );

    renderHook(() => usePlaybook("angel", { enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(callCount).toBe(0);
  });

  it("no reintenta ante un 404: no es un error transitorio", async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    let callCount = 0;
    server.use(
      http.get("/playbooks/:id", () => {
        callCount++;
        return HttpResponse.json({}, { status: 404 });
      }),
    );

    const { result } = renderHook(() => usePlaybook("angel"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(callCount).toBe(1);
  });

  it("keyea la query por id", () => {
    expect(playbookQueryKey("angel")).toEqual(["playbooks", "detail", "angel"]);
  });
});
