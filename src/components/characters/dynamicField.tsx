"use client";

import { Controller, type Control } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radioGroup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FieldType, type FieldDefinition } from "@/types";
import type { CharacterFormValues } from "@/schemas/characterSchema";

interface DynamicFieldProps {
  field: FieldDefinition;
  control: Control<CharacterFormValues>;
  /** Mensaje de error de validación para este campo, si hay. */
  error?: string;
}

/** Asterisco de campo obligatorio, oculto para lectores de pantalla. */
function RequiredMark({ required }: { required?: boolean }) {
  return required ? (
    <span className="text-destructive" aria-hidden>
      *
    </span>
  ) : null;
}

/**
 * Renderiza un campo del template del Playbook según su `FieldType` (DEV-50),
 * cableado a react-hook-form vía `Controller`. El nombre en el form es
 * `values.<field.id>` para agrupar todos los campos dinámicos bajo `values`.
 */
export function DynamicField({ field, control, error }: DynamicFieldProps) {
  const name = `values.${field.id}` as const;
  const controlId = `field-${field.id}`;
  const describedBy =
    [
      field.description ? `${controlId}-desc` : null,
      error ? `${controlId}-error` : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  // Texto plano de solo-lectura (ej. Additional Rules): no es un input editable.
  if (field.isReadOnly) {
    return (
      <div className="group/field flex flex-col gap-1.5">
        <Label>{field.label}</Label>
        <p className="text-muted-foreground text-sm whitespace-pre-line">
          {String(field.defaultValue ?? field.description ?? "")}
        </p>
      </div>
    );
  }

  const labelNode = (
    <Label htmlFor={controlId}>
      {field.label}
      <RequiredMark required={field.required} />
    </Label>
  );

  const description = field.description ? (
    <p id={`${controlId}-desc`} className="text-muted-foreground text-xs">
      {field.description}
    </p>
  ) : null;

  const errorNode = error ? (
    <p
      id={`${controlId}-error`}
      role="alert"
      className="text-destructive text-xs"
    >
      {error}
    </p>
  ) : null;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: rhf }) => {
        const invalid = Boolean(error);

        // CHECKBOX: control + label en línea.
        if (field.type === FieldType.CHECKBOX) {
          return (
            <div className="group/field flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={controlId}
                  checked={Boolean(rhf.value)}
                  onCheckedChange={(checked) => rhf.onChange(checked)}
                  onBlur={rhf.onBlur}
                  disabled={field.disabled}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                />
                <Label htmlFor={controlId}>
                  {field.label}
                  <RequiredMark required={field.required} />
                </Label>
              </div>
              {description}
              {errorNode}
            </div>
          );
        }

        let control: React.ReactNode;

        switch (field.type) {
          case FieldType.TEXTAREA:
            control = (
              <Textarea
                id={controlId}
                value={String(rhf.value ?? "")}
                onChange={rhf.onChange}
                onBlur={rhf.onBlur}
                disabled={field.disabled}
                aria-invalid={invalid}
                aria-describedby={describedBy}
              />
            );
            break;

          case FieldType.TEXTNUMBER:
          case FieldType.COUNTER:
          case FieldType.PROGRESS:
            control = (
              <Input
                id={controlId}
                type="number"
                min={0}
                max={field.maxValue}
                value={String(rhf.value ?? "")}
                onChange={rhf.onChange}
                onBlur={rhf.onBlur}
                disabled={field.disabled}
                aria-invalid={invalid}
                aria-describedby={describedBy}
              />
            );
            break;

          case FieldType.SELECT: {
            const options = field.options ?? [];
            control = (
              <Select
                value={String(rhf.value ?? "")}
                onValueChange={(value) => rhf.onChange(value)}
              >
                <SelectTrigger
                  id={controlId}
                  className="w-full"
                  disabled={field.disabled}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                >
                  <SelectValue>
                    {(value) =>
                      options.find((option) => option.value === value)?.label ??
                      "Elegí una opción"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
            break;
          }

          case FieldType.RADIO: {
            const options = field.options ?? [];
            control = (
              <RadioGroup
                value={String(rhf.value ?? "")}
                onValueChange={(value) => rhf.onChange(value)}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                aria-labelledby={controlId}
              >
                {options.map((option) => (
                  <Label
                    key={option.value}
                    className="font-normal"
                    htmlFor={`${controlId}-${option.value}`}
                  >
                    <RadioGroupItem
                      id={`${controlId}-${option.value}`}
                      value={option.value}
                      disabled={field.disabled}
                    />
                    {option.label}
                  </Label>
                ))}
              </RadioGroup>
            );
            break;
          }

          // TEXT y fallback.
          default:
            control = (
              <Input
                id={controlId}
                value={String(rhf.value ?? "")}
                onChange={rhf.onChange}
                onBlur={rhf.onBlur}
                disabled={field.disabled}
                aria-invalid={invalid}
                aria-describedby={describedBy}
              />
            );
        }

        return (
          <div className="group/field flex flex-col gap-1.5">
            {field.type === FieldType.RADIO ? (
              <span
                id={controlId}
                className="flex items-center gap-2 text-sm leading-none font-medium"
              >
                {field.label}
                <RequiredMark required={field.required} />
              </span>
            ) : (
              labelNode
            )}
            {description}
            {control}
            {errorNode}
          </div>
        );
      }}
    />
  );
}
