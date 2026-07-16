import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";

import { playbookQueryKey, usePlaybook } from "./usePlaybook";

function mockResponse(status: number, body?: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? "" : JSON.stringify(body)),
  } as Response;
}

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
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("trae el playbook desde GET /playbooks/:id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(200, playbook));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePlaybook("angel"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(playbook);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/playbooks/angel");
    expect(init.method).toBe("GET");
  });

  it("no fetchea cuando enabled es false", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderHook(() => usePlaybook("angel", { enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("no reintenta ante un 404: no es un error transitorio", async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    const fetchMock = vi.fn().mockResolvedValue(mockResponse(404));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePlaybook("angel"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keyea la query por id", () => {
    expect(playbookQueryKey("angel")).toEqual(["playbooks", "detail", "angel"]);
  });
});
