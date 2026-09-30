# Deadline Widget Hook

A Cloudflare Worker that keeps a countdown widget on Notion pages in sync with their `Deadline` and `Status` properties, plus the static widget pages it points to.

Used by the **Projects** and **Tasks** databases.

---

## How it works

```
Deadline or Status edited in Notion
  -> Notion automation sends a webhook (POST, header x-secret)
  -> Worker: which database? completed? which deadline?
  -> Worker changes the URL of the widget embed on the page to one of:

       /countdown?to=YYYY-MM-DDTHH:mm   flip countdown
       /pending                         "No deadline" badge
       /done                            "Completed!" badge

  -> Notion shows the page; it is a static file, the worker does not run for it
```

The worker only **updates** an existing widget embed. It never creates or deletes blocks. New pages get the embed from the database template.

### What the widget shows

| Page state | Widget |
|---|---|
| Status is a completed status | `/done` badge |
| Active, no deadline | `/pending` badge |
| Active, deadline set | `/countdown` |

Countdown colors (see `public/countdown/urgency.js`):

| Time left | Color |
|---|---|
| more than 3 days | `#24a9e1` (default, from `shared/card.css`) |
| less than 3 days | `#FFC800` |
| less than 1 day | `#FB2A00` |
| deadline reached | `#FF0000`, label changes to OVERDUE and tiles count up |

The theme (light or dark) follows the viewer's system color scheme. It matches Notion only when Notion is set to **Use system setting**.

### Rules

- A deadline without time means **12:00** that day (`DEFAULT_DEADLINE_TIME`).
- For a date range, the **end** of the range is the deadline.
- The deadline is shown as wall-clock time, in the viewer's time zone.
- Pages from databases not listed in `DATABASES` are ignored.
- Only top-level blocks of a page are searched. An embed inside columns, toggles or callouts is not found.

---

## Project structure

```
public/
  countdown.html        Countdown widget page (URL: /countdown?to=...)
  clock.html            Clock widget page (URL: /clock)
  done.html             "Completed!" badge (URL: /done)
  pending.html          "No deadline" badge (URL: /pending)

  shared/               Used by more than one widget
    card.css            Card, theme, font, default accent color
    tile.css            Flip tile and its animation
    tile.js             FlipTile and createTiles
    fit.js              Fits a label to the width of another element
    time.js             Duration math and pad2

  countdown/            Countdown only
    countdown.css
    countdown.js        Wires time, tiles, colors and label fitting
    urgency.js          Urgency colors and deadline parsing

  clock/                Clock only
    clock.css
    clock.js            Wires local time and date to the tiles
    clock-format.js     Clock time and date formatting

  badges/               Completed and No deadline badges
    badge.css           Shared badge layout (icon and text)
    done.css            Green accent
    pending.css         Amber accent

src/
  index.ts              Entry point: secret check, payload parsing, error mapping
  config.ts             All settings: databases, page paths, defaults
  env.ts                Worker environment type
  http.ts               HttpError and json() helper
  lib/datetime.ts       Wall-clock time from ISO 8601 strings
  notion/               Notion API client, types, property readers, IDs, block search
  webhook/              Secret check and webhook payload parsing
  widget/rules.ts       Database, completion and deadline rules
  widget/widget.ts      Widget page URLs
  widget/sync.ts        The sync scenario

test/                   Vitest unit tests
```

Page HTML files stay in the root of `public/`: their paths are the widget URLs stored in Notion embeds, and moving them breaks the embeds. Styles and scripts are grouped by widget; files used by more than one widget go to `shared/`.

---

## Notion setup

Everything in this section lives in Notion, not in git. If something breaks after a change in Notion, check it against this list.

### Integration

- Name: **Deadline Widget Hook**, type **Internal**.
- Capabilities: Read content, Update content, Insert content. No user information.
- Connected to the **Projects**, **Tasks** and **Deadline Widgets (test)** databases only (via `•••` -> Connections on each database). Do not connect parent pages: the integration would see everything below them.

### Databases

| Database | ID | Completed statuses |
|---|---|---|
| Projects | `396e539b924b803ca8c9ea399e9c9b5c` | `Close`, `Done` |
| Tasks | `397e539b924b80b2872adf70d28b9c58` | `הושלם - Completed` |
| Deadline Widgets (test) | `3e8e539b924b8006a3a5f995677a71b6` | `Done` |

The database ID is the 32 characters before `?v=` in the link of the database opened as a full page. Linked views (for example Related Tasks on a project page) have their own IDs and must not be used.

Required properties, names must match `DATABASES` in `src/config.ts` exactly:

- `Deadline`: Date
- `Status`: Status

Renaming either property in Notion makes the worker skip the pages.

### Automation (one per database)

- Triggers: **Property edited -> Deadline** and **Property edited -> Status**, combined with **Any** (the default is All, which never fires).
- Action: **Send webhook**
  - URL: `https://deadline-widget-hook.arme-malikinss.workers.dev`
  - Custom header: `x-secret` = production `HOOK_SECRET`

Before deleting or renaming a property, remove it from the automation triggers first. A trigger on a missing property makes the whole automation invalid and disables it.

### Sync widget button (one per database)

A **Button** property named **Sync widget** with the action **Send webhook**, same URL and `x-secret` header as the automation. It makes the worker process a page without changing its data. Use it after applying a template to an existing page, or whenever a widget looks out of date.

### Templates

Each database has a default template with a widget embed that points to:

```
https://deadline-widget-hook.arme-malikinss.workers.dev/pending
```

The Notion API cannot set the size of an embed, so the size comes from the template. To get a correctly sized embed with a new URL, copy an existing embed block (select it with `⋮⋮`, Ctrl+C) instead of inserting a new one with `/embed`. The worker keeps the size when it updates the URL.

