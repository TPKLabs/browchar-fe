import { PLAYBOOK } from "./fixtures";
import { mockCreateCharacter, mockPlaybooksList } from "./mocks";
import { expect, test } from "./test";

test.describe("Crear personaje", () => {
  test("elige juego y playbook, completa la ficha y crea el personaje", async ({
    page,
  }) => {
    await mockPlaybooksList(page, [PLAYBOOK]);

    await page.goto("/characters/new");

    await page.getByLabel("Juego").click();
    await page.getByRole("option", { name: PLAYBOOK.game.gameName }).click();

    await page.getByLabel("Playbook").click();
    await page.getByRole("option", { name: PLAYBOOK.name }).click();

    await page.getByLabel("Nombre").fill("Aria");
    await page.getByLabel("Concepto").fill("Una guerrera errante");

    let receivedBody: unknown;
    await mockCreateCharacter(page, (body) => {
      receivedBody = body;
      return {
        json: {
          id: "char-1",
          name: "Aria",
          ownerId: "usr_demo",
          playbookId: PLAYBOOK.id,
          playbookVersion: PLAYBOOK.version,
          values: { concepto: "Una guerrera errante" },
          createdAt: "2026-01-15T12:00:00.000Z",
          updatedAt: "2026-01-15T12:00:00.000Z",
          deletedAt: null,
        },
      };
    });

    // Scopeado a <main>: la navbar también tiene un CTA "Crear personaje"
    // (link a /characters/new) con el mismo texto que el submit del form.
    await page
      .getByRole("main")
      .getByRole("button", { name: "Crear personaje" })
      .click();

    await expect(page.getByText("Personaje «Aria» creado.")).toBeVisible();
    // "Ver personaje" es un <a> estilizado como botón: la lib de UI fuerza
    // role="button" con nativeButton={false} (ver useButton en @base-ui/react).
    await expect(
      page.getByRole("button", { name: "Ver personaje" }),
    ).toHaveAttribute("href", "/characters/char-1");

    expect(receivedBody).toEqual({
      name: "Aria",
      playbookId: PLAYBOOK.id,
      ownerId: "usr_demo",
      values: { concepto: "Una guerrera errante" },
    });
  });

  test("muestra el error del back si la creación falla", async ({ page }) => {
    await mockPlaybooksList(page, [PLAYBOOK]);

    await page.goto("/characters/new");

    await page.getByLabel("Juego").click();
    await page.getByRole("option", { name: PLAYBOOK.game.gameName }).click();
    await page.getByLabel("Playbook").click();
    await page.getByRole("option", { name: PLAYBOOK.name }).click();

    await page.getByLabel("Nombre").fill("Aria");
    await page.getByLabel("Concepto").fill("Una guerrera errante");

    await mockCreateCharacter(page, () => ({
      status: 400,
      json: {
        message: "Los datos del personaje no son válidos para el Playbook",
        errors: [{ field: "concepto", message: "concepto es requerido" }],
      },
    }));

    // Scopeado a <main>: la navbar también tiene un CTA "Crear personaje"
    // (link a /characters/new) con el mismo texto que el submit del form.
    await page
      .getByRole("main")
      .getByRole("button", { name: "Crear personaje" })
      .click();

    await expect(
      page.getByText("Los datos del personaje no son válidos para el Playbook"),
    ).toBeVisible();
  });
});
