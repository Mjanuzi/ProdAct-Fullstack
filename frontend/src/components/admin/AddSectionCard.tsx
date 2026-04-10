import styles from "../../styles/AdminPage.module.css";
import type { AisleOption, SectionOption, ShelfOption } from "../../api/admin";

type AddTab = "product" | "aisle" | "section" | "shelf";

type Props = {
  busy: boolean;
  addTab: AddTab;
  setAddTab: (tab: AddTab) => void;
  ean: string;
  setEan: (value: string) => void;
  addAisleId: string;
  setAddAisleId: (value: string) => void;
  addSectionId: string;
  setAddSectionId: (value: string) => void;
  addShelfId: string;
  setAddShelfId: (value: string) => void;
  aisles: AisleOption[];
  addSections: SectionOption[];
  addShelves: ShelfOption[];
  newAisleName: string;
  setNewAisleName: (value: string) => void;
  newSectionName: string;
  setNewSectionName: (value: string) => void;
  newShelfName: string;
  setNewShelfName: (value: string) => void;
  onCreateProduct: (e: React.FormEvent) => Promise<void>;
  onCreateAisle: (e: React.FormEvent) => Promise<void>;
  onCreateSection: (e: React.FormEvent) => Promise<void>;
  onCreateShelf: (e: React.FormEvent) => Promise<void>;
};

export function AddSectionCard({
  busy,
  addTab,
  setAddTab,
  ean,
  setEan,
  addAisleId,
  setAddAisleId,
  addSectionId,
  setAddSectionId,
  addShelfId,
  setAddShelfId,
  aisles,
  addSections,
  addShelves,
  newAisleName,
  setNewAisleName,
  newSectionName,
  setNewSectionName,
  newShelfName,
  setNewShelfName,
  onCreateProduct,
  onCreateAisle,
  onCreateSection,
  onCreateShelf,
}: Props) {
  return (
    <section className={styles.card}>
      <h2 className={styles.subTitle}>Lägg till</h2>
      <div className={styles.addTabs}>
        <button
          className={`${styles.tabButton} ${addTab === "product" ? styles.activeTab : ""}`}
          type="button"
          onClick={() => setAddTab("product")}
        >
          Produkt
        </button>
        <button
          className={`${styles.tabButton} ${addTab === "aisle" ? styles.activeTab : ""}`}
          type="button"
          onClick={() => setAddTab("aisle")}
        >
          Gång
        </button>
        <button
          className={`${styles.tabButton} ${addTab === "section" ? styles.activeTab : ""}`}
          type="button"
          onClick={() => setAddTab("section")}
        >
          Sektion
        </button>
        <button
          className={`${styles.tabButton} ${addTab === "shelf" ? styles.activeTab : ""}`}
          type="button"
          onClick={() => setAddTab("shelf")}
        >
          Hylla
        </button>
      </div>

      {addTab === "product" ? (
        <form onSubmit={onCreateProduct} className={styles.row}>
          <input
            className={styles.input}
            value={ean}
            onChange={(e) => setEan(e.target.value)}
            placeholder="EAN"
            disabled={busy}
          />
          <select
            className={styles.select}
            value={addAisleId}
            onChange={(e) => setAddAisleId(e.target.value)}
            disabled={busy || aisles.length === 0}
          >
            <option value="">Välj gång</option>
            {aisles.map((aisle) => (
              <option key={aisle.id} value={aisle.id}>
                {aisle.name} ({aisle.code})
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={addSectionId}
            onChange={(e) => setAddSectionId(e.target.value)}
            disabled={busy || addSections.length === 0}
          >
            <option value="">Välj sektion</option>
            {addSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={addShelfId}
            onChange={(e) => setAddShelfId(e.target.value)}
            disabled={busy || addShelves.length === 0}
          >
            <option value="">Välj hylla</option>
            {addShelves.map((shelf) => (
              <option key={shelf.id} value={shelf.id}>
                {shelf.name}
              </option>
            ))}
          </select>
          <button className={styles.button} type="submit" disabled={busy}>
            Lägg till produkt
          </button>
        </form>
      ) : null}

      {addTab === "aisle" ? (
        <form onSubmit={onCreateAisle} className={styles.row}>
          <h3 className={styles.subTitle}>Skapa gång</h3>
          <input
            className={styles.input}
            value={newAisleName}
            onChange={(e) => setNewAisleName(e.target.value)}
            placeholder="Gång namn"
            disabled={busy}
          />
          <button className={styles.button} type="submit" disabled={busy}>
            Lägg till gång
          </button>
        </form>
      ) : null}

      {addTab === "section" ? (
        <form onSubmit={onCreateSection} className={styles.row}>
          <h3 className={styles.subTitle}>Skapa sektion</h3>
          <input
            className={styles.input}
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Sektion namn(Mejeri, Frukt etc.)"
            disabled={busy}
          />
          <button className={styles.button} type="submit" disabled={busy}>
            Lägg till sektion
          </button>
        </form>
      ) : null}

      {addTab === "shelf" ? (
        <form onSubmit={onCreateShelf} className={styles.row}>
          <h3 className={styles.subTitle}>Skapa hylla</h3>
          <input
            className={styles.input}
            value={newShelfName}
            onChange={(e) => setNewShelfName(e.target.value)}
            placeholder="Hyllnamn"
            disabled={busy}
          />
          <button className={styles.button} type="submit" disabled={busy}>
            Lägg till hylla
          </button>
        </form>
      ) : null}
    </section>
  );
}
