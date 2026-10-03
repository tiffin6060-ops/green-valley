"use client";
import { startTransition, useActionState, useState } from "react";
import type { FormState } from "@/app/(app)/auth-actions";

// Wraps a server action in a <form>. Uses onSubmit (not the `action` prop) so React does NOT wipe the
// fields after a failed submit; on success the form remounts (fields cleared) unless resetOnOk=false.
export default function ActionForm({
  action, children, submit, className, resetOnOk = true,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  children: React.ReactNode; submit: string; className?: string; resetOnOk?: boolean;
}) {
  const [state, act, pending] = useActionState(action, { ok: false, message: "" });
  const [localErr, setLocalErr] = useState("");
  return (
    <form
      className={className}
      key={resetOnOk && state.ok ? state.message : "f"}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const tooBig = [...fd.values()].some((v) => v instanceof File && v.size > 15 * 1024 * 1024);
        if (tooBig) return setLocalErr("File is larger than 15 MB.");
        setLocalErr("");
        startTransition(() => act(fd));
      }}
    >
      {children}
      <button className="btn dark" type="submit" disabled={pending}>{pending ? "Please wait…" : submit}</button>
      {localErr && <p className="msg-err" role="status">{localErr}</p>}
      {!localErr && state.message && <p className={state.ok ? "msg-ok" : "msg-err"} role="status">{state.message}</p>}
    </form>
  );
}
