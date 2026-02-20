const OPENFOODFACTS_BASE = "https://world.openfoodfacts.net/api/v2";

//Data that returns to prodact
export interface OpenFoodFactsProduct {
    ean: string;
    openFoodFactsId: string;
    name: string;
    brand: string | null;
    description: string | null;
    categoryName: string;
    imageUrl: string;
}
//Data that we get from Open Food Facts API
interface OffApiProduct {
    code?: string;
    product_name?: string;
    product_name_sv?: string;
    brands?: string;
    categories?: string;
    generic_name?: string;
    image_url?: string;
}


//Get prodict from EAN
export async function fetchProductByEan(
    ean: string
): Promise<OpenFoodFactsProduct | null> {
    try {
        const normalizedEan = String(ean).trim().replace(/\s/g,"");
        if (normalizedEan.length < 8) {
            return null;
        }

        const response = await fetch(
            `${OPENFOODFACTS_BASE}/product/${normalizedEan}`
        );
        const data = await response.json();

        // status 1 means product found
        if (data.status !== 1 || !data.product) {
            return null;
        }

        const product: OffApiProduct = data.product;

        //Category: First cateogry, remove "en:" prefix.
        const categoriesStr = product.categories ?? "";
        const firstCategory = categoriesStr.split(",")[0]?.trim() ?? "";
        const categoryName = 
        firstCategory.replace(/^en:/i, "").trim() || "Övrigt";

        return {
            ean: normalizedEan,
            openFoodFactsId: product.code ?? normalizedEan,
            name:
                product.product_name_sv ||
                product.product_name ||
                product.generic_name ||
                "Okänd produkt",
            brand: product.brands?.trim() || null,
            description:product.generic_name?.trim() || null,
            categoryName,
            imageUrl: product.image_url ?? "",
        };
    } catch (error) {
        console.error("Error fetching product by EAN:", error);
        return null;
    }
}