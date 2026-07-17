import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup, configure } from "@testing-library/react";

// La instrumentación de `--coverage` ralentiza el render y el flush de
// react-query; con el timeout default de 1000ms de los `findBy*`/`waitFor` la
// espera async se vuelve dependiente de la máquina → flaky en CI. Subimos el
// timeout async global para que la corrida con cobertura sea estable sin
// parchear test por test (el `testTimeout` de vitest.config.mts le deja aire).
configure({ asyncUtilTimeout: 5000 });

afterEach(() => {
  cleanup();
});
