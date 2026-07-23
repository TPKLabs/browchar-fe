import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup, configure } from "@testing-library/react";
import { server } from "@/mocks/server";

// La instrumentación de `--coverage` ralentiza el render y el flush de
// react-query; con el timeout default de 1000ms de los `findBy*`/`waitFor` la
// espera async se vuelve dependiente de la máquina → flaky en CI. Subimos el
// timeout async global para que la corrida con cobertura sea estable sin
// parchear test por test (el `testTimeout` de vitest.config.mts le deja aire).
configure({ asyncUtilTimeout: 5000 });

// MSW (DEV-200): intercepta `fetch` a nivel de red durante toda la suite.
// `onUnhandledRequest: "error"` hace fallar el test ante una request sin
// handler en vez de pegarle a la red real o devolver un 500 silencioso.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
