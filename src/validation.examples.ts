/**
 * Domain-specific Zod schemas (examples)
 * These are intentionally not exported from the package entry point.
 * Copy and adapt them to your own Prisma models.
 */

import { z } from "zod";
import {
  dateRangeSchema,
  numberRangeSchema,
  paginationSchema,
  sortSchema,
} from "./validation";

// User-specific schemas (example)
export const userFilterSchema = z.object({
  role: z.enum(["USER", "ADMIN", "GUEST", "BASIC", "PRO"]).optional(),
  isActive: z.coerce.boolean().optional(),
  email: z.string().email().optional(),
  clerkId: z.string().optional(),
});

export const userQuerySchema = z.intersection(
  z.intersection(paginationSchema, sortSchema),
  z.object({
    search: z.string().optional(),
    role: z.enum(["USER", "ADMIN", "GUEST", "BASIC", "PRO"]).optional(),
    isActive: z.coerce.boolean().optional(),
  })
);

// Event-specific schemas (example)
export const eventFilterSchema = z.object({
  status: z.enum(["UPCOMING", "LIVE", "PAST"]).optional(),
  mode: z.enum(["ONLINE", "ONSITE"]).optional(),
  createdBy: z.string().uuid().optional(),
  startsAt: dateRangeSchema.optional(),
  endsAt: dateRangeSchema.optional(),
  amount: numberRangeSchema.optional(),
});

export const eventQuerySchema = z.intersection(
  z.intersection(paginationSchema, sortSchema),
  z.object({
    search: z.string().optional(),
    status: z.enum(["UPCOMING", "LIVE", "PAST"]).optional(),
    mode: z.enum(["ONLINE", "ONSITE"]).optional(),
    organization: z.string().optional(),
  })
);

// Order-specific schemas (example)
export const orderFilterSchema = z.object({
  status: z.enum(["CREATED", "PAID", "FAILED"]).optional(),
  purpose: z.enum(["EVENT", "MEMBERSHIP"]).optional(),
  userId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  createdAt: dateRangeSchema.optional(),
  amount: numberRangeSchema.optional(),
});

export const orderQuerySchema = z.intersection(
  z.intersection(paginationSchema, sortSchema),
  z.object({
    search: z.string().optional(),
    status: z.enum(["CREATED", "PAID", "FAILED"]).optional(),
    purpose: z.enum(["EVENT", "MEMBERSHIP"]).optional(),
    userId: z.string().uuid().optional(),
  })
);

// Payment-specific schemas (example)
export const paymentFilterSchema = z.object({
  status: z.enum(["SUCCESS", "FAILED"]).optional(),
  userId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  createdAt: dateRangeSchema.optional(),
});

export const paymentQuerySchema = z.intersection(
  z.intersection(paginationSchema, sortSchema),
  z.object({
    search: z.string().optional(),
    status: z.enum(["SUCCESS", "FAILED"]).optional(),
    userId: z.string().uuid().optional(),
  })
);

// Subscription-specific schemas (example)
export const subscriptionFilterSchema = z.object({
  status: z
    .enum(["CREATED", "ACTIVE", "PAUSED", "CANCELLED", "EXPIRED"])
    .optional(),
  userId: z.string().uuid().optional(),
  subscriptionPlanId: z.string().uuid().optional(),
  currentPeriodEnd: dateRangeSchema.optional(),
});

export const subscriptionQuerySchema = z.intersection(
  z.intersection(paginationSchema, sortSchema),
  z.object({
    search: z.string().optional(),
    status: z
      .enum(["CREATED", "ACTIVE", "PAUSED", "CANCELLED", "EXPIRED"])
      .optional(),
    userId: z.string().uuid().optional(),
  })
);

// Membership-specific schemas (example)
export const membershipFilterSchema = z.object({
  isActive: z.coerce.boolean().optional(),
  userId: z.string().uuid().optional(),
  subscriptionPlanId: z.string().uuid().optional(),
  expiresAt: dateRangeSchema.optional(),
});

export const membershipQuerySchema = z.intersection(
  z.intersection(paginationSchema, sortSchema),
  z.object({
    isActive: z.coerce.boolean().optional(),
    userId: z.string().uuid().optional(),
  })
);

// EventAccess-specific schemas (example)
export const eventAccessFilterSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
  userId: z.string().uuid().optional(),
  eventId: z.string().uuid().optional(),
  expiresAt: dateRangeSchema.optional(),
});

export const eventAccessQuerySchema = z.intersection(
  z.intersection(paginationSchema, sortSchema),
  z.object({
    status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
    userId: z.string().uuid().optional(),
    eventId: z.string().uuid().optional(),
  })
);

// RefundRequest-specific schemas (example)
export const refundRequestFilterSchema = z.object({
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "REFUNDED", "FAILED"])
    .optional(),
  userId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  createdAt: dateRangeSchema.optional(),
});

export const refundRequestQuerySchema = z.intersection(
  z.intersection(paginationSchema, sortSchema),
  z.object({
    search: z.string().optional(),
    status: z
      .enum(["PENDING", "APPROVED", "REJECTED", "REFUNDED", "FAILED"])
      .optional(),
    userId: z.string().uuid().optional(),
  })
);

// UserSession-specific schemas (example)
export const userSessionFilterSchema = z.object({
  isActive: z.coerce.boolean().optional(),
  userId: z.string().uuid().optional(),
  deviceType: z.string().optional(),
});

export const userSessionQuerySchema = z.intersection(
  z.intersection(paginationSchema, sortSchema),
  z.object({
    isActive: z.coerce.boolean().optional(),
    userId: z.string().uuid().optional(),
    deviceType: z.string().optional(),
  })
);

// Export type inference helpers (examples)
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type EventQueryInput = z.infer<typeof eventQuerySchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
export type SubscriptionQueryInput = z.infer<typeof subscriptionQuerySchema>;
export type MembershipQueryInput = z.infer<typeof membershipQuerySchema>;
export type EventAccessQueryInput = z.infer<typeof eventAccessQuerySchema>;
export type RefundRequestQueryInput = z.infer<typeof refundRequestQuerySchema>;
export type UserSessionQueryInput = z.infer<typeof userSessionQuerySchema>;
