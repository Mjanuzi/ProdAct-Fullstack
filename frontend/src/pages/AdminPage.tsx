import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/AdminPage.module.css";
import { getProductById, searchProducts } from "../api/products";
import {
  addProductLocation,
  createAisle,
  createProduct,
  createSection,
  createShelf,
  deleteProduct,
  deleteProductLocation,
  getLayoutOptions,
  login,
  me,
  logout,
  replaceProductLocation,
  updateProduct,
  type AisleOption,
  type SectionOption,
  type ShelfOption,
} from "../api/admin";
import { ApiError } from "../api/client";
import type { ProductDto, ProductLocationDto } from "../types/product";

type Status = {
  kind: "success" | "error";
  text: string;
} | null;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Något gick fel.";
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<"add" | "manage">("add");
  const [addTab, setAddTab] = useState<"product" | "aisle" | "section" | "shelf">(
    "product",
  );
  const [manageTab, setManageTab] = useState<"product" | "location">("product");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductDto[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selected, setSelected] = useState<ProductDto | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<ProductLocationDto[]>([]);
  const [ean, setEan] = useState("");

  const [aisles, setAisles] = useState<AisleOption[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [shelves, setShelves] = useState<ShelfOption[]>([]);

  const [addAisleId, setAddAisleId] = useState("");
  const [addSectionId, setAddSectionId] = useState("");
  const [addShelfId, setAddShelfId] = useState("");

  const [newAisleName, setNewAisleName] = useState("");
  const [newSectionName, setNewSectionName] = useState("");
  const [newShelfName, setNewShelfName] = useState("");

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [manageAisleId, setManageAisleId] = useState("");
  const [manageSectionId, setManageSectionId] = useState("");
  const [manageShelfId, setManageShelfId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [busy, setBusy] = useState(false);

  const canEdit = useMemo(() => isLoggedIn && selected != null, [isLoggedIn, selected]);

  const addSections = useMemo(() => sections, [sections]);
  const addShelves = useMemo(() => shelves, [shelves]);
  const manageSections = useMemo(() => sections, [sections]);
  const manageShelves = useMemo(() => shelves, [shelves]);

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const user = await me();
        if (cancelled) return;
        if (user.role === "ADMIN") {
          setIsLoggedIn(true);
        }
      } catch {
        if (cancelled) return;
        setIsLoggedIn(false);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    }
    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadLayoutOptions();
  }, [isLoggedIn]);

  useEffect(() => {
    if (sections.length === 0) {
      setAddSectionId("");
      return;
    }
    if (!sections.some((s) => String(s.id) === addSectionId)) {
      setAddSectionId("");
    }
  }, [sections, addSectionId]);

  useEffect(() => {
    if (shelves.length === 0) {
      setAddShelfId("");
      return;
    }
    if (!shelves.some((s) => String(s.id) === addShelfId)) {
      setAddShelfId("");
    }
  }, [shelves, addShelfId]);

  useEffect(() => {
    if (manageSections.length === 0) {
      setManageSectionId("");
      return;
    }
    if (!manageSections.some((s) => String(s.id) === manageSectionId)) {
      setManageSectionId("");
    }
  }, [manageSections, manageSectionId]);

  useEffect(() => {
    if (manageShelves.length === 0) {
      setManageShelfId("");
      return;
    }
    if (!manageShelves.some((s) => String(s.id) === manageShelfId)) {
      setManageShelfId("");
    }
  }, [manageShelves, manageShelfId]);

  useEffect(() => {
    if (selectedLocations.length === 0) {
      setSelectedLocationId("");
      return;
    }
    if (!selectedLocations.some((loc) => String(loc.id) === selectedLocationId)) {
      setSelectedLocationId(String(selectedLocations[0].id));
    }
  }, [selectedLocations, selectedLocationId]);

  async function loadLayoutOptions() {
    try {
      const data = await getLayoutOptions();
      setAisles(data.aisles);
      setSections(data.sections);
      setShelves(data.shelves);
      if (data.aisles.length === 0) {
        setAddAisleId("");
        setManageAisleId("");
      } else {
        if (!data.aisles.some((a) => String(a.id) === addAisleId)) setAddAisleId("");
        if (!data.aisles.some((a) => String(a.id) === manageAisleId)) setManageAisleId("");
      }
    } catch (error) {
      handleApiError(error);
    }
  }

  function handleApiError(error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      setIsLoggedIn(false);
      setSelected(null);
      setSelectedLocations([]);
      setResults([]);
      setStatus({ kind: "error", text: "Sessionen har gått ut. Logga in igen." });
      return;
    }
    setStatus({ kind: "error", text: toErrorMessage(error) });
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setStatus(null);
    try {
      const res = await login(email.trim(), password);
      if (res.role !== "ADMIN") {
        throw new Error("Du är inloggad men saknar admin-behörighet.");
      }
      setIsLoggedIn(true);
      setStatus({ kind: "success", text: "Inloggad som admin." });
    } catch (error) {
      setStatus({ kind: "error", text: toErrorMessage(error) });
    } finally {
      setAuthLoading(false);
    }
  }

  async function onLogout() {
    setAuthLoading(true);
    try {
      await logout();
      setIsLoggedIn(false);
      setSelected(null);
      setSelectedLocations([]);
      setResults([]);
      setStatus({ kind: "success", text: "Utloggad." });
    } catch (error) {
      handleApiError(error);
    } finally {
      setAuthLoading(false);
    }
  }

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchLoading(true);
    setStatus(null);
    try {
      const data = await searchProducts(query.trim());
      setResults(data.products);
      if (data.products.length === 0) {
        setStatus({ kind: "error", text: data.message ?? "Inga produkter hittades." });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setSearchLoading(false);
    }
  }

  async function selectProduct(product: ProductDto) {
    setSelected(product);
    setName(product.name ?? "");
    setBrand(product.brand ?? "");
    setDescription(product.description ?? "");
    setCategoryId(product.category?.id != null ? String(product.category.id) : "");
    setStatus(null);
    try {
      const detail = await getProductById(product.id);
      setSelectedLocations(detail.locations ?? []);
    } catch {
      setSelectedLocations([]);
    }
  }

  async function onCreateAisle(e: React.FormEvent) {
    e.preventDefault();
    if (!newAisleName.trim()) {
      setStatus({ kind: "error", text: "Ange namn på gång." });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      await createAisle({ name: newAisleName.trim() });
      setNewAisleName("");
      setStatus({ kind: "success", text: "Gång skapad." });
      await loadLayoutOptions();
    } catch (error) {
      handleApiError(error);
    } finally {
      setBusy(false);
    }
  }

  async function onCreateSection(e: React.FormEvent) {
    e.preventDefault();
    if (!newSectionName.trim()) {
      setStatus({ kind: "error", text: "Ange namn på sektion." });
      return;
    }

    setBusy(true);
    setStatus(null);
    try {
      const created = await createSection({ name: newSectionName.trim() });
      setNewSectionName("");
      setStatus({ kind: "success", text: "Sektion skapad." });
      await loadLayoutOptions();
      setAddSectionId(String(created.id));
    } catch (error) {
      handleApiError(error);
    } finally {
      setBusy(false);
    }
  }

  async function onCreateShelf(e: React.FormEvent) {
    e.preventDefault();
    if (!newShelfName.trim()) {
      setStatus({ kind: "error", text: "Ange namn på hylla." });
      return;
    }

    setBusy(true);
    setStatus(null);
    try {
      await createShelf({ name: newShelfName.trim() });
      setNewShelfName("");
      setStatus({ kind: "success", text: "Hylla skapad." });
      await loadLayoutOptions();
    } catch (error) {
      handleApiError(error);
    } finally {
      setBusy(false);
    }
  }

  async function onCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEan = ean.trim().replace(/\s/g, "");
    if (!normalizedEan) {
      setStatus({ kind: "error", text: "Ange EAN." });
      return;
    }
    const shelf = addShelfId ? Number(addShelfId) : undefined;
    const selectedAisle = aisles.find((a) => String(a.id) === addAisleId);
    const selectedSection = sections.find((s) => String(s.id) === addSectionId);
    const selectedShelf = shelves.find((s) => String(s.id) === addShelfId);

    setBusy(true);
    setStatus(null);
    try {
      const created = await createProduct({
        ean: normalizedEan,
        shelfId: shelf,
        aisleName: selectedAisle?.name,
        sectionName: selectedSection?.name,
        shelfLabel: selectedShelf?.name,
      });
      setStatus({ kind: "success", text: "Produkt tillagd." });
      setResults((prev) => [created, ...prev]);
      setEan("");
    } catch (error) {
      handleApiError(error);
    } finally {
      setBusy(false);
    }
  }

  async function onSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const payload: { name?: string; brand?: string; description?: string; categoryId?: number } = {};
    if (name.trim()) payload.name = name.trim();
    payload.brand = brand.trim();
    payload.description = description.trim();
    if (categoryId.trim()) payload.categoryId = Number(categoryId);

    setBusy(true);
    setStatus(null);
    try {
      const updated = await updateProduct(selected.id, payload);
      setSelected(updated);
      setResults((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      setStatus({ kind: "success", text: "Produkt uppdaterad." });
    } catch (error) {
      handleApiError(error);
    } finally {
      setBusy(false);
    }
  }

  async function onSaveLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const shelfId = manageShelfId ? Number(manageShelfId) : undefined;
    if (shelfId != null && Number.isNaN(shelfId)) {
      setStatus({ kind: "error", text: "Ogiltig hylla." });
      return;
    }
    const selectedAisle = aisles.find((a) => String(a.id) === manageAisleId);
    const selectedSection = sections.find((s) => String(s.id) === manageSectionId);
    const selectedShelf = shelves.find((s) => String(s.id) === manageShelfId);

    setBusy(true);
    setStatus(null);
    try {
      await addProductLocation(selected.id, {
        shelfId,
        aisleName: selectedAisle?.name,
        sectionName: selectedSection?.name,
        shelfLabel: selectedShelf?.name,
      });
      const detail = await getProductById(selected.id);
      setSelectedLocations(detail.locations ?? []);
      setStatus({ kind: "success", text: "Butiksplacering tillagd." });
    } catch (error) {
      handleApiError(error);
    } finally {
      setBusy(false);
    }
  }

  async function onReplaceLocation() {
    if (!selected) return;
    const locationId = Number(selectedLocationId);
    if (Number.isNaN(locationId)) {
      setStatus({ kind: "error", text: "Välj en befintlig placering att byta." });
      return;
    }
    const shelfId = manageShelfId ? Number(manageShelfId) : undefined;
    if (shelfId != null && Number.isNaN(shelfId)) {
      setStatus({ kind: "error", text: "Ogiltig hylla." });
      return;
    }
    const selectedAisle = aisles.find((a) => String(a.id) === manageAisleId);
    const selectedSection = sections.find((s) => String(s.id) === manageSectionId);
    const selectedShelf = shelves.find((s) => String(s.id) === manageShelfId);

    setBusy(true);
    setStatus(null);
    try {
      await replaceProductLocation(selected.id, locationId, {
        shelfId,
        aisleName: selectedAisle?.name,
        sectionName: selectedSection?.name,
        shelfLabel: selectedShelf?.name,
      });
      const detail = await getProductById(selected.id);
      setSelectedLocations(detail.locations ?? []);
      setStatus({ kind: "success", text: "Butiksplacering uppdaterad." });
    } catch (error) {
      handleApiError(error);
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteLocation() {
    if (!selected) return;
    const locationId = Number(selectedLocationId);
    if (Number.isNaN(locationId)) {
      setStatus({ kind: "error", text: "Välj en placering att ta bort." });
      return;
    }
    const ok = window.confirm("Ta bort vald butiksplacering?");
    if (!ok) return;

    setBusy(true);
    setStatus(null);
    try {
      await deleteProductLocation(selected.id, locationId);
      const detail = await getProductById(selected.id);
      setSelectedLocations(detail.locations ?? []);
      setStatus({ kind: "success", text: "Butiksplacering borttagen." });
    } catch (error) {
      handleApiError(error);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!selected) return;
    const ok = window.confirm("Är du säker på att du vill ta bort produkten?");
    if (!ok) return;
    setBusy(true);
    setStatus(null);
    try {
      await deleteProduct(selected.id);
      setResults((prev) => prev.filter((p) => p.id !== selected.id));
      setSelected(null);
      setSelectedLocations([]);
      setStatus({ kind: "success", text: "Produkt borttagen." });
    } catch (error) {
      handleApiError(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Admin UI</h1>
        <div className={styles.actions}>
          <Link to="/" className={styles.button}>
            ← Tillbaka
          </Link>
        </div>

        {!authChecked ? (
          <section className={styles.card}>
            <p className={styles.selectedSummary}>Kontrollerar session...</p>
          </section>
        ) : !isLoggedIn ? (
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
        ) : (
          <>
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

            {activeTab === "add" ? (
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
                    <input className={styles.input} value={ean} onChange={(e) => setEan(e.target.value)} placeholder="EAN" disabled={busy} />
                    <select className={styles.select} value={addAisleId} onChange={(e) => setAddAisleId(e.target.value)} disabled={busy || aisles.length === 0}>
                      <option value="">Välj gång</option>
                      {aisles.map((aisle) => (
                        <option key={aisle.id} value={aisle.id}>{aisle.name} ({aisle.code})</option>
                      ))}
                    </select>
                    <select className={styles.select} value={addSectionId} onChange={(e) => setAddSectionId(e.target.value)} disabled={busy || sections.length === 0}>
                      <option value="">Välj sektion</option>
                      {addSections.map((section) => (
                        <option key={section.id} value={section.id}>{section.name}</option>
                      ))}
                    </select>
                    <select className={styles.select} value={addShelfId} onChange={(e) => setAddShelfId(e.target.value)} disabled={busy || shelves.length === 0}>
                      <option value="">Välj hylla</option>
                      {addShelves.map((shelf) => (
                        <option key={shelf.id} value={shelf.id}>
                          {shelf.name}
                        </option>
                      ))}
                    </select>
                    <button className={styles.button} type="submit" disabled={busy}>Lägg till produkt</button>
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
                    <button className={styles.button} type="submit" disabled={busy}>Lägg till hylla</button>
                  </form>
                ) : null}
              </section>
            ) : (
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
                          className={`${styles.resultItem} ${
                            selected?.id === product.id ? styles.selected : ""
                          }`}
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
                              disabled={!canEdit || busy || sections.length === 0}
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
                              disabled={!canEdit || busy || shelves.length === 0}
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
            )}
          </>
        )}

        {status ? (
          <section className={styles.card}>
            <div
              className={`${styles.status} ${
                status.kind === "success" ? styles.success : styles.error
              }`}
            >
              {status.text}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
