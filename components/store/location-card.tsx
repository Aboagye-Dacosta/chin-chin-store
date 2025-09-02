import { Location } from "@/types/convex-types";
import { Flex } from "../ui/flex";
import { Button } from "../ui/button";
import { Trash2, StoreIcon, MapPin } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { handleStatus } from "@/lib/handle-status";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

export const LocationCard = ({
  location,
  storeCount,
}: {
  location: Location;
  storeCount: number;
}) => {
  const [isDeletingLocation, setIsDeletingLocation] = useState(false);
  const deleteLocation = useMutation(api.locations.deleteLocation);

  const handleDeleteLocation = async (id: Id<"locations">) => {
    try {
      setIsDeletingLocation(true);
      await deleteLocation({ id });
      handleStatus({ message: "Location deleted successfully", success: true });
    } catch (error) {
      handleStatus({ error });
    } finally {
      setIsDeletingLocation(false);
    }
  };

  return (
    <div
      key={location._id}
      className="w-full not-last:border-b p-2 px-4 flex justify-between items-center"
    >
      <Flex direction="row" gap="md" align="center">
        <MapPin className="h-5 w-5 text-muted-foreground capitalize" />
        <p>{location.name}</p>
      </Flex>
      {storeCount > 0 && (
        <Flex direction="row" gap="md" align="center">
          <StoreIcon className="h-5 w-5 text-muted-foreground" />
          <p>{storeCount}</p>
        </Flex>
      )}
      {storeCount === 0 && (
        <Button
          variant={"ghost"}
          onClick={() => handleDeleteLocation(location._id)}
          disabled={isDeletingLocation}
          loading={isDeletingLocation}
        >
          {!isDeletingLocation && (
            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
          )}
        </Button>
      )}
    </div>
  );
};
