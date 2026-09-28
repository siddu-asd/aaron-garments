# Aaron Garments

A responsive multi-page fashion storefront prototype built with React, TypeScript, Vite, and React Router.

## Pages and shopping flows

- Home page with collection edits, category cards, featured pieces, and brand story.
- Shop page with URL-based categories and search, sorting, and product cards.
- Product details with size guide, size selection, quantity, care notes, and delivery information.
- Persistent wishlist and size-aware shopping bag (saved in browser local storage).
- Cart with quantity editing, removal, shipping threshold/progress, and order summary.
- Checkout form with validation and a clearly labeled demo order confirmation.
- Our Story and Help / FAQs pages, with responsive navigation and shared footer.

## Run locally

- `npm install` — install dependencies
- `npm run dev` — start the development server
- `npm run build` — type-check and create a production build
- `npm run lint` — run Oxlint

## Before production

This is a front-end prototype. Products, prices, reviews, sizing, and store policies are sample content. Checkout does not take payment or send orders; newsletter and customer support are not connected. Product photography is loaded from Unsplash and should be replaced with Aaron Garments-owned or properly licensed imagery. Connect an inventory/catalog service, real shipping and return policies, customer support, email service, and a payment provider before accepting live orders.
