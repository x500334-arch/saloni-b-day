# 🎂 Interactive 3D Birthday Celebration Website

A single-page, festive, pink-pastel birthday celebration site featuring 3D
animations (Three.js), a personalized letter, a "surprise box" cooler-style
interactive centerpiece, a gift wishlist form, and a friends' wishes wall —
all backed by the RESTful Table API for persistence.

## ✅ Currently Completed Features

1. **Hero Section**
   - Circular photo frame at the very top for the birthday person's photo
     (currently a generated pastel placeholder at `images/birthday-person.png`
     — replace with the real photo any time).
   - Real 3D extruded "HAPPY BIRTHDAY" headline rendered with Three.js:
     red-pink glossy material, point-light glow, gentle auto-rotation, and
     mouse/touch parallax tilt. Includes a canvas-texture fallback if the
     remote font file ever fails to load, so the headline never breaks.
   - Soft glowing particle field drifting behind the headline for depth.
   - Floating pastel balloons + twinkling sparkle emoji scattered across the
     whole page (lightweight DOM/CSS animation, not full 3D, for performance).
   - Ambient confetti bursts fire automatically after load and can be
     re-triggered by any form submission or the surprise box.

2. **3D Animated "Cooler" / Surprise Box Section**
   - A fully modeled, draggable 3D present-box/cooler (Three.js): pastel
     pink cylinder body, white accent band with heart dots, hinged lid with
     a handle, and a floating ring of glowing sparkle sprites overhead.
   - Drag with mouse or touch to spin it around (inertia-based rotation).
   - Click the box or press "Open My Surprise!" to hinge the lid open,
     reveal a rising two-tier cake with 5 flickering, glowing candles, and
     fire a confetti burst centered on the box.

3. **Letter / Wishes Section**
   - Hand-styled "letter" card (dashed pink border, envelope icon, slightly
     rotated for a handwritten feel) with a funny + heartfelt birthday
     message, ready to be edited with the real person's name and inside
     jokes.

4. **Cute Interactive Decorations**
   - Balloons, sparkles, and a subtle animated static/noise overlay for a
     playful, "staticky" whimsical texture across the entire page.
   - Section quick-navigation dots on the right edge (desktop) that
     highlight the section currently in view.

5. **Gift Wishlist Box**
   - W3.CSS-styled form (`#wishlist-form`) with gift idea, optional
     details/link, and optional name fields.
   - Submissions are optimistically rendered immediately and persisted via
     the RESTful Table API to the `gift_wishlist` table; the list reloads
     from the table on page load.

6. **Friends' Wishes Section**
   - W3.CSS-styled form (`#friends-form`) with name, message, and an emoji
     "mood" picker.
   - Submitted wishes appear instantly as cards in a responsive grid and are
     persisted via the RESTful Table API to the `friend_wishes` table.

## 🌐 Functional Entry Points

Single page app — everything lives on `index.html`, navigated via in-page
anchors:

- `index.html#hero` — hero / photo / 3D headline
- `index.html#cooler-section` — interactive 3D surprise box
- `index.html#letter-section` — birthday letter
- `index.html#wishlist-section` — gift wishlist form + list
- `index.html#friends-section` — friends' wishes form + card wall

### Data API (RESTful Table API — relative paths, same origin)

- `GET /tables/gift_wishlist?limit=100&sort=-created_at` — list gift ideas
- `POST /tables/gift_wishlist` — body: `{ item_name, details, added_by }`
- `GET /tables/friend_wishes?limit=100&sort=-created_at` — list friend wishes
- `POST /tables/friend_wishes` — body: `{ name, message, emoji }`

No query parameters are required beyond the optional pagination/sort shown
above; both forms POST directly with `fetch()`.

## 🗄️ Data Models

**`gift_wishlist`**
| Field | Type | Description |
|---|---|---|
| id | text | Record id (system) |
| item_name | text | Name of the requested gift |
| details | text | Optional notes / size / color / link |
| added_by | text | Optional name of who added the idea |

**`friend_wishes`**
| Field | Type | Description |
|---|---|---|
| id | text | Record id (system) |
| name | text | Name of the well-wisher |
| message | rich_text | The birthday message |
| emoji | text | Selected mood emoji |

Both tables also carry the standard system fields (`created_at`,
`updated_at`, `gs_project_id`, `gs_table_name`).

Preview-mode rows (added via the editor) live in the preview data store and
are **separate** from a Hosted-Deployed site's live D1 database — the two
are never synced. If you deploy and want the preview rows visible on the
live site, ask to have them copied into the live database.

## 🧩 Tech Stack

- HTML5 + CSS3 (custom properties, animations) + vanilla JavaScript (no
  build step)
- **Three.js r0.128** (+ legacy `FontLoader`/`TextGeometry` examples) for all
  3D rendering (hero headline + surprise box)
- **W3.CSS** for form layout/utility classes (inputs, textareas, containers)
- **Font Awesome 6** for icons
- **Google Fonts** — Baloo 2 (display) + Poppins (body)
- RESTful Table API for gift wishlist + friends' wishes persistence

## 📁 File Structure

```
index.html            Main single-page site
css/style.css          All styling (theme, layout, animations)
js/hero3d.js           Hero 3D "HAPPY BIRTHDAY" headline (Three.js)
js/cooler3d.js         3D surprise box / cooler centerpiece (Three.js)
js/decor.js            Ambient floating balloons + sparkles (DOM/CSS)
js/confetti.js         Canvas 2D confetti burst engine + global fireConfetti()
js/app.js              Wishlist + friends' wishes forms, Table API calls
images/birthday-person.png   Placeholder hero photo (replace with the real one)
```

## 🚧 Not Yet Implemented / Possible Next Steps

- **Personalization pass**: swap the placeholder photo for the real
  birthday person's photo, replace the sample name/letter text, and adjust
  the color accents if a different favorite color is preferred.
- **Photo upload UI**: there is currently no in-browser upload control (a
  static site can't persist uploaded files to a server); the photo is a
  fixed file in `images/`. Swapping it means replacing that file directly.
- **Moderation**: friend wishes and wishlist items are public/open — anyone
  with the link can post. Add a simple client-side profanity filter or a
  "pending approval" flag in the table if moderation becomes important
  (still can't do server-side auth on a static site, but a manual review
  flag is possible).
- **Music/audio**: no background birthday music yet — could add a
  muted-by-default `<audio>` toggle if desired.
- **Countdown timer**: a "time until midnight" or "time since the party
  started" countdown could be added to the hero for extra flair.

## 🚀 Deployment

This is a static site — publish it from the **Publish tab** for one-click
deployment, or ask to run a Hosted Deploy if you want it pushed to the
project's live Cloudflare-backed URL (creates/updates the `gift_wishlist`
and `friend_wishes` tables in the live D1 database automatically).
