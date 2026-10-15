/* ============================================
   LOVE ANNIVERSARY WEBSITE — TEMPLATE — script.js
   1  Profile  — 让每个用户自己 key in 名字/日期，存在 localStorage
   2  Opening  — 打字动画、星星
   3  Home     — 倒计时、随机消息、🎵 音符、📅 周年倒计时
   4  Story    — 时间线、照片
   5  Gallery  — 标签切换、灯箱
   6  Analysis — 统计、问答、飘字
   7  Energy   — 互动猜测 + 动画曲线图
   8  Wish     — 情书、优惠券下载、发送抱抱
   9  Ending   — 星星、🌙 月相

   ── 怎么客制化 ──
   • 名字 / 认识日期 / 在一起日期 / 密码 → 点击右下角 "⚙️ Setup" 按钮，
     直接在网页上填表，存在浏览器 localStorage，不用碰代码。
   • 每日消息 / 相册照片 / 情书全文 / Quiz 题目 / 时间线故事
     → 这些内容比较长，直接在这个文件（dailyMessages / galleryData /
     QUIZ_BASE_QUESTIONS）和 index.html（情书 / 时间线）里编辑替换。
============================================ */

// ========================================
// 0. PROFILE — 用户自己 key in 的资料
// ========================================
// 这是整个模板"可以自定义"的核心机制：
//   1. 表单收集用户输入 → 2. 存进 localStorage → 3. 页面读取 localStorage
//      来决定要显示什么，而不是把名字/日期写死在代码里。
// 别人 clone 这个仓库后，不用改一行代码，打开网站填个表单就能用。

var PROFILE_KEY = "love_profile";

var DEFAULT_PROFILE = {
  partnerA: "Partner A",
  partnerB: "Partner B",
  metDate: "2024-01-01",
  togetherDate: "2024-02-14",
  siteTitle: "Happy Anniversary",
  subtitle: "The day you walked into my life",
  password: ""              // 留空 = 不显示密码门
};

// BAKED_DATA 由「导出最终版网站」功能生成的 data.js 提供（可选，不存在也没关系）。
// 优先级：localStorage（本机的编辑）> BAKED_DATA（导出时烤进去的内容）> 硬编码默认值。
// 这样导出的网站给任何人打开，第一眼就是你调好的内容；对方自己再编辑，
// 只会存进对方自己的浏览器，不会动到烤进去的内容，互不冲突。
function bakedGet(path, fallback) {
  try {
    var obj = window.BAKED_DATA;
    if (!obj) return fallback;
    var parts = path.split(".");
    for (var i = 0; i < parts.length; i++) {
      if (obj === null || obj === undefined) return fallback;
      obj = obj[parts[i]];
    }
    return (obj === undefined || obj === null) ? fallback : obj;
  } catch (e) { return fallback; }
}

function loadProfile() {
  try {
    var saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    return Object.assign({}, DEFAULT_PROFILE, bakedGet("profile", {}), saved);
  } catch (e) {
    return Object.assign({}, DEFAULT_PROFILE, bakedGet("profile", {}));
  }
}
function saveProfile(p) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}
function hasSavedProfile() {
  return !!localStorage.getItem(PROFILE_KEY) || !!bakedGet("profile", null);
}

var profile = loadProfile();

// 把 profile 里的值套用到所有 <XX data-profile="fieldName">占位文字</XX>
// 的元素上 —— 这样 HTML 只需要标注"这里要放哪个字段"，不用写死文字。
function applyProfileToDOM() {
  document.querySelectorAll("[data-profile]").forEach(function (el) {
    var key = el.getAttribute("data-profile");
    if (profile[key]) el.textContent = profile[key];
  });
}

function nextAnniversary(togetherDateStr) {
  var start = new Date(togetherDateStr);
  var now = new Date();
  var next = new Date(start.getTime());
  next.setFullYear(now.getFullYear());
  if (next <= now) next.setFullYear(now.getFullYear() + 1);
  return next;
}

// ========================================
// 0.5 LOCAL PHOTO STORAGE — 点按钮直接上传照片，存在浏览器本地
// ========================================
// 用 IndexedDB（不是 localStorage）存照片本体，因为 localStorage 大概只有
// 5MB 上限，几张照片就爆满；IndexedDB 存原始文件（Blob），空间大很多，
// 而且下次打开网站（同一台电脑/同一个浏览器）会自动读回来，不用重新传。
var PHOTO_DB_NAME = "love_photos_db";
var PHOTO_STORE    = "photos";
var _photoDbPromise = null;

function openPhotoDB() {
  if (_photoDbPromise) return _photoDbPromise;
  _photoDbPromise = new Promise(function (resolve, reject) {
    if (!window.indexedDB) { reject(new Error("no indexedDB")); return; }
    var req = indexedDB.open(PHOTO_DB_NAME, 1);
    req.onupgradeneeded = function () { req.result.createObjectStore(PHOTO_STORE); };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror   = function () { reject(req.error); };
  });
  return _photoDbPromise;
}
function savePhotoBlob(key, blob) {
  return openPhotoDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(PHOTO_STORE, "readwrite");
      tx.objectStore(PHOTO_STORE).put(blob, key);
      tx.oncomplete = function () { resolve(); };
      tx.onerror    = function () { reject(tx.error); };
    });
  });
}
function loadPhotoBlob(key) {
  return openPhotoDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx  = db.transaction(PHOTO_STORE, "readonly");
      var req = tx.objectStore(PHOTO_STORE).get(key);
      req.onsuccess = function () { resolve(req.result || null); };
      req.onerror   = function () { reject(req.error); };
    });
  }).catch(function () { return null; });
}
function deletePhotoBlob(key) {
  return openPhotoDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(PHOTO_STORE, "readwrite");
      tx.objectStore(PHOTO_STORE).delete(key);
      tx.oncomplete = function () { resolve(); };
      tx.onerror    = function () { reject(tx.error); };
    });
  }).catch(function () {});
}

// 固定的照片位（首页大图、Day1 小图、故事时间线 5 张）：
// 每个 <img data-photo-key="..."> 旁边配一个 📷 按钮 + 隐藏的文件选择框。
// 点按钮 → 打开文件选择框 → 选完图 → 立刻显示 + 存进 IndexedDB。
// 图片加载失败（比如 images/ 文件夹还没放照片）时，给容器套一个占位样式，
// 比浏览器默认的破图图标好看，而且提示"点这里可以上传"。
function watchPhotoMissing(img, wrap) {
  function check() {
    if (!wrap) return;
    if (img.complete && img.naturalWidth === 0) wrap.classList.add("photo-missing");
    else wrap.classList.remove("photo-missing");
  }
  img.addEventListener("error", check);
  img.addEventListener("load", check);
  check();
}

// scope 参数是给"动态新增的区块"用的（比如新加的故事条目）——
// 只需要给那一小块新 DOM 接上监听器，不用把整个页面重新扫一遍、
// 不然已经接过的元素会被重复绑定两次监听器。不传 scope 就照旧扫全页。
function setupPhotoUploads(scope) {
  (scope || document).querySelectorAll(".photo-upload-slot").forEach(function (slot) {
    var img   = slot.querySelector("img[data-photo-key]");
    var btn   = slot.querySelector(".photo-upload-btn");
    var input = slot.querySelector(".photo-upload-input");
    if (!img || !input) return;
    var key = img.getAttribute("data-photo-key");

    watchPhotoMissing(img, slot);

    loadPhotoBlob(key).then(function (blob) {
      if (blob) { img.src = URL.createObjectURL(blob); return; }
      // 本机没传过这张照片 → 看看是不是「导出最终版网站」时烤进去的路径
      // （动态新增的故事条目没有写死的默认图片路径，要靠这个才看得到）。
      var baked = bakedGet("photos." + key, null);
      if (baked) img.src = baked;
    });

    // 首页那两张照片没有小图标按钮，点整张照片就能换；
    // 其他地方（故事时间线等）照片点下去是开灯箱大图看，所以还是留着小按钮换照片。
    if (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        input.click();
      });
    } else if (slot.classList.contains("click-to-upload")) {
      slot.addEventListener("click", function () { input.click(); });
    }
    input.addEventListener("click", function (e) { e.stopPropagation(); });
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;
      img.src = URL.createObjectURL(file);
      savePhotoBlob(key, file);
    });
  });
}

// 日期输入框（故事时间线的 📅、Setup 表单等）：选完自动存 localStorage，
// 下次打开自动填回去。
function setupDateInputs(scope) {
  (scope || document).querySelectorAll(".timeline-date-input").forEach(function (el) {
    var dateKey = el.getAttribute("data-date-key");
    var key = "date_" + dateKey;
    var saved = localStorage.getItem(key) || bakedGet("dates." + dateKey, "");
    if (saved) el.value = saved;
    el.addEventListener("change", function () {
      localStorage.setItem(key, el.value);
    });
  });
}

// 故事时间线、甜蜜分析页里可以直接点进去编辑的文字（contenteditable）：
// 改完失焦(blur)会存进 localStorage，下次打开 / 导出最终版都能保留。
function setupEditableTexts(scope) {
  (scope || document).querySelectorAll(".editable-text[data-edit-key]").forEach(function (el) {
    var editKey = el.getAttribute("data-edit-key");
    var key = "edit_" + editKey;
    var saved = localStorage.getItem(key);
    if (saved === null) saved = bakedGet("edits." + editKey, null);
    if (saved !== null) el.textContent = saved;
    el.addEventListener("blur", function () {
      localStorage.setItem(key, el.textContent);
    });
  });
}

// ========================================
// 1. CONSTANTS  (全部从 profile 计算出来)
// ========================================

var FIRST_MET_DATE  = new Date(profile.metDate);
var TOGETHER_DATE   = new Date(profile.togetherDate);
var NEXT_ANNIV_DATE = nextAnniversary(profile.togetherDate);
var ENGLISH_TEXT    = "To: ";
var CHINESE_TEXT    = profile.partnerB;

// ========================================
// FIREBASE (可选) — 用来跨设备同步 Quiz 题目 / 未来信 / 留言
// 不想用云端同步就不用填，网站会自动改用只存在本机浏览器的 localStorage。
// 免费申请自己的 Firebase 项目：https://console.firebase.google.com
// ========================================
var FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
var db = null;
if (FIREBASE_CONFIG.apiKey && typeof firebase !== "undefined") {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
  } catch (e) { db = null; }
}

var dailyMessages = {
  sweet: [
    "You are my favorite universe ❤️",
    "每一天都因为你变得闪闪发光",
    "我爱你，胜过爱我自己",
    "你是我最好的决定",
    "和你在一起是我最大的幸福",
    "想和你一起变老"
  ],
  playful: [
    "今天也很想你呼 🐷",
    "我们的爱就像奶茶一样甜",
    "I love you more than pizza. And trust me, that's a lot.",
    "你是我这辈子唯一想一直'烦'着的人",
    "哇嘎嘎嘎嘎，你是坏坏蛋",
    "今天也要开开心心哦"
  ],
  grateful: [
    "感谢你这一路的陪伴",
    "谢谢你选择了我",
    "因为有你，生活充满了爱",
    "你是我生命中最好的礼物",
    "谢谢你一直是我的依靠",
    "和你在一起好幸福，谢谢你"
  ]
};

// ========================================
// 2. DOM REFS
// ========================================

var englishSpan  = document.querySelector(".english");
var chineseSpan  = document.querySelector(".chinese");
var bgMusic      = document.getElementById("bg-music");
var playMusicBtn = document.getElementById("play-music-btn");
var openingPage  = document.getElementById("opening");
var fxContainer  = document.getElementById("fx-container");

// ========================================
// 3. STAR GENERATION
// ========================================

