import React, { useId } from "react";
import { clsx } from "clsx";

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
  labelProps: Omit<JSX.IntrinsicElements["label"], "className">;
  inputProps: Omit<JSX.IntrinsicElements["input"], "className">;
  errors?: ListOfErrors;
  className?: string;
}) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={clsx("flex flex-col", className)}>
      <label
        htmlFor={id}
        {...labelProps}
        className="text-brand-deep-purple font-bold"
      />
      <input
        id={id}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...inputProps}
        className="border-b-brand-deep-purple !text-brand-gray rounded-none border-b p-2 font-normal"
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
    <button
      {...props}
      className={clsx(
        props.className,
        "rounded bg-cyan-600 text-xl font-medium text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:bg-cyan-600/50"
      )}
      disabled={props.disabled || state !== "idle"}
    >
      <span>{state === "submitting" ? submittingText : props.children}</span>
    </button>
  );
}
