export enum PaymentType {
  Cash,
  Card,
}

export enum DeliveryType {
  SelfPickup,
  Courier,
}

export enum OrderStatus {
  New,
  Processing,
  Cooking,
  ReadyForPickup,
  OutForDelivery,
  Delivered,
  Cancelled,
}
