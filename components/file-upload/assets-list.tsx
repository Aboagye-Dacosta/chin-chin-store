import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { Flex } from "../ui/flex";
import ModelViewer from "./model-viewer";

export const AssetsList = () => {
  const assets = useQuery(api.assets.getAssets);
  if (!assets) return null;
  if (assets.length === 0) return null;

  console.log(assets);
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Assets List</CardTitle>
      </CardHeader>
      <CardContent>
        {assets?.map((asset) => (
          <Flex
            key={asset._id}
            className="items-center gap-4 not-last:border-b not-last:pb-4 not-first:pt-4"
          >
            {asset.isModel ? (
              <ModelViewer src={asset?.url ?? ""} />
            ) : (
              <Image
                src={asset?.url ?? ""}
                alt={asset.name}
                width={100}
                height={100}
                className="w-[50px] h-[50px] object-contain"
              />
            )}
            <h2>
              <Flex direction="col" gap="sm">
                {asset.name}
                <span className="text-xs text-muted-foreground">
                  {asset.isModel && <p>( Model )</p>}
                </span>
              </Flex>
            </h2>
          </Flex>
        ))}
      </CardContent>
    </Card>
  );
};
