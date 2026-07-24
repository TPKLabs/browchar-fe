import { CHARACTER, CHARACTER_LIST_ITEM, PLAYBOOK } from "./fixtures";
import {
  mockCharacterDetail,
  mockCharactersList,
  mockDeleteCharacter,
  mockPlaybookDetail,
} from "./mocks";
import { expect, test } from "./test";

test("elimina un personaje desde el detalle y vuelve al listado", async ({
  page,
}) => {
  await mockCharacterDetail(page, CHARACTER);
  await mockPlaybookDetail(page, PLAYBOOK);
  await mockCharactersList(page, {
    data: [],
    meta: { page: 1, pageSize: 20, total: 0 },
  });

  let deleteCalls = 0;
  await mockDeleteCharacter(page, () => {
    deleteCalls += 1;
    return { status: 204 };
  });

  await page.goto(`/characters/${CHARACTER.id}`);
  await expect(page.getByLabel("Nombre")).toHaveValue(CHARACTER.name);

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toBe(`¿Eliminar a ${CHARACTER.name}?`);
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Eliminar" }).click();

  await expect(page).toHaveURL("/characters");
  await expect(
    page.getByText("Todavía no creaste ningún personaje."),
  ).toBeVisible();
  expect(deleteCalls).toBe(1);
});

test("elimina un personaje desde la tarjeta del listado y llega al estado vacío", async ({
  page,
}) => {
  // Listado con estado: la primera GET trae el personaje; tras el DELETE, el
  // invalidate en segundo plano refetchea y ya no debe venir. Es justo donde se
  // cruzan el estado local de la tarjeta y la cache de Query (lo que los tests
  // unitarios aislados no verifican).
  let deleted = false;
  await mockCharactersList(page, () =>
    deleted
      ? { data: [], meta: { page: 1, pageSize: 20, total: 0 } }
      : {
          data: [CHARACTER_LIST_ITEM],
          meta: { page: 1, pageSize: 20, total: 1 },
        },
  );

  let deleteCalls = 0;
  await mockDeleteCharacter(page, () => {
    deleteCalls += 1;
    deleted = true;
    return { status: 204 };
  });

  await page.goto("/characters");
  const main = page.getByRole("main");
  await expect(main.getByText(CHARACTER.name)).toBeVisible();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toBe(`¿Eliminar a ${CHARACTER.name}?`);
    await dialog.accept();
  });
  await main.getByRole("button", { name: "Eliminar personaje" }).click();

  await expect(
    page.getByText("Todavía no creaste ningún personaje."),
  ).toBeVisible();
  await expect(main.getByText(CHARACTER.name)).toHaveCount(0);
  expect(deleteCalls).toBe(1);
});
