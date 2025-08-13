"use server"

import { revalidatePath } from "next/cache"
import {prisma} from "@/lib/prisma/client"
import { OrderStatus } from "@prisma/client"

export async function cancelOrder(orderId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const orderToCancel = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      if (!orderToCancel) {
        throw new Error("Order not found.")
      }

      const currentStatus = orderToCancel.status
      if (currentStatus === OrderStatus.Delivered || currentStatus === OrderStatus.Cancelled) {
        throw new Error(`Order ${orderId} cannot be cancelled as it is already ${currentStatus}.`)
      }
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.Cancelled },
      })

      for (const item of orderToCancel.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        })
      }

      return { success: true, message: `Order ${orderId} cancelled successfully.` }
    })

    revalidatePath("/orders")

    return result
  } catch (error: any) {
    console.error("Failed to cancel order:", error)
    return { success: false, message: error.message || "An unexpected error occurred during cancellation." }
  }
}
