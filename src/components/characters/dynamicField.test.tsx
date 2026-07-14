import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { FieldType, type FieldDefinition } from "@/types";
import { DynamicField } from "./dynamicField";
import type { CharacterFormValues } from "@/schemas/characterSchema";

function Harness({ field, error }: { field: FieldDefinition; error?: string }) {
  const { control } = useForm<CharacterFormValues>({
    defaultValues: {
      name: "",
      values: { [field.id]: field.type === FieldType.CHECKBOX ? false : "" },
    },
  });
  return <DynamicField field={field} control={control} error={error} />;
}

describe("DynamicField", () => {
  it("renders a text input for TEXT", () => {
    render(
      <Harness
        field={{ id: "concepto", label: "Concepto", type: FieldType.TEXT }}
      />,
    );
    expect(screen.getByLabelText("Concepto")).toBeInTheDocument();
  });

  it("renders a textarea for TEXTAREA", () => {
    render(
      <Harness
        field={{ id: "historia", label: "Historia", type: FieldType.TEXTAREA }}
      />,
    );
    expect(screen.getByLabelText("Historia").tagName).toBe("TEXTAREA");
  });

  it("renders a numeric input honoring maxValue for PROGRESS", () => {
    render(
      <Harness
        field={{
          id: "pv",
          label: "PV",
          type: FieldType.PROGRESS,
          maxValue: 20,
        }}
      />,
    );
    const input = screen.getByLabelText("PV");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("max", "20");
  });

  it("renders a checkbox for CHECKBOX", () => {
    render(
      <Harness
        field={{ id: "insp", label: "Inspirado", type: FieldType.CHECKBOX }}
      />,
    );
    expect(
      screen.getByRole("checkbox", { name: /Inspirado/ }),
    ).toBeInTheDocument();
  });

  it("renders a radio option per choice for RADIO", () => {
    render(
      <Harness
        field={{
          id: "rol",
          label: "Rol",
          type: FieldType.RADIO,
          options: [
            { label: "Tanque", value: "tanque" },
            { label: "DPS", value: "dps" },
          ],
        }}
      />,
    );
    expect(screen.getByRole("radio", { name: "Tanque" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "DPS" })).toBeInTheDocument();
  });

  it("renders a select trigger with placeholder for SELECT", () => {
    render(
      <Harness
        field={{
          id: "clase",
          label: "Clase",
          type: FieldType.SELECT,
          options: [{ label: "Guerrero", value: "guerrero" }],
        }}
      />,
    );
    expect(screen.getByText("Elegí una opción")).toBeInTheDocument();
  });

  it("marks required fields and shows the error message", () => {
    render(
      <Harness
        field={{
          id: "concepto",
          label: "Concepto",
          type: FieldType.TEXT,
          required: true,
        }}
        error="Concepto es obligatorio"
      />,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("Concepto es obligatorio")).toBeInTheDocument();
    expect(screen.getByLabelText(/Concepto/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("renders read-only fields as static text, not an input", () => {
    render(
      <Harness
        field={{
          id: "rules",
          label: "Reglas",
          type: FieldType.TEXTAREA,
          isReadOnly: true,
          defaultValue: "No se puede editar",
        }}
      />,
    );
    expect(screen.getByText("No se puede editar")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
