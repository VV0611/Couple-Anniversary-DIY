# Love Universe 💕

A cute, animated anniversary website for couples — countdown timers, a photo
gallery, a story timeline, a "how well do you know me" quiz, a love letter,
and more. No coding required to get your own version running.

一个可爱、有动画效果的情侣纪念日网站——倒计时、相册、故事时间线、"你有多了解我"测验、情书等等。不需要写代码就能用上自己的版本。

## 🚀 Get your own site running (no coding needed)
## 🚀 让网站自己跑起来（不需要写代码）

**Step 1 — Put the site online.**
The three files `index.html`, `style.css`, `script.js` (plus the `images/`,
`music/`, and `vendor/` folders) are your whole website. The easiest way to
publish them for free:

**第一步 — 把网站放上线。**
`index.html`、`style.css`、`script.js` 这三个文件（加上 `images/`、`music/`、`vendor/` 这三个文件夹）就是你整个网站。最简单的免费发布方法：

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag this entire folder into the page
3. Netlify gives you a live link in a few seconds — that's your website

1. 打开 [app.netlify.com/drop](https://app.netlify.com/drop)
2. 把整个文件夹拖进页面里
3. 几秒钟后 Netlify 就会给你一个可以打开的链接——这就是你的网站了

(GitHub Pages and Vercel also work the same drag-and-drop way if you prefer.)

（如果你想用别的平台，GitHub Pages 和 Vercel 也是同样的拖拽方式。）

**Step 2 — Fill in your details.**
Open your new link. Since it's your first visit, a **⚙️ Setup** form pops up
by itself — type in both your names, the date you met, the date you got
together, a title, and (optionally) a password. Press save.

**第二步 — 填写你们的资料。**
打开你的新链接，因为是第一次访问，**⚙️ Setup** 表单会自动弹出来——填上双方的名字、认识的日期、在一起的日期、标题，以及（可选的）密码，按保存。

That's it — the countdown timers, the opening greeting, the coupons, and the
"letter to the future" page all update automatically with what you typed.
You can reopen this form anytime with the **⚙️** button in the bottom-right
corner of the site, to change anything later.

就这样——倒计时、开场问候语、优惠券、还有"给未来的信"页面都会自动套用你填的内容。之后想改什么，随时可以点网站右下角的 **⚙️** 按钮重新打开这个表单。

> Your info is saved privately inside your own browser (nothing is uploaded
> anywhere). If you open the site on a different phone/computer, or clear
> your browser data, you'll need to fill the form in again there too.

> 你填的资料只存在你自己的浏览器里（不会上传到任何地方）。如果你换一台手机/电脑打开，或者清除了浏览器数据，就需要在那边重新填一次。

## 🖼️ Adding your own photos (no file editing needed)
## 🖼️ 添加自己的照片（不需要改文件）

Hover any photo on the home page or story timeline and a **📷 换照片**
button appears — click it, pick a photo from your device, done. On the
gallery page, click **＋ 添加照片** to upload a new photo into that month,
with a date picker and a caption box.

把鼠标移到首页或故事时间线的任意照片上，会出现 **📷 换照片** 按钮——点一下、从你的设备选一张照片，就完成了。在相册页面，点 **＋ 添加照片** 可以往对应月份加新照片，还能选日期、写说明文字。

These photos are saved right in your browser (using `IndexedDB`, a
larger-capacity version of `localStorage`) — they'll still be there the
next time you open the site, **as long as it's the same browser on the
same device**. Hover any gallery photo to see a ✕ button to remove it.

这些照片会存在你自己的浏览器里（用的是 `IndexedDB`，一种容量更大的 `localStorage`）——只要**还是同一台设备、同一个浏览器**，下次打开网站照片还会在。把鼠标移到相册照片上会出现 ✕ 按钮，可以删除。

The same goes for the 📅 date badges on the story timeline — click one to
open a date picker instead of typing a date by hand.

故事时间线上的 📅 日期也是同样道理——点一下会打开日期选择器，不用自己手动打字输入。

> ⚠️ Because this is per-browser storage, your partner won't automatically
> see photos (or any other content) you add from your own phone/laptop —
> each of you editing from your own device only saves it there. **See the
> next section — "📦 Sharing your finished site" — for how to turn what
> you've customized into a link your partner can actually open and see.**

> ⚠️ 因为这是"每个浏览器各自储存"的方式，另一半不会自动看到你在自己手机/电脑上加的照片（或任何其他内容）——每个人在自己设备上改的东西，只会存在自己那边。**怎么把你调好的内容变成对方真的能打开看到的链接，请看下面「📦 把改好的网站分享给对方」这一节。**

You can still add photos by editing files directly if you prefer — see the
"Making it fully yours" section below.

如果你更喜欢直接改文件加照片，也可以——见下面「✏️ 让网站完全变成你们自己的」这一节。

## 📦 Sharing your finished site (so your partner sees *your* content)
## 📦 把改好的网站分享给对方（让对方看到你调好的内容）

Everything above — Setup form, photos, story text, quiz questions, wishlist,
future letters — is saved only in **your own browser**. If you just send your
partner the Netlify link, they'll see the empty template, not what you made.

上面提到的所有东西——Setup 表单、照片、故事文字、quiz 题目、wishlist、未来信——都只存在**你自己的浏览器**里。如果你直接把 Netlify 链接发给对方，对方看到的会是空白模板，而不是你改好的内容。

To turn your edits into something you can actually share:

要把你改好的内容变成真的能分享出去的东西：

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

1. 先在你的浏览器里把网站调好（Setup 表单、照片、故事文字、quiz、wishlist、未来信——想加的都加好）。
2. 打开 **⚙️ Setup**，点底部的 **📦 导出最终版网站**。它会把你做的所有内容打包成一个 `.zip` 文件并下载——如果你传了很多照片，打包会花几秒钟。
3. 解压这个 zip，把解压出来的文件夹重新拖进 [app.netlify.com/drop](https://app.netlify.com/drop)（跟第一步一样的操作，只是这次拖的是你的成品文件夹）。你会拿到一个**新链接**。
4. 把这个新链接发给对方——这是一份烤好了你所有内容的成品。任何人打开都能立刻看到你调好的内容，不会再弹 Setup 表单，也不会有照片缺失。

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

有几点值得知道：
- 这是一次性的快照，不是实时同步。导出之后如果你又继续改内容，想让新链接也更新，就要重新导出、重新部署一次。
- 如果对方打开你发的链接后，自己又加了照片/做了编辑，那些内容只会存在**对方自己**的浏览器里——跟之前一样是"各自存各自的"，只是现在的起点是你做好的内容，而不是空白模板。
- 导出功能只会收录**通过网站自带的上传按钮**加进去的照片/音乐（或者本来就放在默认路径，比如 `images/photo1.jpg` 的文件）。如果你是手动把额外的图片文件丢进 `images/` 文件夹、没有经过网站的上传功能，部署前要自己手动把那些文件复制进导出的文件夹。
- 导出按钮需要通过真正的 `http(s)://` 连接加载你网站自己的文件（比如你的 Netlify 线上链接，或者本地开发服务器的 `localhost`）——如果你只是直接双击打开 `index.html`，用浏览器裸打开 `file://` 页面，这个功能是不能用的。

## ✏️ Making it fully yours (a little bit of copy-paste)
## ✏️ 让网站完全变成你们自己的（需要一点点复制粘贴）

The Setup form covers the essentials, but a few content-heavy sections are
too big for a form field, so they live directly in the files as
copy-paste-able examples. You don't need to know how to code — just find the
matching example block and duplicate/edit it, following the pattern already
there:

Setup 表单覆盖了最基本的内容，但有几个内容比较多的部分，没办法塞进一个表单输入框，所以它们是直接写在文件里、以"示例块"的形式存在的。你不需要懂写代码——只要找到对应的示例块，照着已有的格式复制/修改就行：

| Section 部分 | File 文件 | What to look for / 要找什么 |
|---|---|---|
| Daily rotating love notes<br>每日随机情话 | `script.js` | `dailyMessages` |
| Gallery month tabs (beyond the 2 examples)<br>相册月份标签（超过现有2个示例的话） | `index.html` | `.gallery-tabs`, add a `<button class="tab-btn" data-category="...">` (photos themselves you can just upload — see above)<br>加一个 `<button class="tab-btn" data-category="...">`（照片本身直接用上传功能加就好，见上面） |
| "Our story" timeline<br>"我们的故事"时间线 | `index.html` | search for `#story`, copy a `timeline-item` block<br>搜索 `#story`，复制一个 `timeline-item` 区块 |
| The love letter<br>情书 | `index.html` | search for `#wish`, edit inside `letter-content`<br>搜索 `#wish`，在 `letter-content` 里面编辑 |
| Quiz questions<br>Quiz 题目 | `script.js` | `QUIZ_BASE_QUESTIONS` |
| "Sweet stats" numbers<br>"甜蜜统计"数字 | `index.html` | search for `#analysis`, edit the `stat-card` blocks<br>搜索 `#analysis`，编辑 `stat-card` 区块 |
| "Energy chart" mood curve<br>"恋爱能量图"曲线 | `script.js` | `REAL_DATA` / `FUTURE_DATA` |

Any plain text editor works (even Notepad) — open the file, use Ctrl+F to
find the section, edit the text between the quotes, save.

用任何纯文本编辑器都行（记事本也可以）——打开文件，用 Ctrl+F 搜索对应部分，改引号里面的文字，保存。

## 🔒 Password gate (optional)
## 🔒 密码门（可选）

Leave the password field in Setup empty and no password screen ever shows.
Set one and visitors need it once per browser session. This is a light
"keep casual visitors out" gate, not real security — don't use it to protect
anything actually sensitive.

Setup 里的密码栏留空，就永远不会出现密码画面。设置了密码，访客每个浏览器会话就需要输入一次。这只是一个轻量级的"挡一下随便路过的人"的门，不是真正的安全机制——不要用它来保护真正敏感的东西。

## 🔥 Optional: syncing across devices (Firebase)
## 🔥 可选功能：跨设备同步（Firebase）

By default, everything you or your partner add on the site (quiz questions,
future letters, wishlist, a saved note) stays only in the browser you used.

默认情况下，不管是你还是对方在网站上加的内容（quiz 题目、未来信、wishlist、保存的留言），都只会留在当时用的那个浏览器里。

If you'd like both of you to see the same data from your own phones, create
a free project at [console.firebase.google.com](https://console.firebase.google.com),
turn on Firestore, and paste your project's keys into `FIREBASE_CONFIG` near
the top of `script.js`. This is optional and a bit more technical — skip it
and the site works great without it.

如果你们想要双方在各自手机上看到同一份数据，可以去 [console.firebase.google.com](https://console.firebase.google.com) 建一个免费项目，开通 Firestore，把项目的 key 填进 `script.js` 开头附近的 `FIREBASE_CONFIG`。这是可选功能，技术门槛稍微高一点——不填也完全不影响网站正常使用。
