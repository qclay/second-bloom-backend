# Paying for Publications posts

This document describes the two-step flow for paying for publication posts.

---

## Step 1: Create payment (this API)

**Endpoint:** `POST {{BASE_URL}}/api/v1/payments`

**Headers:** `Authorization: Bearer <access_token>`

**Request body:**

```json
{
  "quantity": 1,
  "gateway": "CLICK"
}
```

**Response:** The API creates a payment record and returns `paymentId`, `invoiceUrl`, `amount`, `quantity`, and related fields. Use `paymentId` as `order_id` and `amount` in Step 2.

---

## Step 2: Create invoice (external payment backend)

**Endpoint:** `POST https://backend.secondbloom.uz/api/payment/create-invoice/`

**Request body:**

```json
{
  "amount": 1000,
  "meta_data": {
    "order_id": "f49c59f8-5b63-45d6-9c6f-697384a0b96d",
    "order_type": "posts",
    "description": "Payment for services"
  },
  "gateway": "click",
  "webhook_url": "https://e713e0b524d1.ngrok-free.app/api/v1/payments/webhook"
}
```

- **amount** — Use the amount from Step 1 response (in the expected unit, e.g. tiyins).
- **meta_data.order_id** — Use the `paymentId` from Step 1.
- **meta_data.order_type** — `"posts"` for publication posts.
- **meta_data.description** — Human-readable description (e.g. `"Payment for services"`).
- **gateway** — `"click"` for CLICK (lowercase).
- **webhook_url** — Your public URL for payment webhooks: `{{BASE_URL}}/api/v1/payments/webhook`.

**Response:** The external API returns a **URL**. Redirect the user to this URL to complete the payment.

---

## Summary

1. Call `POST {{BASE_URL}}/api/v1/payments` with `{ "quantity": 1, "gateway": "CLICK" }` and get `paymentId` and `amount`.
2. Call `POST https://backend.secondbloom.uz/api/payment/create-invoice/` with `amount`, `meta_data` (including `order_id` = `paymentId`, `order_type`: `"posts"`), `gateway`, and `webhook_url`.
3. Use the returned URL to redirect the user to the payment page.
