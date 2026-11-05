"use client";

/** Submit button that asks for confirmation before a destructive action. */
export default function ConfirmButton({ children, message = "Silmək istədiyinizə əminsiniz?", className = "abtn abtn-sm abtn-danger" }: { children: React.ReactNode; message?: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
