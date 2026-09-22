## QR Code Generation & Printing

The system automatically generates unique QR codes for every active table in your restaurant.

### 1. Configure the Base URL
Open your `.env` file and set the `APP_BASE_URL`. 

**For Local Development:**
```env
APP_BASE_URL=http://localhost:3000

## UI / Stability Update

This version keeps the existing Vanilla JS + Node.js + MySQL architecture and improves the existing application rather than replacing it.

- Classic restaurant visual system: warm ivory, charcoal, burgundy and muted gold.
- Bordered, horizontally scrollable category controls.
- Each menu category is visually separated into its own section.
- Menu/cart image failures now use clean placeholders instead of broken-image icons.
- Removed inline image error handlers that conflicted with the server Content Security Policy.
- Order submission uses `window.location.replace()` so the cart is not left in browser history after a successful order.
- Confirmation page uses the correct Back to Menu element.
- Staff, cart, confirmation and QR pages share the same visual language.

The `.env` file is intentionally not included in redistributed ZIPs. Create it from `.env.example` and keep your local database credentials there.

