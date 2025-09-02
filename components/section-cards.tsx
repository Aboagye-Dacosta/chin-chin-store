import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "./ui/skeleton";
import { displayMoney } from "@/lib/display-money";

export function SectionCards() {
  const analytics = useQuery(api.analytics.getDashboardAnalytics, {});

  if (!analytics) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const {
    totalRevenue,
    newCustomers,
    totalOrders,
    growthRate,
    revenueTrend,
    customerTrend,
    accountTrend,
    growthTrend,
    revenuePercentageChange,
    customerPercentageChange,
    orderPercentageChange,
  } = analytics;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {displayMoney(totalRevenue,false)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {revenueTrend === "up" ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {revenuePercentageChange.toFixed(2)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending {revenueTrend} this month{" "}
            {revenueTrend === "up" ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">Compared to last week</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {newCustomers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {customerTrend === "up" ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {customerPercentageChange.toFixed(2)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {customerTrend === "up" ? "Up" : "Down"}{" "}
            {customerPercentageChange.toFixed(2)}% this period{" "}
            {customerTrend === "up" ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">Compared to last week</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalOrders}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {accountTrend === "up" ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {orderPercentageChange.toFixed(2)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {accountTrend === "up" ? "Up" : "Down"}{" "}
            {orderPercentageChange.toFixed(2)}% this period{" "}
            {accountTrend === "up" ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">Compared to last week</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {growthRate.toFixed(2)}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {growthTrend === "up" ? <IconTrendingUp /> : <IconTrendingDown />}
              {growthRate.toFixed(2)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div>
            {growthTrend === "up" ? (
              <div className="line-clamp-1 flex gap-2 font-medium">
                Performance increase <IconTrendingUp className="size-4" />
              </div>
            ) : (
              <div className="line-clamp-1 flex gap-2 font-medium">
                Performance decrease <IconTrendingDown className="size-4" />
              </div>
            )}
          </div>
          <div className="text-muted-foreground">
            {" "}
            {growthTrend === "up"
              ? "Growth is steady."
              : "Growth is declining."}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
