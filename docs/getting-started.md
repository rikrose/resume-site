# Getting started: your own resume site

This guide takes you from nothing to your own resume site on your own domain, deployed
automatically from GitHub by Cloudflare. Work through it in order: later steps use the keys and
values you note down in step 1.

1. [Accounts, and what to note down](#1-accounts-and-what-to-note-down)
2. [Software for your computer](#2-software-for-your-computer)
3. [Get the code](#3-get-the-code)
4. [Make it yours](#4-make-it-yours)
5. [Test locally](#5-test-locally)
6. [Deploy with Cloudflare Workers Builds](#6-deploy-with-cloudflare-workers-builds)
7. [Updating the site later](#7-updating-the-site-later)

---

## 1. Accounts, and what to note down

Keep a scratch note (a password manager is best) for the values marked **📝 Note**. Secrets
(marked **🔒**) must never be committed to the repository.

### GitHub (free)

Hosts your copy of the code. Cloudflare deploys from it on every push.

- Create an account at <https://github.com/signup>.
- **📝 Note** your GitHub username.

### A domain name

The site is served on a domain you own (for example `resume.example.com`), and the contact form
sends email from that domain. The domain must use **Cloudflare DNS**: either buy it through
Cloudflare Registrar, or move an existing domain's nameservers to Cloudflare when you add it.

- **📝 Note** the domain (e.g. `example.com`) and the hostname you'll use for the resume (e.g.
  `resume.example.com`).

> No domain? You can run on a free `*.workers.dev` address instead; see
> [Without a custom domain](#without-a-custom-domain). The contact form still needs a domain to
> send email from.

### Cloudflare (free plan is enough)

Runs the site (Workers), builds it from GitHub (Workers Builds), and protects the contact form
from bots (Turnstile).

1. Create an account at <https://dash.cloudflare.com/sign-up>.
2. Add your domain (**Add a domain** on the dashboard home) and follow the steps to point its
   nameservers at Cloudflare. Wait until the domain shows as **Active**.
3. **Turnstile** (bot protection for the contact form): in the dashboard, open **Turnstile** →
   **Add widget**.
   - Hostnames: your resume hostname (e.g. `resume.example.com`). Add `localhost` too if you want
     to test the form locally with the real widget.
   - Widget mode: **Managed**.
   - **📝 Note** the **Site key** (public; it goes in the code).
   - **🔒 Note** the **Secret key** (becomes the `TURNSTILE_SECRET_KEY` secret).
4. **📝 Note** your **Account ID** (dashboard home → right-hand side, or any Worker's overview).
   You only need it if Wrangler asks which account to use.

### Resend (free tier is enough)

Delivers contact-form messages to your inbox.

1. Create an account at <https://resend.com/signup>.
2. **Domains** → **Add domain**: add your domain (or a subdomain such as `mail.example.com`).
   Resend lists DNS records (SPF, DKIM, and so on). Add each one in Cloudflare under your
   domain → **DNS** → **Records**. Wait until Resend shows the domain as **Verified**.
3. **API Keys** → **Create API key** with **Sending access** (restrict it to your domain if
   offered).
   - **🔒 Note** the API key (becomes the `RESEND_API_KEY` secret). Resend only shows it once.
4. Choose the sender address, e.g. `contact@example.com`. It must be on the verified domain but
   doesn't need to be a real mailbox.
   - **📝 Note** the sender address (`CONTACT_FROM`).

### Your inbox

- **🔒 Note** the address where contact-form messages should arrive (becomes the `CONTACT_TO`
  secret; it's a secret so it never appears in the code).

### Checklist

| Value                   | Example               | Used in                           |
| ----------------------- | --------------------- | --------------------------------- |
| GitHub username         | `octocat`             | step 3                            |
| Resume hostname         | `resume.example.com`  | `src/config.ts`, `wrangler.jsonc` |
| Turnstile site key      | `0x4AAAA…`            | `src/config.ts`                   |
| 🔒 Turnstile secret key | `0x4AAAA…`            | secret `TURNSTILE_SECRET_KEY`     |
| 🔒 Resend API key       | `re_…`                | secret `RESEND_API_KEY`           |
| Sender address          | `contact@example.com` | `wrangler.jsonc` → `CONTACT_FROM` |
| 🔒 Where messages go    | `you@gmail.com`       | secret `CONTACT_TO`               |
| Cloudflare Account ID   | `1a2b3c…`             | only if Wrangler asks             |

---

## 2. Software for your computer

| Software                                   | Why                                                                  | Install                                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Git**                                    | Get the code and push your changes                                   | <https://git-scm.com/downloads>                                                                                 |
| **Vite+ (`vp`)**                           | The project's toolchain. Also installs and manages Node.js and pnpm. | macOS/Linux: `curl -fsSL https://vite.plus \| bash`<br>Windows (PowerShell): `irm https://vite.plus/ps1 \| iex` |
| **A code editor**                          | Editing content with type-checking and autocomplete                  | [VS Code](https://code.visualstudio.com/) is a good default                                                     |
| **Chromium for Playwright** (after step 3) | Runs the story and screenshot tests in a real browser                | `pnpm exec playwright install chromium`                                                                         |

After installing Vite+, open a **new** terminal and check:

```sh
vp help        # Vite+ is installed
node -v        # v22.18 or later, or v24.11 or later
```

You don't need to install Node.js, pnpm or Wrangler separately: Vite+ provides Node.js and pnpm,
and the project installs its own Wrangler. The exact pnpm version is pinned in `package.json`,
and is downloaded automatically.

---

## 3. Get the code

1. On GitHub, open this repository and click **Fork** (or **Use this template** if offered) to
   make your own copy under your account.
2. Clone your copy and install everything:

   ```sh
   git clone https://github.com/rikrose/resume-site.git
   cd resume-site
   vp install
   pnpm exec playwright install chromium
   ```

---

## 4. Make it yours

Everything personal is in a handful of files. Your editor flags mistakes as you type, because
the content and settings are type-checked.

### Content: `src/content/resume.ts`

Your name, headlines, summary, contact links, stats, jobs, skills, projects, education and
community work. Sections you leave empty (`projects: []`) disappear from the page.

- **PDF download**: put your PDF in `public/` (e.g. `public/resume.pdf`) and set
  `resumePdf: "/resume.pdf"`. Use `""` for no download button. Delete the previous owner's PDF
  from `public/`.

### Settings: `src/config.ts`

| Setting             | Set it to                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `siteUrl`           | `https://` + your resume hostname, no trailing slash                                                                     |
| `turnstileSiteKey`  | your Turnstile **site** key                                                                                              |
| `noindex`           | `true` keeps the site out of search engines; `false` allows indexing (also remove `X-Robots-Tag` from `public/_headers`) |
| `currentlyEmployed` | `false` shows an "open to new roles" banner and contact button                                                           |
| `appearance`        | the look: a `theme` and optional per-section overrides                                                                   |

**Choosing a look.** `appearance.theme` is one of `performative` (the default), `minimal`,
`network` or `terminal`. `appearance.sections` overrides parts of it, e.g.
`{ palette: "ocean", hero: "centered" }`. The README's "Look and feel" section lists every
option. To see them all, run `vp run storybook` and use the **Theme** menu in the toolbar.

### Deployment: `wrangler.jsonc`

- `routes` → `pattern`: your resume hostname.
- `vars` → `CONTACT_FROM`: your sender address.
- `name`: the Worker's name in Cloudflare (`resume-website` is fine). Note it for step 6.

Then refresh the Worker's types, so the code knows your sender address:

```sh
pnpm wrangler types worker/worker-configuration.d.ts
```

### Generated images and leftovers

```sh
vp run favicons   # icons and web manifest from your name and palette
vp run og-image   # link-preview image from your name, headline, location and palette
```

Re-run these whenever your name, first headline, location or palette changes. Also update the
`<title>` in `public/404.html`.

---

## 5. Test locally

### Checks and tests

```sh
vp check    # formatting, lint, type errors
vp test     # unit tests, story tests, screenshot tests
```

The **story and screenshot tests** render placeholder content ("Jordan Example", from
`src/content/sample-resume.ts`), not your resume, so editing your content never breaks them. Your
real resume only appears in the built site. The screenshot tests compare each story with a
reference image in `src/__screenshots__/`. Those images are specific to the operating system they
were recorded on, so on macOS or Linux the first run fails. Record your own references:

```sh
vp run test:update-screenshots
```

Open the images in `src/__screenshots__/` and check that they look right, then commit them. From
then on, `vp test` tells you whenever a change alters how the site looks. After an intended
change, re-record and look again.

### See the site

```sh
vp run dev        # http://localhost:3000 — live-reloads as you edit
vp run storybook  # http://localhost:6006 — every section, option and theme
```

The contact form needs the Worker, which `vp run dev` doesn't run. To try the real thing,
including the security headers:

1. Copy `.dev.vars.example` to `.dev.vars`. It's ignored by Git. By default it **logs** messages
   instead of sending them, and uses Turnstile's always-pass test secret.
2. For the test secret, temporarily set `turnstileSiteKey` in `src/config.ts` to the test site
   key `1x00000000000000000000AA`, or add `localhost` to your widget's hostnames and put your
   real secret in `.dev.vars`.
3. Run `vp run preview:worker` and open the address it prints. Messages you send appear in that
   terminal.

Put your real Turnstile site key back before committing.

---

## 6. Deploy with Cloudflare Workers Builds

Workers Builds watches your GitHub repository and deploys every push to `main`.

### Push your changes

```sh
git add -A
git commit -m "Make it mine"
git push
```

### Connect the repository (once)

1. In the Cloudflare dashboard, open **Workers & Pages** → **Create application** → choose
   **GitHub**.
2. If asked, authorize the **Cloudflare Workers & Pages** GitHub app and install it on your
   account. You can limit it to just this repository.
3. Select your `resume-website` repository and configure the build:

   | Field                 | Value                                                                                           |
   | --------------------- | ----------------------------------------------------------------------------------------------- |
   | Worker / project name | **exactly** the `name` in `wrangler.jsonc` (e.g. `resume-website`). A mismatch fails the build. |
   | Production branch     | `main`                                                                                          |
   | Build command         | leave empty                                                                                     |
   | Deploy command        | `npx wrangler deploy` (the default)                                                             |
   | Root directory        | `/` (leave empty)                                                                               |

   Leave the build command empty because `wrangler deploy` already builds the site: it runs
   `vp run build` (set in `wrangler.jsonc`), which also writes the security headers. No build
   variables are needed. The build image's default Node.js (24) works, and the pnpm version
   comes from `package.json`.

4. **Save and Deploy**. The first deploy also creates the DNS record and HTTPS certificate for
   your hostname, which can take a few minutes.

### Add the secrets (once)

The contact form returns an error until these are set. In the dashboard, open your Worker →
**Settings** → **Variables & Secrets** → **Add**, choose type **Secret**, and add:

| Name                   | Value                        |
| ---------------------- | ---------------------------- |
| `CONTACT_TO`           | where messages should arrive |
| `RESEND_API_KEY`       | your Resend API key          |
| `TURNSTILE_SECRET_KEY` | your Turnstile secret key    |

From a terminal instead: `pnpm wrangler login`, then `pnpm wrangler secret put CONTACT_TO` (and
the same for the other two).

### Other branches

By default Workers Builds also builds non-production branches and tries to give each a preview
URL. This project turns preview URLs off (`preview_urls: false` in `wrangler.jsonc`), so those
builds report "No Preview URL". Either turn off **Enable Preview Builds** under the Worker's
**Settings** → **Build** → **Branch control**, or set up previews as described in Cloudflare's
docs.

### Check it

- Open `https://<your resume hostname>`. You should see your resume.
- Send yourself a message with **Get in touch**. It should arrive within a minute, with
  Reply-To set to the sender. If it doesn't: the Worker's **Logs** (or `pnpm wrangler tail`)
  show the reason, usually a missing secret or a domain that isn't verified in Resend yet.
- Paste the address into a LinkedIn or Slack message to check the link preview.

### Without a custom domain

In `wrangler.jsonc`, delete the `routes` entry and set `"workers_dev": true`. The site is then
served at `https://<worker name>.<your subdomain>.workers.dev` (shown on the Worker's overview).
Set `siteUrl` in `src/config.ts` to that address, and use it as the Turnstile widget's hostname.

---

## 7. Updating the site later

1. Edit `src/content/resume.ts` (or anything else).
2. `vp check` and `vp test`. If a screenshot test fails because of a change you meant, run
   `vp run test:update-screenshots` and look at the new images.
3. Commit and push. Cloudflare builds and deploys it automatically. Watch progress on the
   Worker's **Deployments** tab.

Workers Builds doesn't run the tests, so run them before you push.
