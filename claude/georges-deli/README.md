# George's Deli

A mobile-first, static, bilingual (EN/ES) site for George's Deli, a family-run
Honduran restaurant in Morristown, NJ. Frontend only: there's no backend, no
ordering and no delivery.

```bash
npm install
npm run dev       # http://localhost:5173
npm run test:run  # domain rules: hours, soups, hot bar, prices, search
npm run build     # static output in dist/, deployable to any host
```

## Where things live

| To change…                        | Edit                                   |
| --------------------------------- | -------------------------------------- |
| Dishes, prices, descriptions      | `src/data/menu.ts`                     |
| Phone, address, hours, Instagram  | `src/data/site.ts`                     |
| Hot bar prices, About text, Gallery | `src/data/site.ts`                   |
| Today's hot bar dishes            | `public/hotbar.json`                   |
| Photos                            | drop into `public/photos/`, set `photo: 'photos/x.jpg'` |
| Interface text (EN + ES)          | `src/i18n.tsx`                         |
| Colours, radii, fonts             | tokens at the top of `src/styles.css`  |

`hotbar.json` only shows when its `date` is today in New Jersey. Anything older
or newer shows the "not posted yet" message. The parsing logic is in
`src/lib/hotbar.ts`, ready for a WhatsApp importer.

Routes are hash-based (`#/menu?item=pupusas`), so no server rewrites are needed.
The schema.org `Restaurant` JSON-LD is generated from the data files at build
time (`src/schema.ts`).
