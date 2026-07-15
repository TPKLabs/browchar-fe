import { describe, expect, it } from "vitest";

import type { CharacterListItem } from "@/types";
import { toCharacterSummary } from "./toCharacterSummary";

const ITEM: CharacterListItem = {
  id: "char_1",
  name: "Doc",
  ownerId: "usr_demo",
  values: { moves: ["Angel Special"] },
  createdAt: "2026-04-01T09:30:00.000Z",
  updatedAt: "2026-04-28T18:00:00.000Z",
  deletedAt: null,
  playbookId: "pb_angel",
  playbookVersion: 1,
  playbookName: "Angel",
  gameName: "Apocalypse World",
};

describe("toCharacterSummary", () => {
  it("mapea los campos que consume la card", () => {
    expect(toCharacterSummary(ITEM)).toEqual({
      id: "char_1",
      name: "Doc",
      playbookName: "Angel",
      gameName: "Apocalypse World",
      createdAt: "2026-04-01T09:30:00.000Z",
      updatedAt: "2026-04-28T18:00:00.000Z",
    });
  });

  it("no propaga campos crudos que la card no usa", () => {
    const summary = toCharacterSummary(ITEM);
    expect(summary).not.toHaveProperty("values");
    expect(summary).not.toHaveProperty("ownerId");
    expect(summary).not.toHaveProperty("playbookId");
  });

  it("deja campaignName indefinido (la API todavía no lo resuelve)", () => {
    expect(toCharacterSummary(ITEM).campaignName).toBeUndefined();
  });
});