function generateStars(containerId, count, opts) {
  opts = opts || {};
  var colors    = opts.colors    || ["rgba(255,241,252,0.9)"];
  var glowColor = opts.glowColor || "rgba(255,230,255,1)";
  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  for (var i = 0; i < count; i++) {
    var star      = document.createElement("span");
    var size      = (Math.random() * 2.4 + 0.5).toFixed(2);
    var breathDur = (Math.random() * 3.5 + 1.8).toFixed(2);
    var delay     = (Math.random() * 7).toFixed(2);
    var minOp     = (Math.random() * 0.08 + 0.02).toFixed(2);
    var maxOp     = (Math.random() * 0.55 + 0.45).toFixed(2);
    var color     = colors[Math.floor(Math.random() * colors.length)];
    var isGlow    = Math.random() < 0.14;
    star.setAttribute("style",
      "left:" + (Math.random()*100).toFixed(1) + "%;" +
      "top:"  + (Math.random()*100).toFixed(1) + "%;" +
      "width:" + size + "px;height:" + size + "px;" +
      "background:" + (isGlow ? glowColor : color) + ";" +
      "--min-op:" + minOp + ";--max-op:" + maxOp + ";" +
      "animation:starBreathe " + breathDur + "s ease-in-out " + delay + "s infinite;"
    );
    if (isGlow) star.classList.add("star-glow");
    container.appendChild(star);
  }
}

// ========================================
// 4. PAGE NAVIGATION + TRANSITIONS
// ========================================

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(function(p) {
    p.classList.remove("active", "page-enter");
  });

  document.querySelectorAll("#global-nav .nav-btn").forEach(function(btn) {
    btn.classList.remove("active");
    if (btn.id === "nav-" + pageId) btn.classList.add("active");
  });

  var target = document.getElementById(pageId);
  if (!target) return;
  target.classList.add("active");

  requestAnimationFrame(function() {
    target.classList.add("page-enter");
    setTimeout(function() { target.classList.remove("page-enter"); }, 600);
  });

  if (pageId !== "opening" && bgMusic && bgMusic.paused) fadeInMusic();
  if (pageId === "ending") {
    generateStars("ending-stars", 120, {colors:["rgba(255,220,250,0.9)","rgba(220,200,255,0.85)","rgba(255,240,200,0.8)"],glowColor:"rgba(255,215,255,1)"});
    displayMoonPhase();
  }
  if (pageId === "energy") initEnergyChart();
  if (pageId === "quiz") {
    generateStars("quiz-stars", 100, {colors:["rgba(200,185,255,0.9)","rgba(255,200,240,0.85)"],glowColor:"rgba(220,200,255,1)"});
    quizSwitchMode('play');
  }
  if (pageId === "future-letter") {
    generateStars("future-letter-stars", 100, {colors:["rgba(255,215,235,0.9)","rgba(210,190,255,0.85)","rgba(255,235,200,0.8)"],glowColor:"rgba(255,210,250,1)"});
    flCountdownTick();
    if (flIsUnlocked()) flEnableReadButtons();
  }
}

// ========================================
// 5. TYPING EFFECT
// ========================================

var englishIndex = 0;
var chineseIndex = 0;

function typeEnglish() {
  if (englishIndex < ENGLISH_TEXT.length) {
    if (englishSpan) englishSpan.textContent += ENGLISH_TEXT[englishIndex++];
    setTimeout(typeEnglish, 120);
  } else { setTimeout(typeChinese, 300); }
}
function typeChinese() {
  if (chineseIndex < CHINESE_TEXT.length) {
    if (chineseSpan) chineseSpan.textContent += CHINESE_TEXT[chineseIndex++];
    setTimeout(typeChinese, 150);
  }
}

document.addEventListener("click", function(e) {
  if (openingPage && openingPage.classList.contains("active") && !e.target.closest("#global-nav")) {
    showPage("home");
  }
});

// ========================================
// 6. TIMERS
// ========================================

function setEl(id, val, pad) {
  var el = document.getElementById(id);
  if (el) el.textContent = String(val).padStart(pad, "0");
}

function updateSingleTimer(prefix, ms) {
  var s = Math.floor(ms / 1000);
  setEl(prefix + "-days",    Math.floor(s / 86400), 3);
  setEl(prefix + "-hours",   Math.floor((s % 86400) / 3600), 2);
  setEl(prefix + "-minutes", Math.floor((s % 3600) / 60), 2);
  setEl(prefix + "-seconds", s % 60, 2);
}
function updateTimers() {
  var now = new Date();
  updateSingleTimer("met",  now - FIRST_MET_DATE);
  updateSingleTimer("love", now - TOGETHER_DATE);
}

// ========================================
// 7. NEXT ANNIVERSARY COUNTDOWN
// ========================================

function updateNextAnniversary() {
  var diff = NEXT_ANNIV_DATE - new Date();
  if (diff <= 0) { setEl("next-anniv-days",0,3); setEl("next-anniv-hours",0,2); setEl("next-anniv-mins",0,2); return; }
  setEl("next-anniv-days",  Math.floor(diff / 86400000), 3);
  setEl("next-anniv-hours", Math.floor((diff % 86400000) / 3600000), 2);
  setEl("next-anniv-mins",  Math.floor((diff % 3600000) / 60000), 2);
}

// ========================================
// 8. RANDOM MESSAGES
// ========================================

function displayRandomMessage() {
  var all = dailyMessages.sweet.concat(dailyMessages.playful, dailyMessages.grateful);
  var el  = document.getElementById("random-message");
  if (el) el.textContent = all[Math.floor(Math.random() * all.length)];
}

// ========================================
// 9. MUSIC PLAYER + 🎵 MUSIC NOTES
// ========================================

var isPlaying    = false;
var noteInterval = null;

if (playMusicBtn && bgMusic) {
  playMusicBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    if (isPlaying) {
      bgMusic.pause();
      playMusicBtn.classList.remove("spinning");
      clearInterval(noteInterval); noteInterval = null;
      isPlaying = false;
    } else {
      bgMusic.play().catch(function(){});
      playMusicBtn.classList.add("spinning");
      noteInterval = setInterval(floatMusicNotes, 900);
      isPlaying = true;
    }
  });
}
if (bgMusic) bgMusic.volume = 0.5;

function fadeInMusic() {
  if (!bgMusic) return; bgMusic.volume = 0; bgMusic.play().catch(function(){});
  var v=0; var t=setInterval(function(){ v=Math.min(v+0.05,0.5); bgMusic.volume=v; if(v>=0.5)clearInterval(t); },100);
}
function fadeOutMusic() {
  if (!bgMusic) return; var v=bgMusic.volume;
  var t=setInterval(function(){ v=Math.max(v-0.05,0); bgMusic.volume=v; if(v<=0){bgMusic.pause();bgMusic.volume=0.5;clearInterval(t);} },150);
}
document.addEventListener("click", function() {
  if (bgMusic && bgMusic.paused && openingPage && !openingPage.classList.contains("active")) bgMusic.play().catch(function(){});
}, { once: true });

function floatMusicNotes() {
  if (!fxContainer) return;
  var btn = document.getElementById("play-music-btn");
  if (!btn) return;
  var rect = btn.getBoundingClientRect();
  var cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
  var noteChars = ["♪","♫","♪","♬","♭","🎵"];
  var note = document.createElement("div");
  note.className = "music-note";
  note.textContent = noteChars[Math.floor(Math.random()*noteChars.length)];
  var size=(Math.random()*10+14).toFixed(0), dur=(Math.random()*1.4+2).toFixed(2);
  var drift=((Math.random()-0.5)*80).toFixed(0);
  note.setAttribute("style",
    "left:"  + (cx+(Math.random()-0.5)*30).toFixed(0) + "px;" +
    "top:"   + (cy+(Math.random()-0.5)*20).toFixed(0) + "px;" +
    "font-size:" + size + "px;" +
    "animation-duration:" + dur + "s;" +
    "--drift:" + drift + "px;"
  );
  fxContainer.appendChild(note);
  setTimeout(function(){ note.remove(); }, +dur*1000+200);
}

// 背景音乐也能自己上传（只接受 mp3），跟照片用同一套 IndexedDB key-value 存储，
// 存好之后会盖掉默认的 music/background.mp3。
var MUSIC_BLOB_KEY = "bg-music";

function setupMusicUpload() {
  var btn   = document.querySelector(".music-upload-btn");
  var input = document.getElementById("music-upload-input");
  if (!btn || !input || !bgMusic) return;

  // 本机之前传过音乐 → 用传过的那首，不用默认的
  loadPhotoBlob(MUSIC_BLOB_KEY).then(function (blob) {
    if (blob) { bgMusic.src = URL.createObjectURL(blob); bgMusic.load(); }
  });

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    input.click();
  });
  input.addEventListener("click", function (e) { e.stopPropagation(); });
  input.addEventListener("change", function () {
    var file = input.files && input.files[0];
    if (!file) return;
    var isMp3 = file.type === "audio/mpeg" || /\.mp3$/i.test(file.name);
    if (!isMp3) {
      showToast("🎵 只支持 mp3 格式哦，换一个文件试试～");
      input.value = "";
      return;
    }
    bgMusic.src = URL.createObjectURL(file);
    bgMusic.load();
    savePhotoBlob(MUSIC_BLOB_KEY, file);
    showToast("✅ 背景音乐换好了！");
    if (isPlaying) bgMusic.play().catch(function(){});
  });
}

// ========================================
// 9.5 STORY — 让用户自己点按钮加新的故事条目
// ========================================
// 默认的 5 条故事是写死在 index.html 里的；用户自己点「➕ 添加新的故事」
// 加的条目是这里用 JS 动态造出来的，id 存一份清单在 localStorage，
// 下次打开网站 / 导出最终版网站的时候，照着清单把它们重新造出来。
var STORY_EXTRA_KEY = "story_extra_ids";

