import { z } from "zod"

// Ghana mobile number regex (starts with 0 or 233, then valid prefixes, then 6 digits)
const ghanaPhoneRegex = /^((233|0)(24|54|55|59|20|50|27|57|26|56|23|28)\d{7})$/

const mobileMoneyAccountSchema = z.object({
  provider: z.enum(["MTN", "VODAFONE", "AIRTELTIGO"]),
  phoneNumber: z.string().regex(ghanaPhoneRegex, {
    message: "Invalid Ghana mobile number",
  }),
})

export const createVendorSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  storeId: z.string().min(1, "Store ID is required"),
  mobileMoneyAccounts: mobileMoneyAccountSchema
})

export type CreateVendorData = z.infer<typeof createVendorSchema>
