import styles from "./SearchBar.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className={styles.wrapper}>
      <span aria-hidden className={styles.icon}>
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search product or brand..."
        className={styles.input}
      />
    </div>
  );
}
