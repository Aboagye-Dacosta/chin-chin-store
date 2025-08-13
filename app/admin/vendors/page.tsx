import { VendorManagement } from "@/components/Vendors/vendor-management";
import { fetchVendors } from "@/lib/fetch/fetch-vendors";
import { fetchStores } from "@/lib/fetch/fetch-stores";

export default async function VendorsPage() {
  const vendors = await fetchVendors();
  const stores = await fetchStores();
  return <VendorManagement vendors={vendors} stores={stores} />;
}
