import { Settings } from "@/components/settings/settings";
import { Protected } from "@/components/protected";

export default function SettingsPage() {
  return (
    <Protected>
      <Settings />
    </Protected>
  );
}
