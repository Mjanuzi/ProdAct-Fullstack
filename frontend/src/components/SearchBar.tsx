type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search product or brand..."
      style={{
        width: "100%",
        padding: 12,
        fontSize: 16,
        boxSizing: "border-box",
        marginBottom: 12,
      }}
    />
  );
}
