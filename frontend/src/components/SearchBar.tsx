type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
  return (
    <div style={{ position: "relative", marginBottom: 12 }}>
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: "rgba(255, 255, 255, 0.8)",
          pointerEvents: "none",
          fontSize: 16,
        }}
      >
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search product or brand..."
        style={{
          width: "100%",
          padding: "12px 14px 12px 42px",
          fontSize: 16,
          borderRadius: 14,
          border: "1px solid rgba(255, 255, 255, 0.9)",
          background: "rgba(22, 22, 22, 0.75)",
          color: "#fff",
          boxSizing: "border-box",
          outline: "none",
        }}
      />
    </div>
  );
}