function storyGetExtraIds() {
  try {
    var raw = localStorage.getItem(STORY_EXTRA_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return bakedGet("storyExtraIds", []);
}
function storySaveExtraIds(ids) {
  localStorage.setItem(STORY_EXTRA_KEY, JSON.stringify(ids));
}

function storyBuildItemHTML(id) {
  return '' +
    '<div class="timeline-item" data-story-id="' + id + '">' +
      '<div class="timeline-dot"></div>' +
      '<div class="timeline-content">' +
        '<button class="story-delete-btn" type="button" title="删除这段故事" onclick="storyDeleteItem(\'' + id + '\')">✕</button>' +
        '<input type="date" class="timeline-date timeline-date-input" data-date-key="' + id + '" title="选择日期">' +
        '<div class="tl-photo-wrap photo-upload-slot">' +
          '<figure class="tl-photo polaroid"><img alt="故事照片" data-photo-key="story-photo-' + id + '" onclick="if(this.src)openLightbox(this.src,\'\',\'\')"></figure>' +
          '<button class="photo-upload-btn" type="button" title="更换照片">📷</button>' +
          '<input type="file" accept="image/*" class="photo-upload-input" hidden>' +
        '</div>' +
        '<div class="timeline-desc"><span class="tl-heading editable-text" contenteditable="true" data-edit-key="' + id + '-heading">💬 新的故事</span><br><span class="editable-text" contenteditable="true" data-edit-key="' + id + '-desc">点这里写下这段故事</span></div>' +
      '</div>' +
    '</div>';
}

// 真正把一个故事条目的 DOM 加进时间线，并只给这一小块接上监听器
// （不是整页重新扫一遍，不然已有的条目会被重复绑定监听器）。
function storyRenderItem(id) {
  var container = document.getElementById("story-extra-items");
  if (!container) return;
  container.insertAdjacentHTML("beforeend", storyBuildItemHTML(id));
  var el = container.querySelector('.timeline-item[data-story-id="' + id + '"]');
  if (el) {
    setupPhotoUploads(el);
    setupDateInputs(el);
    setupEditableTexts(el);
  }
}

function storyAddItem() {
  var ids = storyGetExtraIds();
  var id = "story-x" + Date.now();
  ids.push(id);
  storySaveExtraIds(ids);
  storyRenderItem(id);
  showToast("✅ 新的故事条目加好了，点进去写内容吧～");
}

function storyDeleteItem(id) {
  var ids = storyGetExtraIds().filter(function (x) { return x !== id; });
  storySaveExtraIds(ids);
  // 清掉这条故事相关的本地数据，避免留下孤儿数据
  localStorage.removeItem("date_" + id);
  localStorage.removeItem("edit_" + id + "-heading");
  localStorage.removeItem("edit_" + id + "-desc");
  deletePhotoBlob("story-photo-" + id);
  var el = document.querySelector('.timeline-item[data-story-id="' + id + '"]');
  if (el) el.remove();
  showToast("🗑️ 已删除这段故事");
}

// 页面打开时，把之前加过的（或导出时烤进去的）故事条目重新造出来。
function storyLoadExtraItems() {
  storyGetExtraIds().forEach(function (id) { storyRenderItem(id); });
}

// ========================================
// 10. GALLERY — DATA + LIGHTBOX
// ========================================
// 示例数据，换成自己的照片：url 是图片路径，date 是拍摄日期，caption 是描述。
// 想加更多月份，照着格式加一个新的 "YYYY-MM": [ ... ] 就行，
// 记得同步在 index.html 的 .gallery-tabs 里加一个对应的 tab 按钮。
var galleryData = {
  "2024-01": [
    {url:"images/example1.jpg", date:"2024年1月1日", caption:"在这里写下这张照片的故事 💬"},
    {url:"images/example2.jpg", date:"2024年1月5日", caption:"换成你们自己的照片和回忆吧"},
    {url:"images/example3.jpg", date:"2024年1月12日", caption:"点这里可以放大看 ✨"}
  ],
  "2024-02": [
    {url:"images/example4.jpg", date:"2024年2月14日", caption:"我们在一起的那一天 💕"},
    {url:"images/example5.jpg", date:"2024年2月20日", caption:"第一次一起旅行"}
  ]
};
var currentGalleryCategory = "2024-01";

// 用户点"＋ 添加照片"上传的照片存两处：图片本体(Blob)存 IndexedDB，
// 日期/说明文字这些小数据存 localStorage —— 下次打开网站会自动读回来。
// 上面 galleryData 里的示例照片，也可以点 ✕ 直接从本地视图移除（不会动到代码）。
function galleryHiddenKey(cat) { return "gallery_hidden_" + cat; }
function galleryCustomKey(cat) { return "gallery_custom_" + cat; }
function galleryGetHidden(cat) {
  try {
    var raw = localStorage.getItem(galleryHiddenKey(cat));
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return bakedGet("galleryHidden." + cat, []);
}
function galleryGetCustom(cat) {
  try { return JSON.parse(localStorage.getItem(galleryCustomKey(cat)) || "[]"); } catch (e) { return []; }
}
function gallerySaveCustom(cat, items) {
  localStorage.setItem(galleryCustomKey(cat), JSON.stringify(items));
}

function galleryMergedItems(category) {
  var hidden = galleryGetHidden(category);
  var defaults = (galleryData[category] || []).map(function (p, i) {
    return { id: "default-" + i, url: p.url, date: p.date, caption: p.caption, isCustom: false };
  });
  // 之前「导出最终版网站」时烤进去的照片（真实文件，不需要 IndexedDB）：
  var baked = bakedGet("gallery." + category, []).map(function (p, i) {
    return { id: "default-baked-" + i, url: p.url, date: p.date, caption: p.caption, isCustom: false };
  });
  var merged = defaults.concat(baked).filter(function (d) { return hidden.indexOf(d.id) === -1; });

  var custom = galleryGetCustom(category);
  var customResolved = custom.map(function (item) {
    return loadPhotoBlob(item.photoKey).then(function (blob) {
      return { id: item.id, url: blob ? URL.createObjectURL(blob) : "", date: item.date, caption: item.caption, isCustom: true };
    });
  });
  return Promise.all(customResolved).then(function (resolved) {
    return merged.concat(resolved.filter(function (c) { return c.url; }));
  });
}

function galleryDeletePhoto(category, id) {
  if (id.indexOf("default-") === 0) {
    var hidden = galleryGetHidden(category);
    hidden.push(id);
    localStorage.setItem(galleryHiddenKey(category), JSON.stringify(hidden));
  } else {
    var custom = galleryGetCustom(category);
    var item = custom.filter(function (c) { return c.id === id; })[0];
    gallerySaveCustom(category, custom.filter(function (c) { return c.id !== id; }));
    if (item) deletePhotoBlob(item.photoKey);
  }
  renderGallery(category);
}

function galleryToggleAddForm() {
  var form = document.getElementById("gallery-add-form");
  if (form) form.classList.toggle("hidden");
}

function galleryAddPhoto() {
  var fileInput = document.getElementById("gallery-add-file");
  var dateInput = document.getElementById("gallery-add-date");
  var capInput  = document.getElementById("gallery-add-caption");
  var file = fileInput && fileInput.files && fileInput.files[0];
  if (!file) { showToast("📷 先选一张照片吧~"); return; }

  var dateStr = (dateInput && dateInput.value)
    ? new Date(dateInput.value + "T00:00:00").toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
    : "";
  var caption = (capInput && capInput.value.trim()) || "";
  var photoKey = "gallery-" + currentGalleryCategory + "-" + Date.now();

  savePhotoBlob(photoKey, file).then(function () {
    var custom = galleryGetCustom(currentGalleryCategory);
    custom.push({ id: "custom-" + Date.now(), photoKey: photoKey, date: dateStr, caption: caption });
    gallerySaveCustom(currentGalleryCategory, custom);

    fileInput.value = ""; if (dateInput) dateInput.value = ""; if (capInput) capInput.value = "";
    var form = document.getElementById("gallery-add-form");
    if (form) form.classList.add("hidden");
    renderGallery(currentGalleryCategory);
    showToast("✅ 照片已添加！");
  });
}

function renderGallery(category) {
  if (!category) category = "2024-01";
  currentGalleryCategory = category;
  var grid = document.getElementById("gallery-grid");
  if (!grid) return;
  galleryMergedItems(category).then(function (photos) {
    if (!photos.length) {
      grid.innerHTML = '<div class="gallery-placeholder"><p>还没有照片，点上面"＋ 添加照片"加一张吧 💕</p></div>';
      return;
    }
    grid.innerHTML = photos.map(function(p) {
      // 相册的日期/说明文字是用户自己打的（gallery-add-caption 输入框），
      // 插进 innerHTML 前一定要转义，不然打个 < 或 " 就能把页面结构搞坏，
      // 甚至塞进去的 <script> 之类标签会被当成真的 HTML 执行。
      var safeDate    = escHtml(p.date    || "");
      var safeCaption = escHtml(p.caption || "");
      return '<div class="gallery-item">' +
             '<button class="gallery-item-delete" type="button" onclick="event.stopPropagation();galleryDeletePhoto(\'' + category + '\',\'' + p.id + '\')" title="删除">✕</button>' +
             '<div class="photo-img-wrap" onclick="openLightbox(\'' + p.url + '\',\'' + safeDate + '\',\'' + safeCaption + '\')"><img src="' + p.url + '" alt="memory" loading="lazy" onerror="this.parentElement.classList.add(\'photo-missing\')">' +
             '<div class="photo-overlay"><p>' + escHtml(p.caption || "") + '</p></div>' +
             '</div>' +
             '<div class="photo-meta"><span class="photo-date">' + escHtml(p.date || "") + '</span></div>' +
             '</div>';
    }).join("");
  });
}

function openLightbox(src, date, caption) {
  var lb=document.getElementById("lightbox"), img=document.getElementById("lightbox-img"),
      cap=document.getElementById("lightbox-caption"), dt=document.getElementById("lightbox-date");
  if (!lb||!img) return;
  img.src=src;
  if(dt)  dt.textContent  = date    || "";
  if(cap) cap.textContent = caption || "";
  lb.classList.remove("hidden"); document.body.style.overflow="hidden";
  setTimeout(function(){ lb.classList.add("visible"); },10);
}
function closeLightbox() {
  var lb=document.getElementById("lightbox"); if(!lb) return;
  lb.classList.remove("visible"); document.body.style.overflow="";
  setTimeout(function(){ lb.classList.add("hidden"); },300);
}
document.addEventListener("keydown", function(e){ if(e.key==="Escape") closeLightbox(); });

function galleryWireTab(btn) {
  btn.addEventListener("click", function(e) {
    if (e.target.closest(".tab-btn-delete")) return; // 点的是删除按钮，不要切换 tab
    document.querySelectorAll(".tab-btn").forEach(function(b){ b.classList.remove("active"); });
    btn.classList.add("active"); renderGallery(btn.dataset.category);
  });
}
function setupGalleryTabs() {
  document.querySelectorAll(".tab-btn").forEach(galleryWireTab);
}

// ── 用户自己加的月份分类（默认只有 2024-01 / 2024-02 两个示例）──
var GALLERY_CATEGORIES_KEY = "gallery_extra_categories";

function galleryGetExtraCategories() {
  try {
    var raw = localStorage.getItem(GALLERY_CATEGORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return bakedGet("galleryCategories", []);
}
function gallerySaveExtraCategories(cats) {
  localStorage.setItem(GALLERY_CATEGORIES_KEY, JSON.stringify(cats));
}

function galleryToggleCategoryForm() {
  var form = document.getElementById("gallery-add-category-form");
  if (form) form.classList.toggle("hidden");
}

function galleryBuildTabHTML(key, label) {
  return '<button class="tab-btn" data-category="' + key + '">' + escHtml(label) +
    ' <span class="tab-btn-delete" title="删除这个分类" onclick="event.stopPropagation();galleryDeleteCategory(\'' + key + '\')">✕</span></button>';
}

function galleryAddCategory() {
  var input = document.getElementById("gallery-new-category-label");
  var label = input ? input.value.trim() : "";
  if (!label) { showToast("✏️ 先给这个月份起个名字吧~"); return; }

  var key = "custom-" + Date.now();
  var cats = galleryGetExtraCategories();
  cats.push({ key: key, label: label });
  gallerySaveExtraCategories(cats);

  var tabs = document.getElementById("gallery-tabs");
  if (tabs) {
    tabs.insertAdjacentHTML("beforeend", galleryBuildTabHTML(key, label));
    var btn = tabs.querySelector('.tab-btn[data-category="' + key + '"]');
    if (btn) {
      galleryWireTab(btn);
      document.querySelectorAll(".tab-btn").forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
    }
  }
  renderGallery(key);

  input.value = "";
  galleryToggleCategoryForm();
  showToast("✅ 新月份加好了，现在可以往里面加照片了～");
}

function galleryDeleteCategory(key) {
  var cats = galleryGetExtraCategories().filter(function (c) { return c.key !== key; });
  gallerySaveExtraCategories(cats);

  // 清掉这个分类底下所有自己传的照片（IndexedDB 里的本体 + localStorage 的索引）
  galleryGetCustom(key).forEach(function (item) { deletePhotoBlob(item.photoKey); });
  localStorage.removeItem(galleryCustomKey(key));
  localStorage.removeItem(galleryHiddenKey(key));

  var tabs = document.getElementById("gallery-tabs");
  var btn = tabs && tabs.querySelector('.tab-btn[data-category="' + key + '"]');
  var wasActive = btn && btn.classList.contains("active");
  if (btn) btn.remove();

  if (wasActive) {
    var firstTab = tabs && tabs.querySelector(".tab-btn");
    if (firstTab) { firstTab.classList.add("active"); renderGallery(firstTab.dataset.category); }
  }
  showToast("🗑️ 已删除这个月份分类");
}

// 页面打开时，把之前加过的（或导出时烤进去的）月份分类重新造出来。
function galleryLoadExtraCategories() {
  var tabs = document.getElementById("gallery-tabs");
  if (!tabs) return;
  galleryGetExtraCategories().forEach(function (cat) {
    if (tabs.querySelector('.tab-btn[data-category="' + cat.key + '"]')) return; // 已经有了就跳过
    tabs.insertAdjacentHTML("beforeend", galleryBuildTabHTML(cat.key, cat.label));
    var btn = tabs.querySelector('.tab-btn[data-category="' + cat.key + '"]');
    if (btn) galleryWireTab(btn);
  });
}
function showRandomPhoto() {
  galleryMergedItems(currentGalleryCategory).then(function (photos) {
    if (!photos.length) return;
    var p = photos[Math.floor(Math.random() * photos.length)];
    openLightbox(p.url, p.date, p.caption);
  });
}

// ========================================
// 11. ANALYSIS — QUIZ REVEAL + 飘字
// ========================================

function revealAnswer(btn) {
  document.querySelectorAll(".quiz-btn").forEach(function(b){ b.classList.add("answered"); });
  var result=document.getElementById("word-cloud-result");
  if (result) { result.classList.remove("hidden"); setTimeout(function(){ result.classList.add("show"); },10); }
  floatWords(["我爱你 ❤️","宝宝~","想你","我爱你 💕","宝宝","想你 🥺","我爱你","宝宝 🐣"]);
}

function floatWords(words) {
  if (!fxContainer) return;
  var colors=["#ffb7da","#ffd4a0","#c8b0f8","#ff9ec8","#a8d8ff","#b8f0c8"];
  words.forEach(function(word,i) {
    setTimeout(function() {
      var el=document.createElement("div"); el.className="floating-word"; el.textContent=word;
      var left=(Math.random()*78+8).toFixed(1), size=(Math.random()*14+16).toFixed(0);
      var dur=(Math.random()*2+3.5).toFixed(2), drift=((Math.random()-0.5)*160).toFixed(0);
      var color=colors[Math.floor(Math.random()*colors.length)];
      el.setAttribute("style","left:"+left+"%;bottom:"+(80+Math.random()*60).toFixed(0)+"px;font-size:"+size+"px;color:"+color+";animation-duration:"+dur+"s;--drift:"+drift+"px;");
      fxContainer.appendChild(el); setTimeout(function(){ el.remove(); }, +dur*1000+300);
    }, i*280);
  });
}

// ========================================
// 12. ENERGY CHART
// ========================================
// REAL_DATA / FUTURE_DATA 是示例的"甜蜜指数"曲线，换成你们自己觉得好玩的数字就行。

var REAL_DATA     = [70,85,75,60,55,80,72,90,65,70,75,80];
var FUTURE_DATA   = [95,88,93,86,91,97];
var MONTHS        = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
var FUTURE_MONTHS = ["下年1月","2月","3月","4月","5月","6月"];
var ANNOTATIONS   = {1:"情人节💝",5:"暑假☀️",7:"生日🎂",11:"周年🎉"};
var userGuesses       = new Array(12).fill(null);
var energyInitialized = false;

function initEnergyChart() {
  if (energyInitialized) return;
  energyInitialized = true;
  buildMonthButtons();
  var cv=document.getElementById("guessCanvas");
  if (cv) drawChartInstant(cv,[],MONTHS,"guess");
}

function buildMonthButtons() {
  var c=document.getElementById("month-buttons"); if(!c) return;
  c.innerHTML=MONTHS.map(function(m,i){
    return '<div class="month-group" id="month-group-'+i+'">'+
      '<span class="month-label">'+m+'</span>'+
      '<div class="arrow-row">'+
      '<button class="arrow-btn up-btn" onclick="setGuess('+i+',1)">📈</button>'+
      '<button class="arrow-btn dn-btn" onclick="setGuess('+i+',-1)">📉</button>'+
      '</div></div>';
  }).join("");
}

function setGuess(idx,dir) {
  userGuesses[idx]=dir;
  var grp=document.getElementById("month-group-"+idx);
  if (grp) { grp.querySelector(".up-btn").classList.toggle("sel",dir===1); grp.querySelector(".dn-btn").classList.toggle("sel",dir===-1); grp.classList.add("done"); }
  redrawGuessCanvas();
  var allDone=userGuesses.every(function(g){return g!==null;});
  var rb=document.getElementById("reveal-btn");
  if (rb) { rb.disabled=!allDone; if(allDone) rb.classList.add("ready"); }
}

function guessToValues() {
  var v=60, pts=[];
  for (var i=0;i<12;i++) { if(userGuesses[i]===null) break; v=Math.max(8,Math.min(96,v+userGuesses[i]*13)); pts.push({idx:i,val:v}); }
  return pts;
}

function redrawGuessCanvas() {
  var cv=document.getElementById("guessCanvas"); if(!cv) return;
  drawChartInstant(cv,guessToValues(),MONTHS,"guess");
}

function drawChartInstant(canvas,points,labels,type) {
  var ctx=canvas.getContext("2d"), W=canvas.width, H=canvas.height;
  var PL=48,PR=18,PT=22,PB=42,CW=W-PL-PR,CH=H-PT-PB;
  ctx.clearRect(0,0,W,H);
  var bg=ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,"rgba(40,20,70,0.88)"); bg.addColorStop(1,"rgba(16,8,36,0.94)");
  rrect(ctx,0,0,W,H,12); ctx.fillStyle=bg; ctx.fill();
  for (var r=0;r<=4;r++) {
    var y=PT+(CH/4)*r;
    ctx.strokeStyle=r===2?"rgba(255,182,220,0.12)":"rgba(255,255,255,0.05)";
    ctx.lineWidth=1; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(PL,y); ctx.lineTo(W-PR,y); ctx.stroke();
  }
  ctx.strokeStyle="rgba(255,182,220,0.3)"; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(PL,PT); ctx.lineTo(PL,H-PB); ctx.lineTo(W-PR,H-PB); ctx.stroke();
  ctx.fillStyle="rgba(200,175,240,0.7)"; ctx.font="10px sans-serif"; ctx.textAlign="center";
  var xStep=labels.length>1?CW/(labels.length-1):CW;
  labels.forEach(function(l,i){ ctx.fillText(l,PL+i*xStep,H-PB+16); });
  if (!points||points.length<2) return;
  ctx.strokeStyle="#b89cdb"; ctx.lineWidth=2.5;
  ctx.lineJoin="round"; ctx.lineCap="round"; ctx.setLineDash([]);
  ctx.shadowColor="#b89cdb55"; ctx.shadowBlur=6;
  ctx.beginPath();
  points.forEach(function(p,n){ var x=PL+p.idx*xStep,y2=PT+CH-(p.val/100)*CH; if(n===0)ctx.moveTo(x,y2);else ctx.lineTo(x,y2); });
  ctx.stroke(); ctx.shadowBlur=0;
  points.forEach(function(p){ var x=PL+p.idx*xStep,y2=PT+CH-(p.val/100)*CH; ctx.fillStyle="#d8c0f0"; ctx.beginPath(); ctx.arc(x,y2,4,0,Math.PI*2); ctx.fill(); });
}

function animateChart(canvasId,data,type,onDone) {
  var canvas=document.getElementById(canvasId); if(!canvas){if(onDone)onDone();return;}
  var ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height;
  var PL=48,PR=18,PT=22,PB=42,CW=W-PL-PR,CH=H-PT-PB;
  var labels=type==="future"?FUTURE_MONTHS:MONTHS;
  var xStep=data.length>1?CW/(data.length-1):CW;
  var isFuture=type==="future";
  var lineC0=type==="real"?"#d4843a":type==="future"?"rgba(255,182,220,0.9)":"#b89cdb";
  var lineC1=type==="real"?"#ffb060":type==="future"?"rgba(255,120,200,0.8)":"#d8c0f0";
  var dotColor=type==="real"?"#ffd4a0":"#ffb7da";
  var areaC=type==="real"?"rgba(212,132,58,0.22)":type==="future"?"rgba(255,182,220,0.18)":"rgba(184,156,219,0.18)";
  var bgC0=type==="real"?"rgba(50,25,10,0.88)":type==="future"?"rgba(15,20,50,0.88)":"rgba(30,15,50,0.88)";
  var bgC1=type==="real"?"rgba(20,10,5,0.94)":type==="future"?"rgba(10,10,30,0.94)":"rgba(15,8,30,0.94)";
  var drawn=1;
  function frame() {
    ctx.clearRect(0,0,W,H);
    var bg2=ctx.createLinearGradient(0,0,0,H); bg2.addColorStop(0,bgC0); bg2.addColorStop(1,bgC1);
    rrect(ctx,0,0,W,H,12); ctx.fillStyle=bg2; ctx.fill();
    for (var r=0;r<=4;r++) {
      var y=PT+(CH/4)*r;
      ctx.strokeStyle=r===2?"rgba(255,182,220,0.1)":"rgba(255,255,255,0.05)";
      ctx.lineWidth=1; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(PL,y); ctx.lineTo(W-PR,y); ctx.stroke();
    }
    ctx.strokeStyle="rgba(255,182,220,0.3)"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(PL,PT); ctx.lineTo(PL,H-PB); ctx.lineTo(W-PR,H-PB); ctx.stroke();
    ctx.fillStyle="rgba(200,175,240,0.7)"; ctx.font="10px sans-serif"; ctx.textAlign="center";
    labels.forEach(function(l,i){ ctx.fillText(l,PL+i*xStep,H-PB+16); });
    var ag=ctx.createLinearGradient(0,PT,0,H-PB); ag.addColorStop(0,areaC); ag.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=ag; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(PL,H-PB);
    for (var i=0;i<=drawn&&i<data.length;i++){ var x=PL+i*xStep,y2=PT+CH-(data[i]/100)*CH; ctx.lineTo(x,y2); }
    ctx.lineTo(PL+Math.min(drawn,data.length-1)*xStep,H-PB); ctx.closePath(); ctx.fill();
    if(isFuture)ctx.setLineDash([10,6]);else ctx.setLineDash([]);
    var lg=ctx.createLinearGradient(PL,0,W-PR,0); lg.addColorStop(0,lineC0); lg.addColorStop(1,lineC1);
    ctx.strokeStyle=lg; ctx.lineWidth=2.8; ctx.lineJoin="round"; ctx.lineCap="round";
    ctx.shadowColor=lineC0+"66"; ctx.shadowBlur=8;
    ctx.beginPath();
    for (var j=0;j<=drawn&&j<data.length;j++){ var xj=PL+j*xStep,yj=PT+CH-(data[j]/100)*CH; if(j===0)ctx.moveTo(xj,yj);else ctx.lineTo(xj,yj); }
    ctx.stroke(); ctx.shadowBlur=0; ctx.setLineDash([]);
    for (var k=0;k<=drawn&&k<data.length;k++) {
      var xk=PL+k*xStep,yk=PT+CH-(data[k]/100)*CH;
      ctx.fillStyle=dotColor; ctx.shadowColor=dotColor+"88"; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.arc(xk,yk,4.5,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
      if (type==="real"&&ANNOTATIONS[k]) { ctx.fillStyle=dotColor; ctx.font="bold 10px sans-serif"; ctx.textAlign="center"; ctx.fillText(ANNOTATIONS[k],xk,yk-13); }
    }
    if (drawn<data.length-1) { drawn++; setTimeout(function(){requestAnimationFrame(frame);},195); }
    else if (onDone) { setTimeout(onDone,300); }
  }
  requestAnimationFrame(frame);
}

function rrect(ctx,x,y,w,h,r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

function revealRealChart() {
  var pg=document.getElementById("phase-guess"),pr=document.getElementById("phase-real");
  if(!pg||!pr) return;
  pg.style.transition="opacity 0.4s"; pg.style.opacity="0";
  setTimeout(function(){
    pg.classList.add("hidden"); pg.style.opacity=""; pg.style.transition="";
    pr.classList.remove("hidden"); pr.style.opacity="0"; pr.style.transition="opacity 0.4s";
    setTimeout(function(){ pr.style.opacity="1"; },10);
    var src=document.getElementById("guessCanvas"),dst=document.getElementById("guessCanvasFinal");
    if(src&&dst){var dc=dst.getContext("2d");dc.clearRect(0,0,dst.width,dst.height);dc.drawImage(src,0,0,dst.width,dst.height);}
    setTimeout(function(){
      animateChart("realCanvas",REAL_DATA,"real",function(){
        setTimeout(function(){ animateChart("futureCanvas",FUTURE_DATA,"future"); },400);
      });
    },400);
  },400);
}

// ========================================
// 13. WISH — WISHLIST
// ========================================

var _wishItems = [];
var WISH_DEFAULTS = [
  { id: "wish1", text: "去旅行~ ✈️",              checked: false },
  { id: "wish2", text: "一起做一顿饭 👨‍🍳",         checked: false },
  { id: "wish3", text: "一起看日出 🌄",             checked: false },
  { id: "wish4", text: "拍一套情侣写真 📸",          checked: false }
];

function saveWishes() {
  if (!db) return;
  db.collection("wishes").doc("items")
    .set({ items: _wishItems, updatedAt: new Date().toISOString() })
    .catch(function(){});
}

function renderWishes() {
  var checklist = document.querySelector(".checklist");
  if (!checklist) return;
  var addWishDiv = document.querySelector(".add-wish");
  checklist.querySelectorAll(".checklist-item").forEach(function(el){ el.remove(); });
  _wishItems.forEach(function(w) {
    var item = document.createElement("div");
    item.className = "checklist-item";
    // w.text 是用户在 wishlist 输入框打的自由文字，插进 innerHTML 前要转义，
    // 不然打个 < 或 " 之类字符会把页面结构搞坏（跟相册说明文字同一类问题）。
    item.innerHTML = '<input type="checkbox" id="' + w.id + '"' + (w.checked ? ' checked' : '') + '>'
      + '<label for="' + w.id + '">' + escHtml(w.text) + '</label>';
    checklist.insertBefore(item, addWishDiv);
    item.querySelector("input").addEventListener("change", function(e) {
      w.checked = e.target.checked;
      saveWishes();
    });
  });
}

function loadWishes() {
  if (!db) {
    _wishItems = WISH_DEFAULTS.map(function(w){ return { id: w.id, text: w.text, checked: false }; });
    var savedRaw = localStorage.getItem("wish_items");
    if (savedRaw) { try { _wishItems = JSON.parse(savedRaw); } catch(e) {} }
    else {
      var baked = bakedGet("wishes", null);
      if (baked && baked.length) _wishItems = baked;
    }
    renderWishes();
    return;
  }
  db.collection("wishes").doc("items").get().then(function(doc) {
    if (doc.exists && Array.isArray(doc.data().items) && doc.data().items.length) {
      _wishItems = doc.data().items;
    } else {
      _wishItems = WISH_DEFAULTS.map(function(w){ return { id: w.id, text: w.text, checked: false }; });
      saveWishes();
    }
    renderWishes();
  }).catch(function() {
    _wishItems = WISH_DEFAULTS.map(function(w){ return { id: w.id, text: w.text, checked: false }; });
    renderWishes();
  });
}

function addWish() {
  var input = document.getElementById("new-wish");
  if (!input || !input.value.trim()) return;
  _wishItems.push({ id: "wish-" + Date.now(), text: input.value.trim(), checked: false });
  input.value = "";
  renderWishes();
  saveWishes();
  if (!db) localStorage.setItem("wish_items", JSON.stringify(_wishItems));
}

// ========================================
// 14. WISH — COUPON DOWNLOAD
// ========================================

function saveCoupon(couponId,name) {
  var W=420,H=250,canvas=document.createElement("canvas");
  canvas.width=W; canvas.height=H; var ctx=canvas.getContext("2d");
  var themes={
    "coupon-1":{bg1:"#3d1a0a",bg2:"#6b2d1a",border:"#d4843a",emoji:"(╯˔皏˔)╯",ribbon:"限定版",uses:"10次"},
    "coupon-2":{bg1:"#2d0a2e",bg2:"#5c1461",border:"#e090e0",emoji:"😘",ribbon:"珍藏版",uses:"2次"},
    "coupon-3":{bg1:"#0a2540",bg2:"#0a3d4a",border:"#80d4c8",emoji:"⚡",ribbon:"超级版",uses:"5次"},
  };
  var t=themes[couponId]||themes["coupon-1"];
  var g=ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,t.bg1); g.addColorStop(1,t.bg2);
  ctx.fillStyle=g; rrect(ctx,0,0,W,H,16); ctx.fill();
  ctx.strokeStyle=t.border; ctx.lineWidth=2; rrect(ctx,2,2,W-4,H-4,14); ctx.stroke();
  ctx.strokeStyle=t.border+"44"; ctx.lineWidth=1; ctx.strokeRect(10,10,W-20,H-20);
  ctx.fillStyle=t.border; ctx.font="bold 11px sans-serif"; ctx.textAlign="right"; ctx.fillText(t.ribbon,W-14,22);
  ctx.font="36px serif"; ctx.textAlign="center"; ctx.fillText(t.emoji,W/2,70);
  ctx.fillStyle="#fff8f2"; ctx.font="bold 26px sans-serif"; ctx.fillText(name,W/2,106);
  ctx.setLineDash([5,4]); ctx.strokeStyle=t.border+"55"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(16,120); ctx.lineTo(W-16,120); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle="rgba(255,230,210,0.85)"; ctx.font="14px sans-serif";
  ["有效期：一年内","持有人：" + profile.partnerB,"使用次数：" + t.uses].forEach(function(t2,i){ ctx.fillText(t2,W/2,148+i*22); });
  ctx.fillStyle="rgba(255,255,255,0.1)"; ctx.font="11px sans-serif"; ctx.fillText("Love Universe ❤️",W/2,H-9);
  var a=document.createElement("a"); a.download=name+".png"; a.href=canvas.toDataURL("image/png"); a.click();
}

// ========================================
// 15. WISH — SEND HUG
// ========================================

function sendHug() {
  if (!fxContainer) return;
  var emojis=["💕","❤️","💖","💗","💓","💝","🪷","💞"];
  for (var i=0;i<38;i++) {
    (function(idx){
      setTimeout(function(){
        var h=document.createElement("div"); h.className="floating-heart"; h.textContent=emojis[Math.floor(Math.random()*emojis.length)];
        var left=(Math.random()*88+4).toFixed(1),size=(Math.random()*22+16).toFixed(1);
        var dur=(Math.random()*2.2+2.2).toFixed(2),drift=((Math.random()-0.5)*120).toFixed(1);
        h.setAttribute("style","left:"+left+"%;font-size:"+size+"px;animation-duration:"+dur+"s;--drift:"+drift+"px;");
        fxContainer.appendChild(h); setTimeout(function(){h.remove();},+dur*1000+300);
      },idx*65);
    })(i);
  }
}

// ========================================
// 16. ENERGY — SAVE MESSAGE
// ========================================

function saveMessage() {
  var ta=document.getElementById("energy-message");
  if(!ta||!ta.value.trim()){alert("请先写点什么...");return;}
  var btn=document.querySelector(".save-btn");
  function onSaved(){
    localStorage.setItem("energy-message",ta.value);
    if(btn){var orig=btn.textContent;btn.textContent="已保存 ✓";btn.style.background="linear-gradient(135deg,#4a7a4a,#366336)";setTimeout(function(){btn.textContent=orig;btn.style.background="";},2000);}
  }
  if (db) {
    db.collection("messages").doc("energy").set({content:ta.value,updatedAt:new Date().toISOString()})
      .then(onSaved).catch(onSaved);
  } else {
    onSaved();
  }
}

// ========================================
// 17. 🌙 MOON PHASE
// ========================================

function getMoonPhase(date) {
  var synodic=29.53059, ref=new Date("2000-01-06T18:14:00Z");
  var diff=(date-ref)/86400000;
  return ((diff%synodic)+synodic)%synodic;
}

function displayMoonPhase() {
  var phase=getMoonPhase(TOGETHER_DATE);
  var emoji,name,desc;
  if      (phase<1.85)  {emoji="🌑";name="新月";   desc="那一天月亮正值新生，像我们刚开始的爱情 ✨";}
  else if (phase<7.38)  {emoji="🌒";name="峨眉月"; desc="那一天月牙悄悄出现，像我们悄悄靠近彼此 🌙";}
  else if (phase<11.07) {emoji="🌓";name="上弦月"; desc="那一天月亮刚好一半，像我们爱情的起步 💫";}
  else if (phase<14.77) {emoji="🌔";name="盈凸月"; desc="那一天月亮快要圆了，像我们越来越好的感情 💕";}
  else if (phase<16.62) {emoji="🌕";name="满月";   desc="那一天月亮最圆最亮，就像我们的爱一样圆满 ❤️";}
  else if (phase<22.15) {emoji="🌖";name="交凸月"; desc="那一天月亮刚过最圆，但我们的爱只会越来越满 ❤️";}
  else if (phase<25.84) {emoji="🌗";name="下弦月"; desc="那一天月亮悄悄转身，但我们的故事才刚刚开始 🌟";}
  else                  {emoji="🌘";name="残月";   desc="那一天月亮即将消失，为了迎接新的开始 ✨";}
  var el=document.getElementById("moon-phase-display");
  if(el) el.innerHTML='<div class="moon-emoji-big">'+emoji+'</div><div class="moon-name">'+name+'</div><div class="moon-desc">'+desc+'</div>';
}

// ========================================
// 18. SETUP MODAL — 用户 key in 自己资料的表单
// ========================================
// 这就是"让用户自己输入资料"的核心写法：
//   1. openSetup()  把 localStorage 现有值填回表单，方便用户修改
//   2. saveSetupForm() 读表单 → 存 localStorage → 刷新页面重新渲染
//   3. 没有存过资料时（第一次打开网站）自动弹出，逼用户先填一次

function openSetup() {
  var p = loadProfile();
  var map = {
    "setup-partnerA": p.partnerA,
    "setup-partnerB": p.partnerB,
    "setup-met-date": p.metDate,
    "setup-together-date": p.togetherDate,
    "setup-title": p.siteTitle,
    "setup-subtitle": p.subtitle,
    "setup-password": p.password
  };
  Object.keys(map).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = map[id];
  });
  var modal = document.getElementById("setup-modal");
  if (modal) modal.classList.add("open");
}

function closeSetup() {
  var modal = document.getElementById("setup-modal");
  if (modal) modal.classList.remove("open");
}

function saveSetupForm() {
  function val(id, fallback) {
    var el = document.getElementById(id);
    var v = el ? el.value.trim() : "";
    return v || fallback;
  }
  var newProfile = {
    partnerA: val("setup-partnerA", DEFAULT_PROFILE.partnerA),
    partnerB: val("setup-partnerB", DEFAULT_PROFILE.partnerB),
    metDate: val("setup-met-date", DEFAULT_PROFILE.metDate),
    togetherDate: val("setup-together-date", DEFAULT_PROFILE.togetherDate),
    siteTitle: val("setup-title", DEFAULT_PROFILE.siteTitle),
    subtitle: val("setup-subtitle", DEFAULT_PROFILE.subtitle),
    password: (document.getElementById("setup-password") || {}).value || ""
  };
  saveProfile(newProfile);
  location.reload();
}

// ========================================
// 19. INITIALIZATION
// ========================================

window.addEventListener("load", function() {
  applyProfileToDOM();

  // 第一次打开、还没填过资料 → 自动弹出 Setup 表单
  if (!hasSavedProfile()) openSetup();

  generateStars("opening-stars", 90,  {colors:["rgba(255,235,245,0.9)","rgba(255,210,240,0.85)"],glowColor:"rgba(255,200,255,1)"});
  generateStars("ending-stars",  120, {colors:["rgba(255,220,250,0.9)","rgba(220,200,255,0.85)","rgba(255,240,200,0.8)"],glowColor:"rgba(255,215,255,1)"});
  generateStars("home-stars",    60,  {colors:["rgba(255,230,245,0.9)","rgba(255,205,235,0.85)"],glowColor:"rgba(255,215,255,1)"});
  generateStars("story-stars",   45,  {colors:["rgba(255,215,235,0.9)","rgba(210,185,255,0.85)"],glowColor:"rgba(230,205,255,1)"});
  generateStars("gallery-stars", 35,  {colors:["rgba(255,205,230,0.9)","rgba(230,185,255,0.85)"],glowColor:"rgba(255,200,255,1)"});
  generateStars("energy-stars",  30,  {colors:["rgba(195,240,220,0.85)","rgba(210,185,255,0.85)"],glowColor:"rgba(200,255,230,1)"});
  typeEnglish();
  updateTimers(); setInterval(updateTimers, 1000);
  updateNextAnniversary(); setInterval(updateNextAnniversary, 60000);
  displayRandomMessage();
  var rb=document.getElementById("refresh-message-btn"); if(rb) rb.addEventListener("click",displayRandomMessage);
  setupGalleryTabs(); galleryLoadExtraCategories(); renderGallery("2024-01");
  setupPhotoUploads(); setupDateInputs(); setupEditableTexts(); setupMusicUpload();
  storyLoadExtraItems();
  var msgEl=document.getElementById("energy-message");
  if(msgEl){
    var bakedMsg = function(){ var s=localStorage.getItem("energy-message")||bakedGet("energyMessage",""); if(s) msgEl.value=s; };
    if (db) {
      db.collection("messages").doc("energy").get().then(function(doc){
        if(doc.exists&&doc.data().content){ msgEl.value=doc.data().content; localStorage.setItem("energy-message",doc.data().content); }
        else{ bakedMsg(); }
      }).catch(bakedMsg);
    } else {
      bakedMsg();
    }
  }
  var navHome=document.getElementById("nav-home"); if(navHome) navHome.classList.add("active");

  // Hide splash screen
  setTimeout(function() {
    if (window._loginShowingSplash) return;
    var splash=document.getElementById("splash");
    if(splash){splash.classList.add("fade-out");setTimeout(function(){splash.style.display="none";},950);}
  }, 1600);

  loadWishes();

  if (db) {
    db.collection("quiz").doc("custom_questions").get().then(function(doc){
      if(doc.exists&&Array.isArray(doc.data().questions)){
        _quizExtraCache=doc.data().questions;
        localStorage.setItem(QUIZ_STORAGE_KEY,JSON.stringify(_quizExtraCache));
        quizUpdateCount();
      }
    }).catch(function(){});
  }
});

console.log("❤️ Love Anniversary Website Template Loaded ❤️");

// ========================================
// 20. SHARED TOAST
// ========================================
function showToast(msg, dur) {
  dur = dur || 2800;
  var t = document.getElementById("shared-toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(function() { t.classList.remove("show"); }, dur);
}

// ========================================
// 21. QUIZ PAGE — 你有多了解我
// ========================================
var QUIZ_STORAGE_KEY = "quiz_questions_custom";
var _quizExtraCache  = null;

// ── 内置题库（换成你们自己的问题吧！fbCorrect / fbWrong 是答对/答错时显示的话）
var QUIZ_BASE_QUESTIONS = [
  { text:"我最喜欢喝什么？", opts:["奶茶","咖啡","果汁","汽水"], correct:0,
    fbCorrect:"答对啦！你果然懂我 😊", fbWrong:"不对哦，再想想～" },
  { text:"我最害怕什么？", opts:["蟑螂","黑","高度","狗"], correct:0,
    fbCorrect:"对，就是这个！", fbWrong:"不对不对，再猜猜" },
  { text:"我们第一次见面是在哪里？", opts:["学校","咖啡厅","朋友聚会","网上"], correct:0,
    fbCorrect:"没错，就是那次！", fbWrong:"再想想是在哪里认识的" },
  { text:"我们两个第一次聊天是什么时候？", opts:["自行回答","自行回答","自行回答","自行回答"], correct:0,
    fbCorrect:"答对了！", fbWrong:"再想想～" },
  { text:"我最喜欢叫你什么昵称？", opts:["宝宝","亲爱的","名字","自定义"], correct:0,
    fbCorrect:"嘻嘻就是这个！", fbWrong:"不对哦～" },
  { text:"我做过什么让你感动的事情吗？", opts:["自行回答","自行回答","自行回答","自行回答"], correct:1,
    fbCorrect:"自行回答，跟我说！", fbWrong:"自行回答，跟我说！" },
  { text:"你觉得我们之间最珍贵的回忆是什么？", opts:["自行回答","自行回答","自行回答","自行回答"], correct:1,
    fbCorrect:"自行回答，跟我说！", fbWrong:"自行回答，跟我说！" },
];

var quizQuestions = [];
var quizQueue = [];
var quizCurrentQIndex = 0;
var quizScore = 0;
var quizAnswerLog = [];
var QUIZ_LETTERS = ["A","B","C","D"];

var QUIZ_RATINGS = [
  {min:0,   max:.3,  emoji:"😭", title:"完全不了解我！",   msg:"哎，你根本不了解我好吗！！快去重新认识我，下次要答好一点，不然我生气了！"},
  {min:.3,  max:.5,  emoji:"🤔", title:"还差得远呢~",      msg:"还可以啦，但是还不够哦！继续努力了解我，我等你慢慢进步～"},
  {min:.5,  max:.7,  emoji:"🥺", title:"还算合格啦...",    msg:"可可，你还记得一些事，不过还有好多可以更了解我的地方啦~"},
  {min:.7,  max:.9,  emoji:"🥰", title:"你很了解我！",     msg:"哇！你果然还是很懂我的，感觉被重视了，好开心 好开心~ 继续保持！"},
  {min:.9, max:1.01, emoji:"😍", title:"你是最了解我的人！", msg:"天哪你全部都答对了！！你真的太了解我了好吗，我好感动哦！爱你～"},
];

function quizLoadQuestions() {
  if (_quizExtraCache !== null) return _quizExtraCache;
  try {
    var raw = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return bakedGet("quizQuestions", []);
}
function quizSaveQuestions(qs) {
  _quizExtraCache = qs;
  localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(qs));
  if (db) db.collection("quiz").doc("custom_questions").set({questions:qs,updatedAt:new Date().toISOString()}).catch(function(){});
}

function quizUpdateCount() {
  var el = document.getElementById("q-count");
  if (el) el.textContent = QUIZ_BASE_QUESTIONS.length + quizLoadQuestions().length;
}

function quizAddQuestion() {
  var text = (document.getElementById("new-q-text") || {}).value || "";
  text = text.trim();
  var opts = [
    ((document.getElementById("opt-a") || {}).value || "").trim(),
    ((document.getElementById("opt-b") || {}).value || "").trim(),
    ((document.getElementById("opt-c") || {}).value || "").trim(),
    ((document.getElementById("opt-d") || {}).value || "").trim(),
  ];
  var correct = parseInt((document.getElementById("correct-answer") || {}).value || "0");
  var fbCorrect = ((document.getElementById("feedback-correct") || {}).value || "").trim();
  var fbWrong   = ((document.getElementById("feedback-wrong")   || {}).value || "").trim();

  if (!text) { showToast("✏️ 题目不能空着呀~"); return; }
  if (opts.some(function(o) { return !o; })) { showToast("✏️ 四个选项都要填哦~"); return; }

  var extraQs = quizLoadQuestions();
  extraQs.push({ id: Date.now(), text: text, opts: opts, correct: correct, fbCorrect: fbCorrect, fbWrong: fbWrong });
  quizSaveQuestions(extraQs);
  quizUpdateCount();
  quizRenderQList();
  quizClearAddForm();
  showToast("✅ 题目已添加！");
}

function quizDeleteQuestion(id) {
  var extraQs = quizLoadQuestions().filter(function(q) { return q.id !== id; });
  quizSaveQuestions(extraQs);
  quizUpdateCount();
  quizRenderQList();
  showToast("🗑️ 题目已删除");
}

function quizClearAddForm() {
  ["new-q-text","feedback-correct","feedback-wrong"].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = "";
  });
  ["opt-a","opt-b","opt-c","opt-d"].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = "";
  });
  var ca = document.getElementById("correct-answer"); if (ca) ca.value = "0";
}

