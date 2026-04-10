import styles from "../../styles/AdminPage.module.css";

type Props = {
  activeTab: "add" | "manage";
  setActiveTab: (tab: "add" | "manage") => void;
  onLogout: () => Promise<void>;
  authLoading: boolean;
};

export function AdminTopBar({ activeTab, setActiveTab, onLogout, authLoading }: Props) {
  return (
    <section className={styles.card}>
      <div className={styles.actions}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === "add" ? styles.activeTab : ""}`}
            type="button"
            onClick={() => setActiveTab("add")}
          >
            Lägg till
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "manage" ? styles.activeTab : ""}`}
            type="button"
            onClick={() => setActiveTab("manage")}
          >
            Hantera
          </button>
        </div>
        <button className={styles.button} type="button" onClick={onLogout} disabled={authLoading}>
          Logga ut
        </button>
      </div>
    </section>
  );
}
