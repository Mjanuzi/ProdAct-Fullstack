import styles from "../../styles/AdminPage.module.css";

type Props = {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  authLoading: boolean;
  onLogin: (e: React.FormEvent) => Promise<void>;
};

export function AdminLoginCard({
  email,
  setEmail,
  password,
  setPassword,
  authLoading,
  onLogin,
}: Props) {
  return (
    <section className={styles.card}>
      <h2>Inloggning</h2>
      <form onSubmit={onLogin} className={styles.row}>
        <input
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          required
        />
        <input
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Lösenord"
          required
        />
        <div className={styles.actions}>
          <button className={styles.button} type="submit" disabled={authLoading}>
            {authLoading ? "Loggar in..." : "Logga in"}
          </button>
        </div>
      </form>
    </section>
  );
}