function escHtml(s) {
  return String(s).replace(/[&<>"']/g, function(c) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  });
}

function quizRenderQList() {
  var extraQs = quizLoadQuestions();
  quizUpdateCount();
  var list  = document.getElementById("quiz-q-list");
  var empty = document.getElementById("quiz-q-list-empty");
  if (!list) return;
  if (extraQs.length === 0) {
    if (empty) empty.style.display = "block";
    list.innerHTML = "";
    return;
  }
  if (empty) empty.style.display = "none";
  list.innerHTML = extraQs.map(function(q, i) {
    return '<div class="quiz-q-item">' +
      '<div class="quiz-q-item-left">' +
        '<div class="quiz-q-num">题目 ' + (i+1) + '</div>' +
        '<div class="quiz-q-text">' + escHtml(q.text) + '</div>' +
        '<div class="quiz-q-opts">' +
          q.opts.map(function(o, j) {
            return '<span class="quiz-q-opt-chip' + (j===q.correct ? ' is-correct' : '') + '">' +
              QUIZ_LETTERS[j] + '. ' + escHtml(o) + '</span>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<button class="quiz-btn-del-q" onclick="quizDeleteQuestion(' + q.id + ')" title="删除">✕</button>' +
    '</div>';
  }).join('');
}

function quizSwitchMode(mode) {
  var panelAdd  = document.getElementById("quiz-panel-add");
  var panelPlay = document.getElementById("quiz-panel-play");
  var tabAdd    = document.getElementById("quiz-tab-add");
  var tabPlay   = document.getElementById("quiz-tab-play");
  if (!panelAdd) return;
  if (mode === "add") {
    panelAdd.classList.add("active");    panelPlay.classList.remove("active");
    tabAdd.classList.add("active");      tabPlay.classList.remove("active");
    quizRenderQList();
  } else {
    panelAdd.classList.remove("active"); panelPlay.classList.add("active");
    tabAdd.classList.remove("active");   tabPlay.classList.add("active");
    quizStartQuiz();
  }
}

function quizStartQuiz() {
  quizQuestions = QUIZ_BASE_QUESTIONS.concat(quizLoadQuestions());
  var noMsg    = document.getElementById("quiz-no-questions-msg");
  var progress = document.getElementById("quiz-progress");
  var card     = document.getElementById("quiz-question-card");
  var result   = document.getElementById("quiz-result-card");
  if (!noMsg) return;

  if (quizQuestions.length === 0) {
    noMsg.style.display    = "block";
    progress.style.display = "none";
    card.style.display     = "none";
    result.classList.remove("show");
    return;
  }
  quizQueue = quizQuestions.slice().sort(function() { return Math.random() - .5; });
  quizCurrentQIndex = 0; quizScore = 0; quizAnswerLog = [];

  noMsg.style.display    = "none";
  progress.style.display = "block";
  card.style.display     = "block";
  result.classList.remove("show");
  quizShowQuestion();
}

function quizShowQuestion() {
  var q     = quizQueue[quizCurrentQIndex];
  var total = quizQueue.length;
  var pct   = Math.round((quizCurrentQIndex / total) * 100);

  document.getElementById("quiz-progress-fill").style.width = pct + "%";
  document.getElementById("quiz-progress-text").textContent = quizCurrentQIndex + " / " + total;
  document.getElementById("quiz-q-badge").textContent = "题目 " + (quizCurrentQIndex+1) + " / " + total;
  document.getElementById("quiz-question-text").textContent = q.text;

  var opts = document.getElementById("quiz-answer-options");
  if (q.opts[0] === "自行回答") {
    opts.innerHTML =
      '<textarea class="quiz-open-input" id="quiz-open-input" placeholder="写下你的回答…" rows="4"></textarea>' +
      '<button class="quiz-open-submit" onclick="quizSubmitOpenAnswer()">提交 ✨</button>';
  } else {
    opts.innerHTML = q.opts.map(function(o, i) {
      return '<button class="quiz-answer-btn" onclick="quizSelectAnswer(' + i + ')" id="quiz-ans-btn-' + i + '">' +
        '<span class="quiz-ans-letter">' + QUIZ_LETTERS[i] + '</span>' +
        escHtml(o) +
      '</button>';
    }).join('');
  }

  var fb = document.getElementById("quiz-feedback-box");
  fb.className = "quiz-feedback-box";
  fb.textContent = "";
  var next = document.getElementById("quiz-btn-next");
  next.className = "quiz-btn-next";

  var card = document.getElementById("quiz-question-card");
  card.style.animation = "none";
  card.offsetHeight;
  card.style.animation = "qCardIn .4s ease";
}

function quizSelectAnswer(chosen) {
  var q = quizQueue[quizCurrentQIndex];
  var isCorrect = chosen === q.correct;

  document.querySelectorAll(".quiz-answer-btn").forEach(function(btn, i) {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add("correct");
    else if (i === chosen && !isCorrect) btn.classList.add("wrong");
  });

  var fb = document.getElementById("quiz-feedback-box");
  if (isCorrect) {
    quizScore++;
    fb.className = "quiz-feedback-box correct";
    fb.textContent = q.fbCorrect || "🎉 答对啦！你果然了解我~";
  } else {
    fb.className = "quiz-feedback-box wrong";
    fb.textContent = q.fbWrong || ("❌ 答错了！正确答案是 " + QUIZ_LETTERS[q.correct] + ". " + q.opts[q.correct]);
  }

  quizAnswerLog.push({ question: q.text, correct: isCorrect, chosen: q.opts[chosen], answer: q.opts[q.correct] });

  var next = document.getElementById("quiz-btn-next");
  next.className = "quiz-btn-next show";
  next.textContent = (quizCurrentQIndex + 1 >= quizQueue.length) ? "查看结果 ✨" : "下一题 →";
}

function quizSubmitOpenAnswer() {
  var q     = quizQueue[quizCurrentQIndex];
  var input = document.getElementById("quiz-open-input");
  var text  = input ? input.value.trim() : "";
  if (!text) return;

  if (input) input.disabled = true;
  var sub = document.querySelector("#quiz .quiz-open-submit");
  if (sub) sub.disabled = true;

  var fb = document.getElementById("quiz-feedback-box");
  fb.className  = "quiz-feedback-box correct";
  fb.textContent = q.fbCorrect || "谢谢你的回答，跟我说！❤";

  quizScore++;
  quizAnswerLog.push({ question: q.text, correct: true, chosen: text, answer: "open", isOpen: true });

  var next = document.getElementById("quiz-btn-next");
  next.className  = "quiz-btn-next show";
  next.textContent = (quizCurrentQIndex + 1 >= quizQueue.length) ? "查看结果 ✨" : "下一题 →";
}

function quizNextQuestion() {
  quizCurrentQIndex++;
  if (quizCurrentQIndex >= quizQueue.length) {
    quizShowResult();
  } else {
    quizShowQuestion();
  }
}

function quizShowResult() {
  var total  = quizQueue.length;
  var pct    = quizScore / total;
  var rating = QUIZ_RATINGS.find(function(r) { return pct >= r.min && pct < r.max; }) || QUIZ_RATINGS[QUIZ_RATINGS.length-1];

  document.getElementById("quiz-progress-fill").style.width = "100%";
  document.getElementById("quiz-progress-text").textContent = total + " / " + total;
  document.getElementById("quiz-question-card").style.display = "none";

  document.getElementById("quiz-result-emoji").textContent = rating.emoji;
  document.getElementById("quiz-result-score").textContent = quizScore;
  document.getElementById("quiz-result-max").textContent   = "/ " + total + " 题";
  document.getElementById("quiz-result-title").textContent = rating.title;
  document.getElementById("quiz-result-msg").textContent   = rating.msg;

  document.getElementById("quiz-result-detail").innerHTML = quizAnswerLog.map(function(r, i) {
    var q = r.question.length > 28 ? r.question.slice(0,28) + "…" : r.question;
    return '<div class="quiz-detail-row">' +
      '<span class="quiz-detail-q">Q' + (i+1) + '. ' + escHtml(q) + '</span>' +
      '<span>' + (r.correct ? "✅" : "❌") + '</span>' +
    '</div>';
  }).join('');

  document.getElementById("quiz-result-card").classList.add("show");
}

// ========================================
// 22. FUTURE LETTER PAGE — 给未来的信
// ========================================
// FL_UNLOCK_DATE 默认是"在一起日期 + 1年"，也可以自己改成任何日期。
var FL_UNLOCK_DATE = nextAnniversary(profile.togetherDate);
var flCurrentWriter = "";
var flCountdownTimer = null;

// 写信人 a / b 分别代表 partnerA / partnerB，名字从 profile 动态取，不写死。
var FL_WRITERS = {
  a: function () { return { from: profile.partnerA, to: profile.partnerB }; },
  b: function () { return { from: profile.partnerB, to: profile.partnerA }; }
};

function flIsUnlocked() { return new Date() >= FL_UNLOCK_DATE; }

// 本机没有这封信的时候，退回去看导出最终版网站时烤进去的信。
function flLoadLetterLocal(writerId) {
  var raw = localStorage.getItem("fl_letter_" + writerId);
  if (raw) { try { return JSON.parse(raw); } catch (e) {} }
  return bakedGet("letters." + writerId, null);
}

function flEnableReadButtons() {
  ["a","b"].forEach(function(id) {
    var btn = document.getElementById("fl-read-" + id);
    var st  = document.getElementById("fl-status-" + id);
    if (btn) btn.disabled = false;
    if (st)  { st.textContent = "✅ 已解锁！"; st.className = "fl-env-status fl-unlocked"; }
  });
}

function flCountdownTick() {
  var now  = new Date();
  var diff = FL_UNLOCK_DATE - now;
  if (diff <= 0) {
    ["fl-cd-days","fl-cd-hours","fl-cd-minutes","fl-cd-seconds"].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.textContent = "00";
    });
    flEnableReadButtons();
    return;
  }
  var d = Math.floor(diff / 864e5);
  var h = Math.floor((diff % 864e5) / 36e5);
  var m = Math.floor((diff % 36e5) / 6e4);
  var s = Math.floor((diff % 6e4) / 1e3);
  var days = document.getElementById("fl-cd-days");    if (days) days.textContent    = String(d).padStart(3,"0");
  var hrs  = document.getElementById("fl-cd-hours");   if (hrs)  hrs.textContent     = String(h).padStart(2,"0");
  var mins = document.getElementById("fl-cd-minutes"); if (mins) mins.textContent    = String(m).padStart(2,"0");
  var secs = document.getElementById("fl-cd-seconds"); if (secs) secs.textContent   = String(s).padStart(2,"0");

  if (flCountdownTimer) clearInterval(flCountdownTimer);
  flCountdownTimer = setInterval(flCountdownTick, 1000);
}

function flOpenWrite(writerId) {
  flCurrentWriter = writerId;
  var names = FL_WRITERS[writerId]();
  var title = document.getElementById("fl-write-modal-title");
  var to    = document.getElementById("fl-write-to-display");
  var body  = document.getElementById("fl-letter-body");
  if (title) title.textContent = names.from + " 的信 ✉️";
  if (to)    to.textContent    = names.to;
  if (body)  body.value        = "";
  flOpenModal("fl-write-modal");
}

function flSendLetter() {
  var bodyEl = document.getElementById("fl-letter-body");
  var body   = bodyEl ? bodyEl.value.trim() : "";
  if (!body) { showToast("✏️ 还没写内容呢~"); return; }

  var btn = document.getElementById("fl-send-btn");
  if (btn) { btn.textContent = "封存中..."; btn.disabled = true; }

  var payload = {
    writer: flCurrentWriter,
    content: body,
    writtenAt: new Date().toISOString(),
    unlockAt: FL_UNLOCK_DATE.toISOString()
  };
  function onLetterSaved() {
    localStorage.setItem("fl_letter_" + flCurrentWriter, JSON.stringify(payload));
    flCloseModal("fl-write-modal");
    setTimeout(function() {
      var overlay = document.getElementById("fl-saved-modal");
      if (overlay) overlay.style.display = "flex";
    }, 300);
    if (btn) { btn.textContent = "📬 封存这封信"; btn.disabled = false; }
  }
  if (db) {
    db.collection("letters").doc(flCurrentWriter).set(payload).then(onLetterSaved).catch(onLetterSaved);
  } else {
    onLetterSaved();
  }
}

function flOpenRead(writerId) {
  if (!flIsUnlocked()) {
    showToast("🔒 还没到解锁日期呢，要等哦~");
    return;
  }
  var info = FL_WRITERS[writerId]();
  var subEl = document.getElementById("fl-read-modal-subtitle");
  if (subEl) subEl.textContent = info.from + " 写给 " + info.to + " 的信";

  var cont = document.getElementById("fl-read-letter-content");
  if (!cont) return;
  cont.innerHTML = '<div class="fl-read-letter-box"><p style="color:#c4a8e0;text-align:center;padding:20px 0;">加载中... 💭</p></div>';
  flOpenModal("fl-read-modal");

  function renderLetter(data) {
    if (!data) {
      cont.innerHTML = '<div class="fl-read-letter-box"><p style="color:#c4a8e0;text-align:center;padding:20px 0;">这封信还没有写呢... 💭</p></div>';
    } else {
      var dateStr = new Date(data.writtenAt).toLocaleDateString("zh-CN", { year:"numeric", month:"long", day:"numeric" });
      cont.innerHTML =
        '<div class="fl-read-letter-box">' +
          '<div class="fl-read-from">来自 ' + info.from + '</div>' +
          '<div class="fl-read-date">写于 ' + dateStr + '</div>' +
          '<div class="fl-read-content">' + escHtml(data.content) + '</div>' +
          '<div class="fl-read-seal">— ' + info.from + '，永远爱你 💕</div>' +
        '</div>';
    }
  }
  if (db) {
    db.collection("letters").doc(writerId).get()
      .then(function(doc) {
        if (doc.exists) { localStorage.setItem("fl_letter_"+writerId, JSON.stringify(doc.data())); renderLetter(doc.data()); }
        else { renderLetter(flLoadLetterLocal(writerId)); }
      })
      .catch(function() { renderLetter(flLoadLetterLocal(writerId)); });
  } else {
    renderLetter(flLoadLetterLocal(writerId));
  }
}

function flOpenModal(id) {
  var el = document.getElementById(id); if (el) el.classList.add("open");
}
function flCloseModal(id) {
  var el = document.getElementById(id); if (el) el.classList.remove("open");
}

// ========================================
// 22.5 导出最终版网站 — 把当前浏览器里调好的所有内容
// （profile / 照片 / 故事文字和日期 / quiz 题目 / wishlist / 未来信 / 相册新照片）
// 打包成一份新的网站文件，重新部署后发给对方，对方打开看到的就是成品，
// 不再是空白模板。见 README「改好之后，怎么把内容分享给对方」。
// ========================================

var FIXED_PHOTO_FILENAMES = {
  "hero-photo-1": "photo1.jpg",
  "hero-photo-2": "photo2.jpg",
  "story-photo-1": "story1.jpg",
  "story-photo-2": "story2.jpg",
  "story-photo-3": "story3.jpg",
  "story-photo-4": "story4.jpg",
  "story-photo-5": "story5.jpg"
};

// 导出时尽量把这些"默认就引用到"的素材文件也一起打包进去（如果真的存在的话）。
// 静态网站没办法列目录，只能一个个试着 fetch，404 就跳过，不算错误。
var EXPORT_STATIC_ASSETS = [
  "images/photo1.jpg", "images/photo2.jpg",
  "images/story1.jpg", "images/story2.jpg", "images/story3.jpg", "images/story4.jpg", "images/story5.jpg",
  "images/example1.jpg", "images/example2.jpg", "images/example3.jpg", "images/example4.jpg", "images/example5.jpg",
  "music/background.mp3"
];

function tryFetchBlob(url) {
  return fetch(url).then(function (r) { return r.ok ? r.blob() : null; }).catch(function () { return null; });
}
function tryFetchText(url) {
  return fetch(url).then(function (r) { return r.ok ? r.text() : null; }).catch(function () { return null; });
}

function loadJSZip() {
  if (window.JSZip) return Promise.resolve(window.JSZip);
  return new Promise(function (resolve, reject) {
    var s = document.createElement("script");
    s.src = "vendor/jszip.min.js";
    s.onload = function () { resolve(window.JSZip); };
    s.onerror = function () { reject(new Error("JSZip 加载失败，检查一下 vendor/jszip.min.js 是否还在")); };
    document.head.appendChild(s);
  });
}

// 收集当前浏览器里所有已经调好的内容：
// 文字/日期这些直接返回，照片这些要从 IndexedDB 读出 Blob，所以整体是异步的。
function collectExportData() {
  var json = {};
  json.profile = loadProfile();

  json.dates = {};
  document.querySelectorAll(".timeline-date-input[data-date-key]").forEach(function (el) {
    if (el.value) json.dates[el.getAttribute("data-date-key")] = el.value;
  });

  json.edits = {};
  document.querySelectorAll(".editable-text[data-edit-key]").forEach(function (el) {
    json.edits[el.getAttribute("data-edit-key")] = el.textContent;
  });

  json.quizQuestions = quizLoadQuestions();
  json.energyMessage = localStorage.getItem("energy-message") || "";

  json.wishes = (function () {
    try {
      var raw = localStorage.getItem("wish_items");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return _wishItems || [];
  })();

  json.letters = {};
  ["a", "b"].forEach(function (id) {
    var l = flLoadLetterLocal(id);
    if (l) json.letters[id] = l;
  });

  json.gallery = {};
  json.galleryHidden = {};
  json.galleryCategories = galleryGetExtraCategories(); // 用户自己加的月份分类
  json.storyExtraIds = storyGetExtraIds();               // 用户自己加的故事条目
  json.photos = {};                                      // 动态条目没有写死的默认图片路径，靠这个表查

  // 固定照片位（首页大图/Day1/故事5张）：从 IndexedDB 读出来的才需要打包，
  // 没上传过的保持原样（export 时会尝试原样复制现有的 images/photoN.jpg）。
  var fixedPromise = Promise.all(Object.keys(FIXED_PHOTO_FILENAMES).map(function (key) {
    return loadPhotoBlob(key).then(function (blob) { return blob ? { key: key, blob: blob } : null; });
  })).then(function (results) { return results.filter(Boolean); });

  // 用户自己传过的背景音乐（mp3），有的话盖掉默认的 music/background.mp3
  var musicPromise = loadPhotoBlob(MUSIC_BLOB_KEY);

  // 用户自己点「➕ 添加新的故事」加的条目，照片要单独打包（没有默认文件可以覆盖）。
  var storyPhotoPromise = Promise.all(json.storyExtraIds.map(function (id) {
    var key = "story-photo-" + id;
    return loadPhotoBlob(key).then(function (blob) {
      if (!blob) return null;
      var ext = blob.type && blob.type.indexOf("png") !== -1 ? "png" : "jpg";
      var filename = "story-extra-" + id + "." + ext;
      json.photos[key] = "images/" + filename;
      return { key: key, blob: blob, filename: filename };
    });
  })).then(function (results) { return results.filter(Boolean); });

  // 相册里用户自己上传的照片，按分类逐个读出来（默认 2 个分类 + 自己加的所有分类）。
  var allCategories = Object.keys(galleryData).concat(json.galleryCategories.map(function (c) { return c.key; }));
  var galleryPromise = Promise.all(allCategories.map(function (cat) {
    var hidden = galleryGetHidden(cat);
    if (hidden.length) json.galleryHidden[cat] = hidden;
    var custom = galleryGetCustom(cat);
    return Promise.all(custom.map(function (item, i) {
      return loadPhotoBlob(item.photoKey).then(function (blob) {
        if (!blob) return null;
        var ext = blob.type && blob.type.indexOf("png") !== -1 ? "png" : "jpg";
        var filename = "gallery-" + cat + "-" + i + "." + ext;
        return { blob: blob, filename: filename, cat: cat, date: item.date, caption: item.caption };
      });
    })).then(function (results) {
      var files = results.filter(Boolean);
      json.gallery[cat] = files.map(function (f) {
        return { url: "images/gallery/" + f.filename, date: f.date, caption: f.caption };
      });
      return files;
    });
  })).then(function (perCategory) {
    return [].concat.apply([], perCategory);
  });

  return Promise.all([fixedPromise, storyPhotoPromise, galleryPromise, musicPromise]).then(function (res) {
    return { json: json, fixedPhotos: res[0], storyPhotos: res[1], galleryFiles: res[2], musicBlob: res[3] };
  });
}

function exportFinalSite() {
  var btn = document.getElementById("export-site-btn");
  var origLabel = btn ? btn.textContent : "";
  if (btn) { btn.disabled = true; btn.textContent = "打包中...⏳"; }

  Promise.all([
    loadJSZip(),
    fetch("index.html").then(function (r) { return r.text(); }),
    fetch("style.css").then(function (r) { return r.text(); }),
    fetch("script.js").then(function (r) { return r.text(); }),
    collectExportData(),
    Promise.all(EXPORT_STATIC_ASSETS.map(function (p) { return tryFetchBlob(p).then(function (b) { return { path: p, blob: b }; }); })),
    tryFetchText("README.md"),
    tryFetchText("LICENSE")
  ]).then(function (res) {
    var JSZipLib = res[0], htmlText = res[1], cssText = res[2], jsText = res[3],
        data = res[4], staticAssets = res[5], readmeText = res[6], licenseText = res[7];

    var zip = new JSZipLib();

    // 在导出版的 index.html 里插一个 data.js（window.BAKED_DATA）。
    // 要插在最前面那段密码门 <script> 之前（不是插在最下面的 script.js 前面），
    // 因为密码门那段内联脚本执行得很早，必须先读到 BAKED_DATA.profile.password
    // 才能在新访客的浏览器上正确显示/跳过密码门。
    var patchedHtml = htmlText.indexOf('<script src="data.js">') !== -1
      ? htmlText
      : htmlText.replace('</style>\n\n<script>', '</style>\n\n<script src="data.js"></script>\n<script>');

    zip.file("index.html", patchedHtml);
    zip.file("style.css", cssText);
    zip.file("script.js", jsText);
    zip.file("data.js", "window.BAKED_DATA = " + JSON.stringify(data.json, null, 2) + ";\n");
    if (readmeText)  zip.file("README.md", readmeText);
    if (licenseText) zip.file("LICENSE", licenseText);

    var imagesFolder = zip.folder("images");
    staticAssets.forEach(function (a) {
      if (!a.blob) return;
      if (a.path.indexOf("music/") === 0) { zip.folder("music").file(a.path.replace("music/", ""), a.blob); }
      else { imagesFolder.file(a.path.replace("images/", ""), a.blob); }
    });
    // 上传过的固定照片覆盖掉同名的默认文件
    data.fixedPhotos.forEach(function (p) {
      imagesFolder.file(FIXED_PHOTO_FILENAMES[p.key], p.blob);
    });
    // 用户自己加的故事条目的照片（没有默认文件，路径是 data.js 里 photos 表指定的）
    data.storyPhotos.forEach(function (p) {
      imagesFolder.file(p.filename, p.blob);
    });
    // 用户自己传过的背景音乐，盖掉默认的 music/background.mp3
    if (data.musicBlob) zip.folder("music").file("background.mp3", data.musicBlob);
    var galleryFolder = imagesFolder.folder("gallery");
    data.galleryFiles.forEach(function (f) {
      galleryFolder.file(f.filename, f.blob);
    });

    return zip.generateAsync({ type: "blob" });
  }).then(function (blob) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "love-universe-final.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("📦 打包完成！解压后重新拖到 Netlify 部署一次，新链接发出去就是成品啦 💕", 5000);
  }).catch(function (err) {
    console.error(err);
    showToast("😢 导出失败了，检查一下控制台或者重试一次");
  }).finally(function () {
    if (btn) { btn.disabled = false; btn.textContent = origLabel; }
  });
}

// Close modals on backdrop click
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll(".fl-modal-overlay").forEach(function(el) {
    el.addEventListener("click", function(e) {
      if (e.target === el) el.classList.remove("open");
    });
  });
  var setupOverlay = document.getElementById("setup-modal");
  if (setupOverlay) {
    setupOverlay.addEventListener("click", function(e) {
      if (e.target === setupOverlay) closeSetup();
    });
  }
  quizUpdateCount();
});

