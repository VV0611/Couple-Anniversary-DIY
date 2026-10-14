# Love Universe 💕

A cute, animated anniversary website for couples — countdown timers, a photo
gallery, a story timeline, a "how well do you know me" quiz, a love letter,
and more. No coding required to get your own version running.

## 🚀 Get your own site running (no coding needed)

**Step 1 — Put the site online.**
The three files `index.html`, `style.css`, `script.js` (plus the `images/`,
`music/`, and `vendor/` folders) are your whole website. The easiest way to
publish them for free:

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag this entire folder into the page
3. Netlify gives you a live link in a few seconds — that's your website

(GitHub Pages and Vercel also work the same drag-and-drop way if you prefer.)

**Step 2 — Fill in your details.**
Open your new link. Since it's your first visit, a **⚙️ Setup** form pops up
by itself — type in both your names, the date you met, the date you got
together, a title, and (optionally) a password. Press save.

That's it — the countdown timers, the opening greeting, the coupons, and the
"letter to the future" page all update automatically with what you typed.
You can reopen this form anytime with the **⚙️** button in the bottom-right
corner of the site, to change anything later.

> Your info is saved privately inside your own browser (nothing is uploaded
> anywhere). If you open the site on a different phone/computer, or clear
> your browser data, you'll need to fill the form in again there too.

## 🖼️ Adding your own photos (no file editing needed)

Hover any photo on the home page or story timeline and a **📷 换照片**
button appears — click it, pick a photo from your device, done. On the
gallery page, click **＋ 添加照片** to upload a new photo into that month,
with a date picker and a caption box.

These photos are saved right in your browser (using `IndexedDB`, a
larger-capacity version of `localStorage`) — they'll still be there the
next time you open the site, **as long as it's the same browser on the
same device**. Hover any gallery photo to see a ✕ button to remove it.

The same goes for the 📅 date badges on the story timeline — click one to
open a date picker instead of typing a date by hand.

> ⚠️ Because this is per-browser storage, your partner won't automatically
> see photos (or any other content) you add from your own phone/laptop —
> each of you editing from your own device only saves it there. **See the
> next section — "📦 Sharing your finished site" — for how to turn what
> you've customized into a link your partner can actually open and see.**

You can still add photos by editing files directly if you prefer — see the
"Making it fully yours" section below.

## 📦 Sharing your finished site (so your partner sees *your* content)

Everything above — Setup form, photos, story text, quiz questions, wishlist,
future letters — is saved only in **your own browser**. If you just send your
partner the Netlify link, they'll see the empty template, not what you made.

To turn your edits into something you can actually share:

1. Finish customizing the site in your browser (Setup form, photos, story
   text, quiz, wishlist, future letters — whatever you want to add).
2. Open **⚙️ Setup** and click **📦 导出最终版网站 (Export final site)** at
   the bottom. It packages everything you've done into a `.zip` file and
   downloads it — this takes a few seconds if you've uploaded a lot of photos.
3. Unzip it, and drag that unzipped folder into
   [app.netlify.com/drop](https://app.netlify.com/drop) again (same as Step 1,
   but with your finished folder this time). You'll get a **new link**.
4. Send that new link to your partner — it's a finished copy, baked with
   everything you added. Anyone who opens it sees your content immediately,
   no Setup form, no missing photos.

A couple of things worth knowing:
- This is a one-time snapshot, not live syncing. If you keep editing after
  exporting, you'll need to export + redeploy again for the new link to
  reflect the changes.
- If your partner opens the exported link and adds their own photos/edits,
  those only save in *their* browser — same local-only behavior as before,
  it just starts from your finished content instead of a blank template.
- The export only picks up photos/music added *through the site's own
  upload buttons* (or files already sitting at the default paths like
  `images/photo1.jpg`). If you manually dropped extra image files into
  `images/` outside the site's UI, copy those into the exported folder
  yourself before redeploying.
- The export button needs to load your site's own files over a real
  `http(s)://` connection (your live Netlify link, or `localhost` via a
  local dev server) — it won't work if you just double-click `index.html`
  and open it as a bare `file://` page in your browser.

## ✏️ Making it fully yours (a little bit of copy-paste)

The Setup form covers the essentials, but a few content-heavy sections are
too big for a form field, so they live directly in the files as
copy-paste-able examples. You don't need to know how to code — just find the
matching example block and duplicate/edit it, following the pattern already
there:

| Section | File | What to look for |
|---|---|---|
| Daily rotating love notes | `script.js` | `dailyMessages` |
| Gallery month tabs (beyond the 2 examples) | `index.html` | `.gallery-tabs`, add a `<button class="tab-btn" data-category="...">` (photos themselves you can just upload — see above) |
| "Our story" timeline | `index.html` | search for `#story`, copy a `timeline-item` block |
| The love letter | `index.html` | search for `#wish`, edit inside `letter-content` |
| Quiz questions | `script.js` | `QUIZ_BASE_QUESTIONS` |
| "Sweet stats" numbers | `index.html` | search for `#analysis`, edit the `stat-card` blocks |
| "Energy chart" mood curve | `script.js` | `REAL_DATA` / `FUTURE_DATA` |

Any plain text editor works (even Notepad) — open the file, use Ctrl+F to
find the section, edit the text between the quotes, save.

## 🔒 Password gate (optional)

Leave the password field in Setup empty and no password screen ever shows.
Set one and visitors need it once per browser session. This is a light
"keep casual visitors out" gate, not real security — don't use it to protect
anything actually sensitive.

## 🔥 Optional: syncing across devices (Firebase)

By default, everything you or your partner add on the site (quiz questions,
future letters, wishlist, a saved note) stays only in the browser you used.

If you'd like both of you to see the same data from your own phones, create
a free project at [console.firebase.google.com](https://console.firebase.google.com),
turn on Firestore, and paste your project's keys into `FIREBASE_CONFIG` near
the top of `script.js`. This is optional and a bit more technical — skip it
and the site works great without it.
