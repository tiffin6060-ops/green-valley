"use client";

/** A one-button form that asks "are you sure?" before running a destructive server action. */
export default function ConfirmDeleteForm({
  action, id, label, confirmText,
}: {
  action: (fd: FormData) => Promise<void>;
  id: string;
  label: string;
  confirmText: string;
}) {
  return (
    <form action={action} onSubmit={(e) => { if (!window.confirm(confirmText)) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button className="mini-btn danger" type="submit">{label}</button>
    </form>
  );
}
