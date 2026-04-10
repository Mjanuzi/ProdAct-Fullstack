import { useEffect, useMemo, useState } from "react";
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
  logout,
  me,
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

export function useAdminPageState() {
  const [activeTab, setActiveTab] = useState<"add" | "manage">("add");
  const [addTab, setAddTab] = useState<"product" | "aisle" | "section" | "shelf">("product");
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

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const user = await me();
        if (cancelled) return;
        if (user.role === "ADMIN") setIsLoggedIn(true);
      } catch {
        if (!cancelled) setIsLoggedIn(false);
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
    if (sections.length === 0) return setAddSectionId("");
    if (!sections.some((s) => String(s.id) === addSectionId)) setAddSectionId("");
  }, [sections, addSectionId]);

  useEffect(() => {
    if (shelves.length === 0) return setAddShelfId("");
    if (!shelves.some((s) => String(s.id) === addShelfId)) setAddShelfId("");
  }, [shelves, addShelfId]);

  useEffect(() => {
    if (manageSections.length === 0) return setManageSectionId("");
    if (!manageSections.some((s) => String(s.id) === manageSectionId)) setManageSectionId("");
  }, [manageSections, manageSectionId]);

  useEffect(() => {
    if (manageShelves.length === 0) return setManageShelfId("");
    if (!manageShelves.some((s) => String(s.id) === manageShelfId)) setManageShelfId("");
  }, [manageShelves, manageShelfId]);

  useEffect(() => {
    if (selectedLocations.length === 0) return setSelectedLocationId("");
    if (!selectedLocations.some((loc) => String(loc.id) === selectedLocationId)) {
      setSelectedLocationId(String(selectedLocations[0].id));
    }
  }, [selectedLocations, selectedLocationId]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setStatus(null);
    try {
      const res = await login(email.trim(), password);
      if (res.role !== "ADMIN") throw new Error("Du är inloggad men saknar admin-behörighet.");
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
    if (!newAisleName.trim()) return setStatus({ kind: "error", text: "Ange namn på gång." });
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
    if (!newSectionName.trim()) return setStatus({ kind: "error", text: "Ange namn på sektion." });
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
    if (!newShelfName.trim()) return setStatus({ kind: "error", text: "Ange namn på hylla." });
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
    if (!normalizedEan) return setStatus({ kind: "error", text: "Ange EAN." });
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

  function getManageLocationPayload() {
    const shelfId = manageShelfId ? Number(manageShelfId) : undefined;
    if (shelfId != null && Number.isNaN(shelfId)) throw new Error("Ogiltig hylla.");
    const selectedAisle = aisles.find((a) => String(a.id) === manageAisleId);
    const selectedSection = sections.find((s) => String(s.id) === manageSectionId);
    const selectedShelf = shelves.find((s) => String(s.id) === manageShelfId);
    return {
      shelfId,
      aisleName: selectedAisle?.name,
      sectionName: selectedSection?.name,
      shelfLabel: selectedShelf?.name,
    };
  }

  async function onSaveLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setStatus(null);
    try {
      const payload = getManageLocationPayload();
      await addProductLocation(selected.id, payload);
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
      return setStatus({ kind: "error", text: "Välj en befintlig placering att byta." });
    }
    setBusy(true);
    setStatus(null);
    try {
      const payload = getManageLocationPayload();
      await replaceProductLocation(selected.id, locationId, payload);
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
      return setStatus({ kind: "error", text: "Välj en placering att ta bort." });
    }
    if (!window.confirm("Ta bort vald butiksplacering?")) return;
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
    if (!window.confirm("Är du säker på att du vill ta bort produkten?")) return;
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

  return {
    activeTab,
    setActiveTab,
    addTab,
    setAddTab,
    manageTab,
    setManageTab,
    email,
    setEmail,
    password,
    setPassword,
    isLoggedIn,
    authChecked,
    authLoading,
    status,
    query,
    setQuery,
    results,
    searchLoading,
    selected,
    selectedLocations,
    ean,
    setEan,
    aisles,
    sections,
    shelves,
    addAisleId,
    setAddAisleId,
    addSectionId,
    setAddSectionId,
    addShelfId,
    setAddShelfId,
    newAisleName,
    setNewAisleName,
    newSectionName,
    setNewSectionName,
    newShelfName,
    setNewShelfName,
    name,
    setName,
    brand,
    setBrand,
    description,
    setDescription,
    categoryId,
    setCategoryId,
    manageAisleId,
    setManageAisleId,
    manageSectionId,
    setManageSectionId,
    manageShelfId,
    setManageShelfId,
    selectedLocationId,
    setSelectedLocationId,
    busy,
    canEdit,
    addSections,
    addShelves,
    manageSections,
    manageShelves,
    onLogin,
    onLogout,
    onSearch,
    selectProduct,
    onCreateAisle,
    onCreateSection,
    onCreateShelf,
    onCreateProduct,
    onSaveProduct,
    onSaveLocation,
    onReplaceLocation,
    onDeleteLocation,
    onDelete,
  };
}
