import React, { useId } from "react";
import { cn } from "~/utils/misc";
import { Input, type InputProps } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "./ui/button";

export type ListOfErrors = Array<string | null | undefined> | null | undefined;

export function ErrorList({
  id,
  errors
}: {
  errors?: ListOfErrors;
  id?: string;
}) {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) return null;
  return (
    <ul id={id} className="space-y-1">
      {errorsToRender.map((e) => (
        <li key={e} className="text-brand-danger text-xs">
          {e}
        </li>
      ))}
    </ul>
  );
}

export function Field({
  labelProps,
  inputProps,
  errors,
  className
}: {
  labelProps: Omit<(typeof Label)["propTypes"], "className">;
  inputProps: Omit<InputProps, "className">;
  errors?: ListOfErrors;
  className?: string;
}) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} {...labelProps} />
      <Input
        id={id}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...inputProps}
      />
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
      </div>
    </div>
  );
}

export function SubmitButton({
  state = "idle",
  submittingText = "Submitting...",
  ...props
}: React.ComponentPropsWithRef<"button"> & {
  state?: "idle" | "submitting" | "loading";
  submittingText?: string;
}) {
  return (
    <Button
      {...props}
      className={props.className}
      disabled={props.disabled || state !== "idle"}
    >
      <span>{state === "submitting" ? submittingText : props.children}</span>
    </Button>
  );
}
