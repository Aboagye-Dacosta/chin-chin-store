import { StoreManagement } from "@/components/store/store-management";
import { Protected } from "@/components/protected";

export default async function StorePage() {
  return (
    <Protected>
      <StoreManagement />
    </Protected>
  );
}
