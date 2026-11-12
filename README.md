# JEMIKI

JEMIKI is a responsive jewellery storefront demo with a Node.js server and a local SQLite database. It has no payment gateway and does not collect card details.

## Requirements

- Node.js 22.9 or newer (uses Node's built-in `node:sqlite` module)
- npm

## Run locally

```sh
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). The server applies the local SQL migration and seeds the sample catalogue on first start. To explicitly initialise or seed missing sample rows, run:

```sh
npm run db:migrate
npm run db:seed
```

To use a different port or configure a flat demo shipping charge, copy `.env.example` to `.env` and set `PORT` and/or `SHIPPING_CHARGE`. The app has no dependency on a paid service. The SQLite file is local and ignored by Git.

## Shopping flow

1. Browse a category or use Shop All. Search by product name, sort by newest or price, select a category, limit the maximum price, or show in-stock products.
2. Open a product page and add it to the bag or wishlist. Bag and guest wishlist state persist in browser local storage.
3. Continue to checkout and submit sample customer details. The backend reloads prices and stock, calculates totals, saves the order and line items in one SQLite transaction, and safely decrements stock.
4. The confirmation page displays the generated demo order number. No payment is taken.

Newsletter subscriptions and contact form messages are validated and saved in SQLite. Duplicate newsletter addresses receive a friendly response.

## Stack and files

- Node.js built-in HTTP server and SQLite module, without third-party runtime packages
- `server.js`: static hosting and JSON API routes
- `seed.js`: 16 editable sample products
- `migrations/001_initial.sql`: idempotent initial database migration
- `app.js`, `styles.css`, `index.html`: storefront, local cart/wishlist, responsive layout
- `data/jemiki.sqlite`: generated local database (ignored by Git)

There is no admin dashboard. Product data is editable in the `items` catalogue in `seed.js`; existing records are inserted with `INSERT OR IGNORE`, so edit the local database or delete it before re-seeding to replace previously seeded values.

## API

- `GET /api/products` — catalogue with query parameters `category`, `q`, `sort` (`newest`, `price-asc`, `price-desc`), `available=true`, `min`, `max`
- `GET /api/products/:slug` — product details
- `POST /api/orders` — validates customer details and current item IDs, quantities, stock, and server-side prices; saves order transactionally
- `POST /api/newsletter` — validates and saves an email subscription
- `POST /api/contact` — validates and saves a contact message

## GitHub preparation

Review the files, then create a public repository on GitHub and push this folder:

```sh
git init
git add .
git commit -m "Build JEMIKI jewellery storefront demo"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

The `.gitignore` excludes local SQLite databases, environment files, dependencies, and build output. Replace the example GitHub remote with your own repository URL. Add screenshots to this README after capturing the site locally.

## Public demo deployment

The repository includes a `render.yaml` Blueprint for a free Render web service. Connect the repository to Render and create the Blueprint to get a public `onrender.com` URL. Free services spin down after inactivity, and their local filesystem is temporary, so the demo SQLite database (including placed orders) can reset after a restart. Do not enter real customer information.

## Screenshots

Add desktop and mobile screenshots here after running the storefront locally.

## Before a real launch

The catalogue and order workflow are for demo use. Add verified product/material details, actual business and social links, a real shipping/returns policy, production security controls, and a payment provider before accepting real orders. Product photography uses remote Unsplash image URLs; replace these with licensed brand photography for production.
