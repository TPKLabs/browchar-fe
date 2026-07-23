import { CHARACTER, CHARACTER_LIST_ITEM, PLAYBOOK } from "./fixtures";
import {
  mockCharacterDetail,
  mockCharactersList,
  mockPlaybookDetail,
} from "./mocks";
import { expect, test } from "./test";

test("lista los personajes y navega al detalle de uno", async ({ page }) => {
  await mockCharactersList(page, {
    data: [CHARACTER_LIST_ITEM],
    meta: { page: 1, pageSize: 20, total: 1 },
  });

  await page.goto("/characters");

  await expect(page.getByText(CHARACTER.name)).toBeVisible();
  await expect(page.getByText(PLAYBOOK.name)).toBeVisible();
  await expect(page.getByText(PLAYBOOK.game.gameName)).toBeVisible();

  await mockCharacterDetail(page, CHARACTER);
  await mockPlaybookDetail(page, PLAYBOOK);

  await page.getByRole("button", { name: "Ver detalle" }).click();

  await expect(page).toHaveURL(`/characters/${CHARACTER.id}`);
  await expect(page.getByLabel("Nombre")).toHaveValue(CHARACTER.name);
  await expect(page.getByLabel("Concepto")).toHaveValue(
    CHARACTER.values.concepto,
  );
});

test("muestra el estado vacío cuando no hay personajes", async ({ page }) => {
  await mockCharactersList(page, {
    data: [],
    meta: { page: 1, pageSize: 20, total: 0 },
  });

  await page.goto("/characters");

  await expect(
    page.getByText("Todavía no creaste ningún personaje."),
  ).toBeVisible();
});
