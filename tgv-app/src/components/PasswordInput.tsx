"use client";
import { useState, type InputHTMLAttributes } from "react";

/** Password field with a Show / Hide toggle. Takes the same props as <input>. */
export default function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-field">
      <input {...props} type={show ? "text" : "password"} />
      <button
        type="button"
        className="pw-toggle"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        onClick={() => setShow((s) => !s)}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
