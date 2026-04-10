import styles from "../../styles/AdminPage.module.css";
import type { AisleOption, SectionOption, ShelfOption } from "../../api/admin";
import type { ProductDto, ProductLocationDto } from "../../types/product";

type ManageTab = "product" | "location";

type Props = {
  searchLoading: boolean;
  query: string;
  setQuery: (value: string) => void;
  onSearch: (e: React.FormEvent) => Promise<void>;
  results: ProductDto[];
  selected: ProductDto | null;
  selectProduct: (product: ProductDto) => Promise<void>;
  canEdit: boolean;
  busy: boolean;
  name: string;
  setName: (value: string) => void;
  brand: string;
  setBrand: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  onSaveProduct: (e: React.FormEvent) => Promise<void>;
  onDelete: () => Promise<void>;
  manageTab: ManageTab;
  setManageTab: (tab: ManageTab) => void;
  selectedLocations: ProductLocationDto[];
  selectedLocationId: string;
  setSelectedLocationId: (value: string) => void;
  manageAisleId: string;
  setManageAisleId: (value: string) => void;
  manageSectionId: string;
  setManageSectionId: (value: string) => void;
  manageShelfId: string;
  setManageShelfId: (value: string) => void;
  aisles: AisleOption[];
  manageSections: SectionOption[];
  manageShelves: ShelfOption[];
  onSaveLocation: (e: React.FormEvent) => Promise<void>;
  onReplaceLocation: () => Promise<void>;
  onDeleteLocation: () => Promise<void>;
};

export function ManageSectionCard({
  searchLoading,
  query,
  setQuery,
  onSearch,
  results,
  selected,
  selectProduct,
  canEdit,
  busy,
  name,
  setName,
  brand,
  setBrand,
  description,
  setDescription,
  categoryId,
  setCategoryId,
  onSaveProduct,
  onDelete,
  manageTab,
  setManageTab,
  selectedLocations,
  selectedLocationId,
  setSelectedLocationId,
  manageAisleId,
  setManageAisleId,
  manageSectionId,
  setManageSectionId,
  manageShelfId,
  setManageShelfId,
  aisles,
  manageSections,
  manageShelves,
  onSaveLocation,
  onReplaceLocation,
  onDeleteLocation,
}: Props) {
  return (
    <>
      <section className={styles.card}>
        <h2>Sök produkt</h2>
        <form onSubmit={onSearch} className={styles.actions}>
          <input
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök namn, varumärke eller EAN..."
            disabled={searchLoading}
          />
          <button className={styles.button} type="submit" disabled={searchLoading}>
            {searchLoading ? "Söker..." : "Sök"}
          </button>
        </form>
        <ul className={styles.resultList}>
          {results.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                className={`${styles.resultItem} ${selected?.id === product.id ? styles.selected : ""}`}
                onClick={() => selectProduct(product)}
              >
                <strong>{product.name}</strong>
                <div>{product.brand ?? "Okänt varumärke"}</div>
                <div>EAN: {product.ean}</div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.card}>
        <h2>Redigera vald produkt</h2>
        {!selected ? (
          <p className={styles.selectedSummary}>Välj en produkt från sökresultatet först.</p>
        ) : (
          <>
            <p className={styles.selectedSummary}>
              Vald: <strong>{selected.name}</strong> (ID: {selected.id})
            </p>
            <div className={styles.addTabs}>
              <button
                className={`${styles.tabButton} ${manageTab === "product" ? styles.activeTab : ""}`}
                type="button"
                onClick={() => setManageTab("product")}
              >
                Produktinfo
              </button>
              <button
                className={`${styles.tabButton} ${manageTab === "location" ? styles.activeTab : ""}`}
                type="button"
                onClick={() => setManageTab("location")}
              >
                Butiksplaceringar
              </button>
            </div>

            {manageTab === "product" ? (
              <form onSubmit={onSaveProduct} className={styles.row}>
                <input
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canEdit || busy}
                  placeholder="Namn"
                />
                <input
                  className={styles.input}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  disabled={!canEdit || busy}
                  placeholder="Varumärke"
                />
                <textarea
                  className={styles.textarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!canEdit || busy}
                  placeholder="Beskrivning"
                />
                <input
                  className={styles.input}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={!canEdit || busy}
                  placeholder="Category ID"
                />
                <div className={styles.actions}>
                  <button className={styles.button} type="submit" disabled={!canEdit || busy}>
                    Spara produkt
                  </button>
                  <button
                    className={`${styles.button} ${styles.dangerButton}`}
                    type="button"
                    onClick={onDelete}
                    disabled={!canEdit || busy}
                  >
                    Ta bort produkt
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className={styles.row}>
                  <h3 className={styles.subTitle}>Nuvarande butiksplaceringar</h3>
                  {selectedLocations.length === 0 ? (
                    <p className={styles.selectedSummary}>Ingen butiksplacering registrerad ännu.</p>
                  ) : (
                    <ul className={styles.resultList}>
                      {selectedLocations.map((location) => (
                        <li key={location.id}>
                          <button
                            type="button"
                            className={`${styles.resultItem} ${selectedLocationId === String(location.id) ? styles.selected : ""}`}
                            onClick={() => setSelectedLocationId(String(location.id))}
                          >
                            {location.display}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <form onSubmit={onSaveLocation} className={styles.row}>
                  <select
                    className={styles.select}
                    value={manageAisleId}
                    onChange={(e) => setManageAisleId(e.target.value)}
                    disabled={!canEdit || busy || aisles.length === 0}
                  >
                    <option value="">Välj gång</option>
                    {aisles.map((aisle) => (
                      <option key={aisle.id} value={aisle.id}>
                        {aisle.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className={styles.select}
                    value={manageSectionId}
                    onChange={(e) => setManageSectionId(e.target.value)}
                    disabled={!canEdit || busy || manageSections.length === 0}
                  >
                    <option value="">Välj sektion</option>
                    {manageSections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className={styles.select}
                    value={manageShelfId}
                    onChange={(e) => setManageShelfId(e.target.value)}
                    disabled={!canEdit || busy || manageShelves.length === 0}
                  >
                    <option value="">Välj hylla</option>
                    {manageShelves.map((shelf) => (
                      <option key={shelf.id} value={shelf.id}>
                        {shelf.name}
                      </option>
                    ))}
                  </select>
                  <div className={styles.actions}>
                    <button className={styles.button} type="submit" disabled={!canEdit || busy}>
                      Lägg till lokalisering
                    </button>
                    <button
                      className={styles.button}
                      type="button"
                      onClick={onReplaceLocation}
                      disabled={!canEdit || busy || !selectedLocationId}
                    >
                      Byt vald lokalisering
                    </button>
                    <button
                      className={`${styles.button} ${styles.dangerButton}`}
                      type="button"
                      onClick={onDeleteLocation}
                      disabled={!canEdit || busy || !selectedLocationId}
                    >
                      Ta bort vald lokalisering
                    </button>
                  </div>
                </form>
              </>
            )}
          </>
        )}
      </section>
    </>
  );
}
