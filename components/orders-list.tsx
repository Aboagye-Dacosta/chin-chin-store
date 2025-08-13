"use client";

import { OrderCard } from "@/components/order-card";
import { Orders } from "@/lib/fetch/fetch-orders";

interface OrdersListProps {
  orders: Orders;
}

export function OrdersList({ orders }: Readonly<OrdersListProps>) {
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
        <PackageIcon className="h-16 w-16 mb-4" />
        <p className="text-xl font-semibold">No orders found.</p>
        <p className="text-sm">Looks like you haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function PackageIcon(props: Readonly<React.SVGProps<SVGSVGElement>>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.274 6.5 2.75 3.5-1.5L10 2.774ZM2.5 8.274l6.5 2.75 3.5-1.5L6 6.774ZM7.5 14.274 14 17.024l3.5-1.5L10 12.774ZM12.5 18.274 19 21.024l3.5-1.5L16 16.774Z" />
      <path d="m7.5 4.274 6.5 2.75 3.5-1.5L10 2.774Z" />
      <path d="m2.5 8.274 6.5 2.75 3.5-1.5L6 6.774Z" />
      <path d="m7.5 14.274 6.5 2.75 3.5-1.5L10 12.774Z" />
      <path d="m12.5 18.274 6.5 2.75 3.5-1.5L16 16.774Z" />
    </svg>
  );
}