// ========================================
// 23. SCROLL FADE-IN  (IntersectionObserver)
// ========================================
(function() {
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  function initObserver() {
    document.querySelectorAll(".timeline-item").forEach(function(el) {
      io.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initObserver);
  } else {
    initObserver();
  }
})();

// ========================================
// 24. CURSOR TRAIL PARTICLES
// ========================================
(function() {
  var GLYPHS = ["❤", "✦", "·", "✿", "♡", "✧"];
  var lastTime = 0;
  var INTERVAL = 65;

  document.addEventListener("mousemove", function(e) {
    var now = Date.now();
    if (now - lastTime < INTERVAL) return;
    lastTime = now;

    var el = document.createElement("span");
    el.className = "cursor-particle";
    el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    el.style.left  = e.clientX + "px";
    el.style.top   = e.clientY + "px";
    el.style.color = Math.random() > 0.5 ? "#F0A987" : "#E77A9C";
    document.body.appendChild(el);
    setTimeout(function() { el.remove(); }, 900);
  });
})();

// ========================================
// 25. LOVE LETTER TYPEWRITER
// ========================================
(function() {
  var letterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        startLetterTyping();
        letterObserver.disconnect();
      }
    });
  }, { threshold: 0.05 });

  function startLetterTyping() {
    var contentEl = document.querySelector(".letter-content");
    var sigEl     = document.querySelector(".letter-signature");
    if (!contentEl || contentEl.getAttribute("data-typed")) return;
    contentEl.setAttribute("data-typed", "1");

    var texts = [];
    contentEl.querySelectorAll("p").forEach(function(p) {
      var t = p.textContent.trim();
      if (t) texts.push(t);
    });

    if (sigEl) sigEl.classList.add("letter-sig-hidden");
    contentEl.innerHTML = "";

    var hint = document.createElement("div");
    hint.className = "letter-skip-hint";
    hint.textContent = "✦ 点击信纸可跳过 ✦";
    contentEl.after(hint);

    var pIdx = 0, charIdx = 0, currentP = null, timer = null, done = false;

    function finish() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (currentP) currentP.classList.remove("letter-typing-cursor");
      contentEl.innerHTML = "";
      texts.forEach(function(t) {
        var p = document.createElement("p");
        p.textContent = t;
        contentEl.appendChild(p);
      });
      hint.remove();
      if (sigEl) sigEl.classList.remove("letter-sig-hidden");
    }

    var letterEl = document.querySelector(".love-letter");
    if (letterEl) {
      letterEl.addEventListener("click", function onSkip() {
        finish();
        letterEl.removeEventListener("click", onSkip);
      });
    }

    function typeNext() {
      if (done) return;
      if (pIdx >= texts.length) {
        if (currentP) currentP.classList.remove("letter-typing-cursor");
        hint.remove();
        if (sigEl) sigEl.classList.remove("letter-sig-hidden");
        done = true;
        return;
      }
      if (charIdx === 0) {
        if (currentP) currentP.classList.remove("letter-typing-cursor");
        currentP = document.createElement("p");
        currentP.classList.add("letter-typing-cursor");
        contentEl.appendChild(currentP);
      }
      var text = texts[pIdx];
      if (charIdx < text.length) {
        currentP.textContent += text[charIdx];
        charIdx++;
        timer = setTimeout(typeNext, 48);
      } else {
        pIdx++;
        charIdx = 0;
        timer = setTimeout(typeNext, 420);
      }
    }

    typeNext();
  }

  document.addEventListener("DOMContentLoaded", function() {
    var letterEl = document.querySelector(".love-letter");
    if (letterEl) letterObserver.observe(letterEl);
  });
})();
