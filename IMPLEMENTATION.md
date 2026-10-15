# Implementation Notes

- **Menu Loading**: Asynchronously fetches `menu.json` using the Fetch API with a fallback error state if offline.
- **WhatsApp String Builders**: Encodes cart items, quantities, customer names, and order types directly into standard `wa.me` deep links.