### Time Left formula

Both databases have a formula that shows the time left as text. It follows the same rules as the widget (12:00 default, end of range, same thresholds). If the widget rules change, update the formula too.

Projects:

```
if(prop("Status") == "Done" or prop("Status") == "Close",
  style("✅ Completed", "b", "green_background"),
  if(empty(prop("Deadline")),
    style("⚠️ Deadline not set. Please set a deadline", "b", "yellow_background"),
    lets(
      raw, if(empty(dateEnd(prop("Deadline"))), prop("Deadline"), dateEnd(prop("Deadline"))),
      deadline, if(hour(raw) == 0 and minute(raw) == 0, dateAdd(raw, 12, "hours"), raw),
      mins, dateBetween(deadline, now(), "minutes"),
      a, abs(mins),
      d, floor(a / 1440),
      h, floor((a % 1440) / 60),
      m, a % 60,
      txt, format(d) + "d " + format(h) + "h " + format(m) + "m",
      if(mins <= 0,
        style("⛔ Overdue by " + txt, "b", "red_background"),
        if(mins < 1440,
          style("⏳ " + txt, "b", "orange_background"),
          if(mins < 4320,
            style("⏳ " + txt, "b", "yellow_background"),
            style("⏳ " + txt, "b", "blue_background")
          )
        )
      )
    )
  )
)
```

Tasks: the same formula with the first line replaced by:

```
if(prop("Status") == "הושלם - Completed",
```

Known difference: the formula cannot tell "no time" from "00:00", so a deadline explicitly set to 00:00 is treated as 12:00 by the formula but as 00:00 by the widget.

---

## Values kept in more than one place

When one of these changes, update every place in the list.

| Value | Places |
|---|---|
| Completed statuses | `DATABASES` in `src/config.ts`, Time Left formulas |
| Property names `Deadline`, `Status` | Notion, `DATABASES` in `src/config.ts`, automations, formulas |
| Default time 12:00 | `DEFAULT_DEADLINE_TIME` in `src/config.ts`, Time Left formulas |
| Urgency thresholds (3 days, 1 day) | `public/countdown/urgency.js`, Time Left formulas |
| Worker URL | `WORKER_ORIGIN` in `src/config.ts`, automations, buttons, templates |
| `HOOK_SECRET` | Cloudflare secret, `x-secret` header in every automation and button |
| `to` parameter name | `COUNTDOWN_DEADLINE_PARAM` in `src/config.ts`, `parseDeadline` in `public/countdown/urgency.js` |
| Tile markup (`#tile-template`) | `public/countdown.html`, `public/clock.html` |

---

## Development

### Requirements

- Node.js (LTS)
- Cloudflare account with access to the worker (`npx wrangler login`)

### Setup

```cmd
npm install
copy .dev.vars.example .dev.vars
```

Fill `.dev.vars` with the integration token and a local secret. The file is ignored by git and must never be committed.

### Commands

| Command | What it does |
|---|---|
| `npm run check` | Type checks `src` and `test`, runs all tests |
| `npx wrangler dev` | Runs the worker and pages locally on `http://127.0.0.1:8787` |
| `npx wrangler tail` | Streams production logs |
| `npx wrangler deploy` | Deploys code and static pages |
| `npx wrangler types` | Regenerates `worker-configuration.d.ts` after changing `wrangler.jsonc` |

Run only one `wrangler dev` per project. A second one picks another port and can fail with `database is locked`.

Order of work: **`npm run check` -> commit -> push -> deploy**.

### Local pages

```
http://127.0.0.1:8787/countdown?to=2026-12-01T12:00
http://127.0.0.1:8787/pending
http://127.0.0.1:8787/done
```

### Local webhook test (cmd)

```cmd
set SECRET=local_HOOK_SECRET
set PAGE_ID=32_character_page_id
curl -i -X POST http://127.0.0.1:8787 -H "Content-Type: application/json" -H "x-secret: %SECRET%" -d "{\"data\":{\"id\":\"%PAGE_ID%\"}}"
```

A local run changes real Notion pages. Use test pages only.

### Secrets

| Secret | Purpose |
|---|---|
| `NOTION_TOKEN` | Integration token for the Notion API |
| `HOOK_SECRET` | Shared secret checked against the `x-secret` header |

Production values are set with `npx wrangler secret put <NAME>` and cannot be read back. To rotate `HOOK_SECRET`:

1. Generate a new value: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. `npx wrangler secret put HOOK_SECRET`
3. Update the `x-secret` header in every automation and every Sync widget button.

---

## Troubleshooting

Start with `npx wrangler tail` and repeat the change in Notion.

| What you see | Meaning | What to check |
|---|---|---|
| Nothing in `tail` | Notion did not send a webhook | Automation exists in this database, is enabled, not invalid, triggers use **Any** |
| `database is not configured` | Database ID not in `DATABASES` | ID in `src/config.ts` |
| `no widget on page` | No managed embed on the page | Embed URL (View original) points to `/countdown`, `/pending` or `/done`; embed is on the top level of the page |
| `unchanged` but the widget looks old | URL is already correct | Reload the page in Notion (Ctrl+R) |
| `403 forbidden` | Wrong `x-secret` | Header value in the automation or button |
| `502` with `object_not_found` | Integration cannot see the page | Connections of the database |
| `502` with `unauthorized` | Token rejected | `NOTION_TOKEN` secret |

---

## Known limitations

- The Notion API cannot set the size or position of an embed. Sizes come from templates.
- Notion automations run with a delay of a few seconds.
- Only top-level blocks are searched for the widget embed.
- The widget theme follows the system, not a manually chosen Notion theme.