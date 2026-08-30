import { orderStatusEnum, ownerEnum } from '@/lib/db/schema';

// Order status, stored on the row and edited by hand (2026-08-30). This
// replaced the derived milestone pipeline: an order is just a status plus a
// notes field now. No DB access in this module.

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type Owner = (typeof ownerEnum.enumValues)[number];

export const ORDER_STATUSES: readonly OrderStatus[] = orderStatusEnum.enumValues;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  canceled: 'Canceled',
};

export function isOrderStatus(v: unknown): v is OrderStatus {
  return typeof v === 'string' && (ORDER_STATUSES as string[]).includes(v);
}
