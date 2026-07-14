import { describe, expect, it } from "vitest";

import { SAMPLE_CHARACTERS } from "./sampleCharacters";

describe("SAMPLE_CHARACTERS", () => {
  it("tiene más de tres personajes, para que la home pueda mostrar un subconjunto", () => {
    expect(SAMPLE_CHARACTERS.length).toBeGreaterThan(3);
  });

  it("cada personaje tiene ids únicos y los campos requeridos completos", () => {
    const ids = new Set(SAMPLE_CHARACTERS.map((character) => character.id));
    expect(ids.size).toBe(SAMPLE_CHARACTERS.length);

    for (const character of SAMPLE_CHARACTERS) {
      expect(character.name).toBeTruthy();
      expect(character.playbookName).toBeTruthy();
      expect(character.gameName).toBeTruthy();
      expect(character.createdAt).toBeTruthy();
      expect(character.updatedAt).toBeTruthy();
    }
  });

  it("incluye al menos un personaje con campaña y uno sin campaña", () => {
    expect(SAMPLE_CHARACTERS.some((character) => character.campaignName)).toBe(
      true,
    );
    expect(SAMPLE_CHARACTERS.some((character) => !character.campaignName)).toBe(
      true,
    );
  });

  it("está ordenado por updatedAt descendente", () => {
    const updatedTimestamps = SAMPLE_CHARACTERS.map((character) =>
      new Date(character.updatedAt).getTime(),
    );
    const sorted = [...updatedTimestamps].sort((a, b) => b - a);
    expect(updatedTimestamps).toEqual(sorted);
  });
});
