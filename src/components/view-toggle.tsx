type ViewToggleProps = {
  value: "grid" | "list";
  onChange: (value: "grid" | "list") => void;
};

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="surface-panel inline-flex rounded-full p-1">
      {(["grid", "list"] as const).map((mode) => (
        <button
          className={`rounded-full px-4 py-2 text-sm transition ${
            value === mode
              ? "bg-[var(--surface-dark)] text-white"
              : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
          }`}
          key={mode}
          onClick={() => onChange(mode)}
          type="button"
        >
          {mode === "grid" ? "Grid" : "List"}
        </button>
      ))}
    </div>
  );
}
