import { describe, expect, it } from "vitest";

import { FieldType } from "@/lib/types";
import { MOCK_PLAYBOOKS, getMockPlaybook } from "./playbooks";

function allFields(playbookIndex: number) {
  return MOCK_PLAYBOOKS[playbookIndex].template.flatMap(
    (section) => section.fields ?? [],
  );
}

describe("MOCK_PLAYBOOKS", () => {
  it("exposes playbooks with unique ids", () => {
    const ids = MOCK_PLAYBOOKS.map((playbook) => playbook.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThan(0);
  });

  it("collectively covers every FieldType", () => {
    const usedTypes = new Set(
      MOCK_PLAYBOOKS.flatMap((playbook) =>
        playbook.template.flatMap((section) =>
          (section.fields ?? []).map((field) => field.type),
        ),
      ),
    );
    for (const type of Object.values(FieldType)) {
      expect(usedTypes).toContain(type);
    }
  });

  it("only sets maxValue on COUNTER/PROGRESS fields", () => {
    const withMax = MOCK_PLAYBOOKS.flatMap((playbook) =>
      playbook.template.flatMap((section) =>
        (section.fields ?? []).filter((field) => field.maxValue !== undefined),
      ),
    );
    for (const field of withMax) {
      expect([FieldType.COUNTER, FieldType.PROGRESS]).toContain(field.type);
    }
  });

  it("gives every SELECT/RADIO field a non-empty options list", () => {
    const choiceFields = MOCK_PLAYBOOKS.flatMap((playbook) =>
      playbook.template.flatMap((section) =>
        (section.fields ?? []).filter(
          (field) =>
            field.type === FieldType.SELECT || field.type === FieldType.RADIO,
        ),
      ),
    );
    expect(choiceFields.length).toBeGreaterThan(0);
    for (const field of choiceFields) {
      expect(field.options?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("keeps the Guerrero template rich enough to exercise every field type", () => {
    const guerrero = getMockPlaybook("guerrero");
    expect(guerrero).toBeDefined();
    const types = new Set(allFields(0).map((field) => field.type));
    for (const type of Object.values(FieldType)) {
      expect(types).toContain(type);
    }
  });
});

describe("getMockPlaybook", () => {
  it("returns the matching playbook", () => {
    expect(getMockPlaybook("guerrero")?.name).toBe("Guerrero");
  });

  it("returns undefined for an unknown or missing id", () => {
    expect(getMockPlaybook("does-not-exist")).toBeUndefined();
    expect(getMockPlaybook(undefined)).toBeUndefined();
  });
});
