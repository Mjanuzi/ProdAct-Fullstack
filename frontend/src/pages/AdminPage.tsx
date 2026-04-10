import { Link } from "react-router-dom";
import styles from "../styles/AdminPage.module.css";
import { AddSectionCard } from "../components/admin/AddSectionCard";
import { AdminLoginCard } from "../components/admin/AdminLoginCard";
import { AdminTopBar } from "../components/admin/AdminTopBar";
import { ManageSectionCard } from "../components/admin/ManageSectionCard";
import { useAdminPageState } from "../hooks/useAdminPageState";

export function AdminPage() {
  const state = useAdminPageState();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Admin UI</h1>
        <div className={styles.actions}>
          <Link to="/" className={styles.button}>
            ← Tillbaka
          </Link>
        </div>

        {!state.authChecked ? (
          <section className={styles.card}>
            <p className={styles.selectedSummary}>Kontrollerar session...</p>
          </section>
        ) : !state.isLoggedIn ? (
          <AdminLoginCard
            email={state.email}
            setEmail={state.setEmail}
            password={state.password}
            setPassword={state.setPassword}
            authLoading={state.authLoading}
            onLogin={state.onLogin}
          />
        ) : (
          <>
            <AdminTopBar
              activeTab={state.activeTab}
              setActiveTab={state.setActiveTab}
              onLogout={state.onLogout}
              authLoading={state.authLoading}
            />

            {state.activeTab === "add" ? (
              <AddSectionCard
                busy={state.busy}
                addTab={state.addTab}
                setAddTab={state.setAddTab}
                ean={state.ean}
                setEan={state.setEan}
                addAisleId={state.addAisleId}
                setAddAisleId={state.setAddAisleId}
                addSectionId={state.addSectionId}
                setAddSectionId={state.setAddSectionId}
                addShelfId={state.addShelfId}
                setAddShelfId={state.setAddShelfId}
                aisles={state.aisles}
                addSections={state.addSections}
                addShelves={state.addShelves}
                newAisleName={state.newAisleName}
                setNewAisleName={state.setNewAisleName}
                newSectionName={state.newSectionName}
                setNewSectionName={state.setNewSectionName}
                newShelfName={state.newShelfName}
                setNewShelfName={state.setNewShelfName}
                onCreateProduct={state.onCreateProduct}
                onCreateAisle={state.onCreateAisle}
                onCreateSection={state.onCreateSection}
                onCreateShelf={state.onCreateShelf}
              />
            ) : (
              <ManageSectionCard
                searchLoading={state.searchLoading}
                query={state.query}
                setQuery={state.setQuery}
                onSearch={state.onSearch}
                results={state.results}
                selected={state.selected}
                selectProduct={state.selectProduct}
                canEdit={state.canEdit}
                busy={state.busy}
                name={state.name}
                setName={state.setName}
                brand={state.brand}
                setBrand={state.setBrand}
                description={state.description}
                setDescription={state.setDescription}
                categoryId={state.categoryId}
                setCategoryId={state.setCategoryId}
                onSaveProduct={state.onSaveProduct}
                onDelete={state.onDelete}
                manageTab={state.manageTab}
                setManageTab={state.setManageTab}
                selectedLocations={state.selectedLocations}
                selectedLocationId={state.selectedLocationId}
                setSelectedLocationId={state.setSelectedLocationId}
                manageAisleId={state.manageAisleId}
                setManageAisleId={state.setManageAisleId}
                manageSectionId={state.manageSectionId}
                setManageSectionId={state.setManageSectionId}
                manageShelfId={state.manageShelfId}
                setManageShelfId={state.setManageShelfId}
                aisles={state.aisles}
                manageSections={state.manageSections}
                manageShelves={state.manageShelves}
                onSaveLocation={state.onSaveLocation}
                onReplaceLocation={state.onReplaceLocation}
                onDeleteLocation={state.onDeleteLocation}
              />
            )}
          </>
        )}

        {state.status ? (
          <section className={styles.card}>
            <div
              className={`${styles.status} ${
                state.status.kind === "success" ? styles.success : styles.error
              }`}
            >
              {state.status.text}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
