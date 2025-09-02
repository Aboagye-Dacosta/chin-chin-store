import { NETWORK_LABELS, NetworkCode } from "@/constants/payment-constants";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const MobileMoneyFields = ({
  phone,
  network,
  networkOptions,
  onPhoneChange,
  onNetworkChange,
  errors,
}: {
  phone: string;
  network?: NetworkCode;
  networkOptions: NetworkCode[];
  onPhoneChange: (phone: string) => void;
  onNetworkChange: (network: NetworkCode) => void;
  errors: { phone?: string; network?: string };
}) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div className="space-y-2">
      <Label htmlFor="phone">Mobile number</Label>
      <Input
        id="phone"
        inputMode="tel"
        placeholder="+233 55 123 4567"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
      />
      {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
    </div>
    <div className="space-y-2">
      <Label htmlFor="network">Wallet network</Label>
      <Select value={network} onValueChange={onNetworkChange}>
        <SelectTrigger id="network">
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent>
          {networkOptions.map((code) => (
            <SelectItem key={code} value={code}>
              {NETWORK_LABELS[code]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.network && (
        <p className="text-xs text-red-500">{errors.network}</p>
      )}
    </div>
  </div>
);
