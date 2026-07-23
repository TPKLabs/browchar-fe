import { CHARACTER, PLAYBOOK } from "./fixtures";
import {
  mockCharacterDetail,
  mockPlaybookDetail,
  mockUpdateCharacter,
} from "./mocks";
import { expect, test } from "./test";

test("edita el nombre de un personaje y guarda el cambio", async ({ page }) => {
  await mockCharacterDetail(page, CHARACTER);
  await mockPlaybookDetail(page, PLAYBOOK);

  await page.goto(`/characters/${CHARACTER.id}`);

  const nameInput = page.getByLabel("Nombre");
  await expect(nameInput).toHaveValue(CHARACTER.name);

  const saveButton = page.getByRole("button", { name: "Guardar cambios" });
  // Deshabilitado hasta que el form quede dirty (ver CharacterDetail, DEV-51).
  await expect(saveButton).toBeDisabled();

  let receivedBody: unknown;
  await mockUpdateCharacter(page, (body) => {
    receivedBody = body;
    return {
      json: { ...CHARACTER, name: "Aria Actualizada" },
    };
  });

  await nameInput.fill("Aria Actualizada");
  await expect(saveButton).toBeEnabled();
  await saveButton.click();

  // Al guardar OK, `reset(data)` deja el form limpio otra vez (isDirty=false)
  // y el botón vuelve a deshabilitarse — es la señal observable de éxito.
  await expect(saveButton).toBeDisabled();
  await expect(nameInput).toHaveValue("Aria Actualizada");
  expect(receivedBody).toMatchObject({ name: "Aria Actualizada" });
});

test("muestra un error si el guardado falla", async ({ page }) => {
  await mockCharacterDetail(page, CHARACTER);
  await mockPlaybookDetail(page, PLAYBOOK);

  await page.goto(`/characters/${CHARACTER.id}`);

  const nameInput = page.getByLabel("Nombre");
  await expect(nameInput).toHaveValue(CHARACTER.name);

  await mockUpdateCharacter(page, () => ({
    status: 404,
    json: { message: `Character ${CHARACTER.id} no encontrado` },
  }));

  await nameInput.fill("Aria Actualizada");
  await page.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(
    page.getByText("Este personaje no existe o fue eliminado."),
  ).toBeVisible();
});

test("Cancelar descarta los cambios sin guardar", async ({ page }) => {
  await mockCharacterDetail(page, CHARACTER);
  await mockPlaybookDetail(page, PLAYBOOK);

  await page.goto(`/characters/${CHARACTER.id}`);

  const nameInput = page.getByLabel("Nombre");
  await nameInput.fill("Nombre sin guardar");

  await page.getByRole("button", { name: "Cancelar" }).click();

  await expect(nameInput).toHaveValue(CHARACTER.name);
});
