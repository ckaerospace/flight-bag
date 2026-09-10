# Flight Bag — Baby-QRH

Mobile-first PWA kneeboard for packing a baby outing. One phone, local only. Not cute. Not a couple-sync app.

**FLIGHT BAG** · Deutsch / 繁體中文.

Missions: **TAGESTOUR** · **AUTOFHRT** · **ÜBERNACHTUNG**, plus a thin **FLUG** tip card (not a go/no-go mission). Baby milk / formula / sterilized water are treated as security exceptions — the flight card does not block on adult 100 ml liquid rules.

## Live (iPhone)

- App: **https://ckaerospace.github.io/flight-bag/**
- Code: **https://github.com/ckaerospace/flight-bag**

Render Blueprint is in `render.yaml` (`npm install && npm run build` → publish `dist`). A live `*.onrender.com` URL needs a Render login (this agent’s Render MCP was unauthorized).

## Zum Home-Bildschirm (iPhone Safari)

Chrome oder In-App-Browser geben auf iOS **kein** echtes Home-Screen-App. **Safari** verwenden.

1. Im **Safari** diese Adresse öffnen: `https://ckaerospace.github.io/flight-bag/`
2. Unten **Teilen** tippen (Quadrat mit Pfeil).
3. **Zum Home-Bildschirm** tippen.
4. Name **Flight Bag** lassen (oder kürzen) → **Hinzufügen**.
5. Vom Home-Bildschirm öffnen — ohne Safari-Leiste. Haken bleiben auf diesem iPhone (`localStorage`).

Nach dem ersten Besuch der gebauten App sollte die Hülle offline aus dem Service Worker laden.

## Lokal starten

```bash
npm install
npm run dev
```

Öffnet `http://127.0.0.1:4321`.

```bash
npm run build
npm run preview
```

Statische Dateien liegen in `dist/`.

## Human factors

- Eine Phase auf einmal; Tür = nur Go/No-Go.
- HOLD (rot) / FREIGABE (grün) live an der Tür. Optionales sperrt FREIGABE nicht.
- Tipps ≥48×48 CSS-px; kein Hover-only.
- Fortschritt pro Mission, sofort gespeichert. Reset nur mit Bestätigung.
- Sprache: **DE** / **繁**.

Couple-Sync ist bewusst nicht in diesem Stand.
