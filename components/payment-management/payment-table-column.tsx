"use client";
import { Payment } from "@/types/convex-types";
import { Column } from "../DataTable";
import { getFormattedTime } from "@/lib/getFormattedTime";
import { displayMoney } from "@/lib/display-money";
import { PaymentStatusBadge } from "./payement-status-badge";

export interface PaymentTableColumn extends Payment {
  vendor?: string | null;
  user?: string | null;
  store?: string | null;
}

export const PaymentColumns: Column<PaymentTableColumn>[] = [
  {
    key: "store",
    header: "Store",
    render: (_v, row) => <>{row?.store}</>,
  },
  {
    key: "vendor",
    header: "Vendor",
    render: (_v, row) => <>{row?.vendor}</>,
  },
  {
    key: "user",
    header: "User",
    render: (_v, row) => <>{row?.user}</>,
  },
  {
    key: "amount",
    header: "Amount",
    render: (_v, row) => <>{displayMoney(row.amount, false)}</>,
  },
  {
    key: "currency",
    header: "Currency",
  },
  {
    key: "method",
    header: "Method",
    render: (_v, row) => <span>{row.method.toLowerCase().replaceAll("_"," ")}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (_v, row) => <PaymentStatusBadge status={row.status} paymentId={row._id} />,
  },
  {
    key: "createdAt",
    header: "Created At",
    render: (_v, row) => <>{getFormattedTime(row.createdAt)}</>,
  },
];
