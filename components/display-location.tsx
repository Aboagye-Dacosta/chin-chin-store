import { Location } from "@/types/convex-types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const DisplayLocation = ({ id }: { id: Location["_id"] }) => {
  const locations = useQuery(api.locations.getLocations);
  const location = locations?.find((loc) => loc._id === id);
  return <>{location?.name}</>;
};
