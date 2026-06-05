// ---------------- Scale Viewport (bureau 1920×1080 fixe) ----------------
function scaleDesktop() {
  const desktop = document.getElementById('desktop');
  if (!desktop) return;
  const taskbar = document.getElementById('taskbar');
  const banner = document.querySelector('.construction-banner');
  const taskbarH = taskbar ? taskbar.offsetHeight : 40;
  const bannerH = banner ? banner.offsetHeight : 0;

  const scale = window.innerWidth / 1920;
  desktop.style.transform = `scale(${scale})`;
  desktop.style.top = bannerH + 'px';
  desktop.style.left = '0px';

  // Calculer la hauteur réelle occupée par les fenêtres les plus basses
  let maxBottom = 1080;
  document.querySelectorAll('.window').forEach(win => {
    if (getComputedStyle(win).display === 'none') return;
    const bottom = win.offsetTop + win.offsetHeight;
    if (bottom > maxBottom) maxBottom = bottom;
  });

  // Ajouter 200px de marge basse pour pouvoir scroller librement
  const SCROLL_PADDING = 200;
  const scaledHeight = (maxBottom + SCROLL_PADDING) * scale;
  document.body.style.height = (bannerH + taskbarH + scaledHeight) + 'px';
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scaleDesktop);
} else {
  scaleDesktop();
}
window.addEventListener('resize', scaleDesktop);

// ---------------- Gestion des Onglets ----------------
document.querySelectorAll('.window').forEach(win => {
  const tabs = win.querySelectorAll('.tab');
  const contents = win.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = win.querySelector(`#${tab.dataset.tab}`);
      if (target) target.classList.add('active');
    });
  });
});

// ---------------- Gestion des Boutons Fenêtre ----------------
document.querySelectorAll('.window').forEach(win => {
  const btnMin = win.querySelector('.minimize');
  const btnMax = win.querySelector('.maximize');
  const btnClose = win.querySelector('.close');

  if (btnMin) {
    btnMin.addEventListener('click', () => {
      const content = win.querySelector('.content');
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    });
  }

  if (btnMax) {
    btnMax.addEventListener('click', () => {
      if (win.dataset.maximized === 'true') {
        win.style.width = win.dataset.oldWidth;
        win.style.height = win.dataset.oldHeight;
        win.style.left = win.dataset.oldLeft;
        win.style.top = win.dataset.oldTop;
        win.dataset.maximized = 'false';
      } else {
        win.dataset.oldWidth = win.style.width;
        win.dataset.oldHeight = win.style.height;
        win.dataset.oldLeft = win.style.left;
        win.dataset.oldTop = win.style.top;
        win.style.left = '0';
        win.style.top = '0';
        win.style.width = '1920px';
        win.style.height = '1080px';
        win.dataset.maximized = 'true';
      }
    });
  }

  if (btnClose) {
    btnClose.addEventListener('click', () => { win.style.display = 'none'; });
  }
});

// ---------------- Déplacement des Fenêtres (scale-aware) ----------------
function getCurrentScale() {
  const desktop = document.getElementById('desktop');
  if (!desktop) return 1;
  const t = desktop.style.transform;
  const match = t.match(/scale\(([\d.]+)\)/);
  return match ? parseFloat(match[1]) : 1;
}

let activeDrag = { win: null, offsetX: 0, offsetY: 0 };
let highestZ = 1800;

function bumpZ() {
  highestZ = Math.min(highestZ + 1, 1999);
  return highestZ;
}

document.querySelectorAll('.window').forEach(win => {
  const titleBar = win.querySelector('.title');

  const startDrag = (clientX, clientY) => {
    const scale = getCurrentScale();
    activeDrag.win = win;
    activeDrag.offsetX = clientX / scale - win.offsetLeft;
    activeDrag.offsetY = clientY / scale - win.offsetTop;
    win.style.zIndex = bumpZ();
    titleBar.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  titleBar.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY));
  titleBar.addEventListener('touchstart', e => {
    const t = e.touches[0];
    if (t) startDrag(t.clientX, t.clientY);
  }, { passive: true });
});

document.addEventListener('mousemove', e => {
  if (!activeDrag.win) return;
  const win = activeDrag.win;
  const scale = getCurrentScale();
  const desktop = document.getElementById('desktop');
  const x = e.clientX / scale - activeDrag.offsetX;
  const y = e.clientY / scale - activeDrag.offsetY;
  // Bornes sur la grille 1920×1080
  const dw = 1920;
  const dh = 1080;
  const winW = win.offsetWidth;
  const winH = win.offsetHeight;
  win.style.left = Math.min(Math.max(x, -winW + 40), dw - 40) + 'px';
  win.style.top  = Math.min(Math.max(y, -winH + 40), dh - winH + 40) + 'px';
});

document.addEventListener('touchmove', e => {
  if (!activeDrag.win) return;
  const t = e.touches[0];
  if (!t) return;
  const win = activeDrag.win;
  const scale = getCurrentScale();
  const x = t.clientX / scale - activeDrag.offsetX;
  const y = t.clientY / scale - activeDrag.offsetY;
  const dw = 1920;
  const dh = 1080;
  const winW = win.offsetWidth;
  const winH = win.offsetHeight;
  win.style.left = Math.min(Math.max(x, -winW + 40), dw - 40) + 'px';
  win.style.top  = Math.min(Math.max(y, -winH + 40), dh - winH + 40) + 'px';
}, { passive: true });

const stopDrag = () => {
  if (!activeDrag.win) return;
  activeDrag.win.querySelector('.title').style.cursor = 'grab';
  document.body.style.userSelect = '';
  activeDrag.win = null;
  scaleDesktop(); // recalcule la hauteur scrollable
};
document.addEventListener('mouseup', stopDrag);
document.addEventListener('touchend', stopDrag);

// ---------------- Musique ----------------

const playlist = [
  { src: "Audio/Customize.mp3", title: "Customize", artist: "Rafflesia Online", cover: "Audio/covers/customize.jpg" },
  { src: "Audio/Eshop.mp3", title: "Eshop Theme", artist: "Kazumi Totaka", cover: "Audio/covers/Eshop.jpg" },
  { src: "Audio/Hip Shop.mp3", title: "Hip Shop", artist: "Toby Fox", cover: "Audio/covers/hipshop.jpg" },
  { src: "Audio/Takeshi Abo.mp3", title: "Takeshi Abo", artist: "Steins;Gate", cover: "Audio/covers/takeshi.jpg" },
  { src: "Audio/yume 2kki.mp3", title: "Yume 2kki Theme", artist: "Fan OST", cover: "Audio/covers/yume.jpg" }
];

let currentTrackIndex = Math.floor(Math.random() * playlist.length);
const music = new Audio();
music.volume = 0.4;

const titleEl = document.getElementById("music-title");
const artistEl = document.getElementById("music-artist");
const coverEl = document.getElementById("music-cover");
const toggleBtn = document.getElementById("music-toggle");
const skipBtn = document.getElementById("music-skip");
const progressEl = document.getElementById("music-progress");
const currentEl = document.getElementById("music-current");
const durationEl = document.getElementById("music-duration");

function loadTrack(i) {
  const track = playlist[i];
  if (!track) return;
  music.src = track.src;
  if(titleEl) titleEl.textContent = track.title;
  if(artistEl) artistEl.textContent = track.artist;
  if(coverEl) coverEl.src = track.cover;
  music.load();
}

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    if (!music.src) loadTrack(currentTrackIndex);
    if (music.paused) {
      music.play().catch(err => console.log("Erreur play:", err));
      toggleBtn.textContent = "⏸";
    } else {
      music.pause();
      toggleBtn.textContent = "▶";
    }
  });
}

if (skipBtn) {
  skipBtn.addEventListener("click", () => {
    let next;
    do {
      next = Math.floor(Math.random() * playlist.length);
    } while (next === currentTrackIndex);
    currentTrackIndex = next;
    loadTrack(currentTrackIndex);
    music.play().catch(e => {});
  });
}

music.addEventListener("timeupdate", () => {
  if (!isNaN(music.duration) && progressEl) {
    progressEl.value = (music.currentTime / music.duration) * 100;
    const m = Math.floor(music.currentTime / 60);
    const s = Math.floor(music.currentTime % 60).toString().padStart(2, "0");
    if(currentEl) currentEl.textContent = `${m}:${s}`;
  }
});

music.addEventListener("loadedmetadata", () => {
  if(durationEl) {
    const m = Math.floor(music.duration / 60);
    const s = Math.floor(music.duration % 60).toString().padStart(2, "0");
    durationEl.textContent = `${m}:${s}`;
  }
});

if (progressEl) {
  progressEl.addEventListener("input", () => {
    if (music.duration) {
      music.currentTime = (progressEl.value / 100) * music.duration;
    }
  });
}

music.addEventListener("ended", () => {
  if (skipBtn) skipBtn.click();
});

const initialTrack = playlist[currentTrackIndex];
if(titleEl) titleEl.textContent = initialTrack.title;
if(artistEl) artistEl.textContent = initialTrack.artist;
if(coverEl) coverEl.src = initialTrack.cover;

document.addEventListener("click", () => {
  if (!music.src) {
    loadTrack(currentTrackIndex);
    music.play().then(() => {
        if(toggleBtn) toggleBtn.textContent = "⏸";
    }).catch(err => console.log("Lecture bloquée au démarrage"));
  }
}, { once: true });

// ---------------- Splash & Horloge ----------------
const splashes = ["Bienvenue sur mon site !", "Also try terraria !", "Notch is here ", " | VHS Style | ", "Easter Egg !"];
const splashText = document.getElementById("splash-text");
if(splashText) {
  setInterval(() => { splashText.textContent = splashes[Math.floor(Math.random() * splashes.length)]; }, 5000);
}

function updateClock() {
  const clock = document.getElementById("clock");
  const taskbarTime = document.getElementById("taskbar-time");
  const now = new Date();
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if(taskbarTime) taskbarTime.textContent = timeStr;
  if(clock) {
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    clock.textContent = `${h}:${m} ${ampm}`;
  }
}
setInterval(updateClock, 1000);
updateClock();

// ---------------- Mewo ----------------
const mewo = document.getElementById('mewo');
let mewoClicks = 0;
if(mewo) {
  const msg = document.createElement('div');
  msg.id = 'stop-message';
  msg.textContent = 'Stop 😾';
  document.body.appendChild(msg);
  mewo.addEventListener('click', () => {
    mewoClicks++;
    if(mewoClicks === 5) {
      msg.classList.add('show');
      setTimeout(() => { msg.classList.remove('show'); }, 3000);
      mewoClicks = 0;
    }
  });
}

// ---------------- Steam Profile Dynamique ----------------
const steamProxyEndpoints = [
  {
    name: 'codetabs',
    buildUrl: (url) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`,
    parse: (response) => response.text()
  },
  {
    name: 'allorigins-json',
    buildUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    parse: async (response) => {
      const data = await response.json();
      return data?.contents || '';
    }
  },
  {
    name: 'allorigins-raw',
    buildUrl: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    parse: (response) => response.text()
  },
  {
    name: 'jina-text',
    buildUrl: (url) => `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`,
    parse: (response) => response.text()
  }
];

async function fetchSteamText(url) {
  for (const endpoint of steamProxyEndpoints) {
    try {
      const response = await fetch(endpoint.buildUrl(url));
      if (!response.ok) continue;
      const text = await endpoint.parse(response);
      if (text) return text;
    } catch (error) {
      continue;
    }
  }
  throw new Error('Steam proxy error: no available endpoint');
}

const steamHoursMap = {};

async function loadSteamProfile() {
  const container = document.getElementById('steam-profile-container');
  if(!container) return;

  try {
    const profileXml = await fetchSteamText('https://steamcommunity.com/id/HYL1A/?xml=1');
    const hasXmlProfile = profileXml.includes('<profile>');

    let steamName = 'HYL1A';
    let avatarFull = '';
    let onlineState = 'offline';
    let stateMessage = 'Offline';
    let customURL = 'HYL1A';
    let summary = '';
    let recentGames = [];

    if (hasXmlProfile) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(profileXml, 'text/xml');

      steamName = xmlDoc.querySelector('steamID')?.textContent?.trim() || steamName;
      avatarFull = xmlDoc.querySelector('avatarFull')?.textContent?.trim() || avatarFull;
      onlineState = xmlDoc.querySelector('onlineState')?.textContent?.trim() || onlineState;
      stateMessage = xmlDoc.querySelector('stateMessage')?.textContent?.trim() || stateMessage;
      customURL = xmlDoc.querySelector('customURL')?.textContent?.trim() || customURL;
      summary = (xmlDoc.querySelector('summary')?.textContent || '').trim().replace(/<img[^>]*>/g, '[Emote]');

      recentGames = [...xmlDoc.querySelectorAll('mostPlayedGame')].map((game) => {
        const gameLink = game.querySelector('gameLink')?.textContent?.trim() || '';
        const appIdMatch = gameLink.match(/\/app\/(\d+)/);
        const appId = appIdMatch ? appIdMatch[1] : (game.querySelector('statsName')?.textContent?.trim() || '');
        const hours = game.querySelector('hoursOnRecord')?.textContent?.trim() || game.querySelector('hoursPlayed')?.textContent?.trim() || '0';
        if (appId) steamHoursMap[appId] = hours;
        return {
          name: game.querySelector('gameName')?.textContent?.trim() || 'Jeu inconnu',
          id: appId,
          hours,
          lastPlayed: 'Dernier jeu récent'
        };
      });
      recentGames = recentGames.slice(0, 3);
    } else {
      const profileHtml = await fetchSteamText('https://steamcommunity.com/id/HYL1A/');
      steamName = extractTextFromData(profileHtml, /Title:\s*Steam Community ::\s*(.+)/i) || steamName;
      avatarFull = extractTextFromData(profileHtml, /(https:\/\/avatars\.fastly\.steamstatic\.com\/[a-z0-9]+_full\.jpg)/i) || avatarFull;
      onlineState = /Currently\s+In-Game/i.test(profileHtml) ? 'in-game' : (/Currently\s+Online/i.test(profileHtml) ? 'online' : 'offline');
      stateMessage = onlineState === 'online' ? 'Online' : (onlineState === 'in-game' ? 'In-Game' : 'Offline');
      summary = extractTextFromData(profileHtml, /\n\s*([^\n!][^\n]{1,120})\n\s*This user has also played as:/m) || '';

      const recentSection = profileHtml.split('Recent Activity')[1] || profileHtml;
      const gameMatches = [...recentSection.matchAll(/\[!\[Image[^\]]*\]\(https:\/\/shared\.fastly\.steamstatic\.com\/store_item_assets\/steam\/apps\/(\d+)\/[^\)]+\)\]\(https:\/\/steamcommunity\.com\/app\/\1\)[\s\S]*?([0-9.]+)\s*hrs? on record[\s\S]*?last played on ([^\n]+)[\s\S]*?\[([^\]]+)\]\(https:\/\/steamcommunity\.com\/app\/\1\)/gi)].slice(0, 3);

      recentGames = gameMatches.map((match) => ({
        id: match[1],
        hours: match[2],
        lastPlayed: match[3],
        name: match[4]
      }));
    }

    const mostPlayedGames = recentGames;
    const gamesHTML = mostPlayedGames.length > 0
      ? `
        <div class="steam-recent">
          <div class="steam-recent-header">Tes 3 derniers jeux joués</div>
          <div class="steam-games-list">
            ${mostPlayedGames.map((game) => {
              const gameName = game.name || 'Jeu inconnu';
              const gameId = game.id || '';
              const hoursPlayed = game.hours || '0';
              const lastPlayed = game.lastPlayed || 'Dernier jeu récent';
              const gameLogo = gameId ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${gameId}/capsule_184x69.jpg` : '';
              return `
                <div class="steam-game-row">
                  <img src="${gameLogo}" alt="${gameName}">
                  <div class="steam-game-info">
                    <h4>${gameName}</h4>
                    <p>${hoursPlayed} h • ${lastPlayed}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `
      : '';

    const statusColor = onlineState === 'in-game' ? '#8bc53f' : (onlineState === 'online' ? '#57cbde' : '#898989');

    container.innerHTML = `
      <a href="https://steamcommunity.com/id/${customURL}" target="_blank" style="text-decoration: none;">
        <div class="steam-header">
          <div class="steam-avatar-frame" style="--frame-color: ${statusColor};">
            <img class="steam-avatar" src="${avatarFull}" alt="Avatar">
          </div>
          <div class="steam-info">
            <h3 class="steam-name">${steamName} <div class="steam-level">15</div></h3>
            <p class="steam-status" style="color: ${statusColor};">${stateMessage}</p>
            <p class="steam-summary">${summary}</p>
          </div>
        </div>
        ${gamesHTML}
      </a>
    `;

    document.querySelectorAll('[data-screenshot-appid]').forEach(el => {
      const appId = el.dataset.screenshotAppid;
      const hours = steamHoursMap[appId];
      if (hours) {
        const hoursEl = el.querySelector('.steam-widget-hours');
        if (hoursEl) hoursEl.textContent = `${hours} hrs on record`;
      }
    });

  } catch (err) {
    console.error("Erreur de chargement du profil steam", err);
    container.innerHTML = `<p style="text-align: center; color: red;">Impossible de charger le profil Steam.</p>`;
  }
}

function shuffleArray(items) {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

function extractTextFromData(content, regex) {
  const match = content.match(regex);
  if (!match) return '';
  return (match[1] ?? match[0]).trim();
}

async function loadSteamScreenshots() {
  const container = document.getElementById('steam-screens-carousel');
  if (!container) return;

  let SCREENSHOTS = [];
  try {
    const html = await fetchSteamText('https://steamcommunity.com/id/HYL1A/screenshots/');
    if (html) {
      const re = /<a[^>]+href="https?:\/\/steamcommunity\.com\/app\/(\d+)[^\"]*"[^>]*>[\s\S]*?<img[^>]+src="(https?:\/\/images\.steamusercontent\.com\/ugc\/[^"]+)"/gi;
      let m;
      while ((m = re.exec(html)) !== null) {
        SCREENSHOTS.push({ imageUrl: m[2], appId: m[1] });
      }
      if (SCREENSHOTS.length === 0) {
        const re2 = /src="(https?:\/\/images\.steamusercontent\.com\/ugc\/[^"]+)"/gi;
        while ((m = re2.exec(html)) !== null) {
          SCREENSHOTS.push({ imageUrl: m[1], appId: '' });
        }
      }
      SCREENSHOTS = SCREENSHOTS.filter((v, i, a) => a.findIndex(t => t.imageUrl === v.imageUrl) === i);
    }
  } catch (err) {
    console.warn('fetch screenshots page failed', err);
  }

  if (!SCREENSHOTS || SCREENSHOTS.length === 0) {
    SCREENSHOTS = [
      { imageUrl: 'https://images.steamusercontent.com/ugc/12775353884705252670/2B1467388F0D56096C24D9559F8054275F62DB09/?imw=1024&imh=576&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', appId: '489830' },
      { imageUrl: 'https://images.steamusercontent.com/ugc/12348868377412844883/56ED7637C5C6BF70EF95E08499487A98E6B694DB/?imw=1024&imh=576&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', appId: '738540' },
      { imageUrl: 'https://images.steamusercontent.com/ugc/17790159311212321501/85A703F7202332DBB0FDF4525C9E7CE61F613D84/?imw=1024&imh=576&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', appId: '105600' },
      { imageUrl: 'https://images.steamusercontent.com/ugc/17591555267636865810/C30203A4A34413D872B524D04A736A6374697E80/', appId: '105600' },
      { imageUrl: 'https://images.steamusercontent.com/ugc/16408460238887912738/7B50174FAC0CAE1EF2922A8B380D01F166EF7F2D/', appId: '105600' },
      { imageUrl: 'https://images.steamusercontent.com/ugc/11764647057685140998/3985A4D83185C54B524FDD559C9945650DC9B0A9/?imw=1024&imh=576&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', appId: '105600' },
      { imageUrl: 'https://images.steamusercontent.com/ugc/11856757013147496268/DD493C16ED735075BD8E2932B3D34698F83F5F54/?imw=1024&imh=576&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', appId: '105600' },
      { imageUrl: 'https://images.steamusercontent.com/ugc/285225308512797558/77BDA6CBCD9C2CAE10C016AA9B2C2298B1234DC7/?imw=1024&imh=578&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', appId: '730' },
      { imageUrl: 'https://images.steamusercontent.com/ugc/14881484567458879108/DCFF9F8D9599DCE0E8A6B9FFAB7EABFDD7B278BB/', appId: '570940' },
      { imageUrl: 'https://images.steamusercontent.com/ugc/13767293841724583588/C269672D4D7F474FD8976BE2FD5D050753F1EE74/', appId: '454650' },
      { imageUrl: 'https://images.steamusercontent.com/ugc/11517295069360302233/053C26808F024B26259CAA1030C874D4A3D6F3A7/?imw=1024&imh=576&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true', appId: '678950' },
      { imageUrl: 'https://images.steamusercontent.com/ugc/9933262511490330401/496748BF5F6BB3B511615A0E55F0463703C58504/', appId: '1113000' },
      { imageUrl: 'https://images.steamusercontent.com/ugc/10664285370805861188/CADA45424DBD2F8F1FBF514E780252BF84039947/', appId: '485510' },
      { imageUrl: 'https://images.steamusercontent.com/ugc/17573439688742997855/C0C682B7F134E72A18EAAA15BCF85D845D79D838/', appId: '637650' }
    ];
  }

  const GAME_NAMES = {
    '105600':  'Terraria',
    '489830':  'Skyrim Special Edition',
    '738540':  'Tales of Vesperia',
    '730':     'Counter-Strike 2',
    '570940':  'Dark Souls: Remastered',
    '454650':  'Dragon Ball Xenoverse 2',
    '678950':  'Dragon Ball FighterZ',
    '1113000': 'Persona 4 Golden',
    '485510':  'Nioh: Complete Edition',
    '637650':  'Final Fantasy XV',
  };

  container.innerHTML = `
    <div class="simple-steam-screen">
      <img id="simple-steam-image" src="${SCREENSHOTS[0].imageUrl}" alt="Screenshot">
      <div class="simple-steam-caption">
        <div class="simple-game-name" id="simple-game-name">${GAME_NAMES[SCREENSHOTS[0].appId] || 'Steam'}</div>
      </div>
    </div>
  `;

  const imgEl = container.querySelector('#simple-steam-image');
  const nameEl = container.querySelector('#simple-game-name');

  let current = 0;
  const show = (index) => {
    const shot = SCREENSHOTS[index];
    if (!shot) return;
    imgEl.src = shot.imageUrl;
    nameEl.textContent = GAME_NAMES[shot.appId] || 'Steam';
    current = index;
  };

  setInterval(() => {
    if (SCREENSHOTS.length <= 1) return;
    let next = Math.floor(Math.random() * SCREENSHOTS.length);
    while (next === current && SCREENSHOTS.length > 1) next = Math.floor(Math.random() * SCREENSHOTS.length);
    show(next);
  }, 6000);
}

document.addEventListener('DOMContentLoaded', () => {
  loadSteamProfile().catch(() => {}).then(() => {
    loadSteamScreenshots();
  });
});

// ═══════════════════════════════════════════════════════════════════
//  FIREBASE
// ═══════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const firebaseConfig = {
    apiKey: "AIzaSyA0Wk9axU7QwTKoIbxHX8YyiIJV0NDxA0Y",
    authDomain: "hyl1a-web.firebaseapp.com",
    projectId: "hyl1a-web",
    storageBucket: "hyl1a-web.firebasestorage.app",
    messagingSenderId: "1056027646874",
    appId: "1:1056027646874:web:1860a91881f74b0c1cb823",
    measurementId: "G-3PDM4DWKGH"
  };

  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getUserColor(name) {
    const seed = (name || 'Anonyme').toLowerCase();
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      hash |= 0;
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 70% 45%)`;
  }

  const chatMessages = document.getElementById('chat-messages');
  const chatPseudo = document.getElementById('chat-pseudo');
  const chatMessage = document.getElementById('chat-message');
  const chatSend = document.getElementById('chat-send');

  if (chatMessages) {
    db.collection('chat').orderBy('timestamp', 'asc').limitToLast(50).onSnapshot(snap => {
      chatMessages.innerHTML = '';
      snap.forEach(doc => {
        const d = doc.data();
        const t = d.timestamp ? d.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "...";
        const userName = d.pseudo || "Anonyme";
        const userColor = getUserColor(userName);
        chatMessages.innerHTML += `<div class="chat-message" style="border-left-color: ${userColor};"><strong style="color: ${userColor};">${escapeHtml(userName)}</strong> <small>${t}</small><p>${escapeHtml(d.message)}</p></div>`;
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  window.sendChatMessage = function() {
    const msg = chatMessage.value.trim();
    if (!msg) return;
    db.collection('chat').add({
      pseudo: chatPseudo.value.trim() || "Anonyme",
      message: msg,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => { chatMessage.value = ''; });
  }

  if (chatSend) chatSend.onclick = sendChatMessage;
  if (chatMessage) chatMessage.onkeypress = (e) => { if(e.key === 'Enter') sendChatMessage(); };

  const hofList = document.getElementById('halloffame-list');
  const hofPseudo = document.getElementById('hof-pseudo');
  const hofMessage = document.getElementById('hof-message');
  const hofSubmit = document.getElementById('hof-submit');

  db.collection('halloffame').orderBy('timestamp', 'desc').onSnapshot(snap => {
    if (hofList) hofList.innerHTML = '';
    const items = [];
    snap.forEach(doc => {
      const d = doc.data();
      if (hofList) {
        hofList.innerHTML += `<div class="hof-signature"><strong> ${escapeHtml(d.pseudo)}</strong><p>${escapeHtml(d.message)}</p></div>`;
      }
      items.push(`<strong>${escapeHtml(d.pseudo)}:</strong> ${escapeHtml(d.message)} `);
    });

    const oldTicker = document.querySelector('.hof-ticker');
    if (oldTicker) oldTicker.remove();
    if (items.length > 0) {
      const ticker = document.createElement('div');
      ticker.className = 'hof-ticker';
      ticker.innerHTML = `<div class="ticker-content">${items.map(i => `<span class="ticker-item">${i}</span>`).join('')}</div>`;
      document.body.appendChild(ticker);
    }
  });

  window.submitHof = function() {
    const p = hofPseudo.value.trim();
    const m = hofMessage.value.trim();
    if (!p || !m) return alert("Champs vides !");
    db.collection('halloffame').add({
      pseudo: p, message: m, timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      hofPseudo.value = ''; hofMessage.value = '';
      alert("Signé !");
    });
  }

  if (hofSubmit) hofSubmit.onclick = submitHof;
});

// ---------------- UI helpers ----------------
const OWNER_CODE = '375513';

function showToast(message, timeout = 4000) {
  let t = document.getElementById('toast');
  if (!t) return;
  t.textContent = message;
  t.style.display = 'block';
  t.style.opacity = '1';
  setTimeout(() => {
    t.style.transition = 'opacity 400ms ease';
    t.style.opacity = '0';
    setTimeout(() => { t.style.display = 'none'; t.style.transition = ''; }, 450);
  }, timeout);
}

function applyTheme(name) {
  document.documentElement.setAttribute('data-theme', name);
  localStorage.setItem('site_theme', name);
}

function loadTheme() {
  const t = localStorage.getItem('site_theme') || 'default';
  const sel = document.getElementById('theme-select');
  if (sel) sel.value = t;
  applyTheme(t);
}

function loadMood() {
  const mood = localStorage.getItem('site_mood') || '—';
  const moodEl = document.getElementById('mood-text');
  if (moodEl) moodEl.textContent = mood;
}

function initUI() {
  loadTheme();
  loadMood();

  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));

  const editBtn = document.getElementById('edit-mood');
  if (editBtn) editBtn.addEventListener('click', () => {
    const code = prompt('Code propriétaire:');
    if (code === OWNER_CODE) {
      const newMood = prompt('Nouveau mood:');
      if (newMood !== null) {
        localStorage.setItem('site_mood', newMood);
        loadMood();
        showToast('Mood mis à jour');
      }
    } else {
      alert('Code incorrect');
    }
  });

  const boot = document.getElementById('boot-overlay');
  const skip = document.getElementById('boot-skip');
  if (skip && boot) skip.addEventListener('click', () => boot.style.display = 'none');
  if (boot) setTimeout(() => { boot.style.display = 'none'; }, 1800);

  if (window.firebase && firebase.firestore) {
    try {
      const dbNotify = firebase.firestore();
      let lastId = localStorage.getItem('lastChatId') || null;
      dbNotify.collection('chat').orderBy('timestamp', 'desc').limit(1).onSnapshot(snap => {
        snap.forEach(doc => {
          if (doc && doc.id && doc.id !== lastId) {
            if (lastId) {
              const d = doc.data();
              showToast(`${d.pseudo || 'Anonyme'}: ${d.message}`);
            }
            lastId = doc.id;
            localStorage.setItem('lastChatId', lastId);
          }
        });
      });
    } catch (e) { console.warn('chat notify init failed', e); }
  }
  try { initMicroblog(); } catch (e) { console.error('initMicroblog error', e); }
}

document.addEventListener('DOMContentLoaded', () => {
  try { initUI(); } catch (e) { console.error('initUI error', e); }
});

// ---------------- Microblog ----------------
function initMicroblog() {
  const KEY = 'micro_posts_v1';
  const newBtn = document.getElementById('micro-new-btn');
  const refreshBtn = document.getElementById('micro-refresh');
  const form = document.getElementById('micro-new-form');
  const textarea = document.getElementById('micro-text');
  const submit = document.getElementById('micro-submit');
  const cancel = document.getElementById('micro-cancel');
  const postsContainer = document.getElementById('micro-posts');
  const authIndicator = document.getElementById('micro-auth-indicator');

  let ownerAuthed = sessionStorage.getItem('micro_owner_authed') === '1';

  function escapeHtmlLocal(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function loadPosts() {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return arr.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
    } catch (e) { return []; }
  }

  function savePosts(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); }

  function renderPosts() {
    const posts = loadPosts();
    if (!posts || posts.length === 0) {
      postsContainer.innerHTML = '<div class="micro-empty">Aucun post pour le moment.</div>';
      return;
    }
    postsContainer.innerHTML = '';
    posts.forEach(p => {
      const el = document.createElement('div'); el.className = 'micro-post';
      const header = document.createElement('div'); header.className = 'micro-post-header';
      const author = document.createElement('div'); author.className = 'micro-post-author'; author.textContent = p.author || 'Hyl1a';
      const time = document.createElement('div'); time.className = 'micro-post-time';
      const d = new Date(p.createdAt);
      time.textContent = d.toLocaleString();
      header.appendChild(author); header.appendChild(time);
      el.appendChild(header);
      const content = document.createElement('div'); content.className = 'micro-post-content'; content.innerHTML = escapeHtmlLocal(p.text);
      el.appendChild(content);

      if (ownerAuthed) {
        const ctl = document.createElement('div'); ctl.style.marginTop = '8px';
        const del = document.createElement('button'); del.className = 'btn small'; del.textContent = 'Supprimer';
        del.addEventListener('click', () => {
          if (!confirm('Supprimer ce post ?')) return;
          const remaining = loadPosts().filter(x => x.id !== p.id);
          savePosts(remaining);
          renderPosts();
          showToast('Post supprimé');
        });
        ctl.appendChild(del);
        el.appendChild(ctl);
      }

      postsContainer.appendChild(el);
    });
  }

  function ensureAuth(promptIfNeeded = true) {
    if (ownerAuthed) return true;
    if (!promptIfNeeded) return false;
    const code = prompt('Code propriétaire:');
    if (code === OWNER_CODE) {
      ownerAuthed = true; sessionStorage.setItem('micro_owner_authed','1');
      if (authIndicator) authIndicator.textContent = 'Mode: auteur';
      showToast('Authentifié en tant que propriétaire');
      return true;
    }
    alert('Code incorrect');
    return false;
  }

  if (authIndicator) authIndicator.textContent = ownerAuthed ? 'Mode: auteur' : 'Mode: lecture';

  if (newBtn) newBtn.addEventListener('click', () => {
    if (!ensureAuth(true)) return;
    form.style.display = form.style.display === 'none' ? '' : 'none';
    textarea.focus();
  });

  if (refreshBtn) refreshBtn.addEventListener('click', renderPosts);
  if (cancel) cancel.addEventListener('click', () => { form.style.display = 'none'; textarea.value = ''; });

  if (submit) submit.addEventListener('click', () => {
    if (!ensureAuth(true)) return;
    const text = (textarea.value || '').trim();
    if (!text) return alert('Le post est vide');
    const posts = loadPosts();
    const post = { id: String(Date.now()), text: text, createdAt: new Date().toISOString(), author: 'Hyl1a' };
    posts.unshift(post);
    savePosts(posts);
    textarea.value = '';
    form.style.display = 'none';
    renderPosts();
    showToast('Post publié');
  });

  renderPosts();
}

// ---------------- Taskbar navigation handlers ----------------
function initTaskbarNav() {
  document.querySelectorAll('.taskbar-window').forEach(btn => {
    const target = btn.dataset.target;
    if (!target) return;
    const click = () => {
      const win = document.getElementById(target);
      if (!win) return;
      const visible = getComputedStyle(win).display !== 'none';
      if (visible) {
        animateWindowToIcon(win, btn).then(() => {
          win.style.display = 'none';
          btn.classList.remove('active');
        }).catch(() => {
          win.style.display = 'none'; btn.classList.remove('active');
        });
      } else {
        win.style.display = '';
        win.style.zIndex = bumpZ();
        animateWindowFromIcon(win, btn).then(() => {}).catch(() => {});
        document.querySelectorAll('.taskbar-window').forEach(w => w.classList.remove('active'));
        btn.classList.add('active');
      }
    };
    btn.addEventListener('click', click);
    btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') click(); });
  });
}

document.addEventListener('DOMContentLoaded', () => { initTaskbarNav(); });

// --- Ajouter les resize handles à toutes les fenêtres au chargement ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.window').forEach(win => {
    addResizeHandles(win);
    win.querySelectorAll('.resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', e => startResize(e, win, handle.dataset.dir));
    });
  });
});

// ---------------- Window <-> Icon animation helpers ----------------
function getCenter(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function animateWindowFromIcon(win, btn) {
  return new Promise((resolve, reject) => {
    try {
      win.style.display = '';
      win.style.visibility = 'hidden';
      win.style.opacity = '0';
      win.style.transform = 'none';

      const winRect = win.getBoundingClientRect();
      const iconRect = btn.getBoundingClientRect();
      const winCenter = getCenter(winRect);
      const iconCenter = getCenter(iconRect);
      const dx = iconCenter.x - winCenter.x;
      const dy = iconCenter.y - winCenter.y;

      win.style.transition = 'none';
      win.style.transform = `translate(${dx}px, ${dy}px) scale(0.72)`;
      win.style.opacity = '0';
      win.style.visibility = 'visible';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          win.style.transition = 'transform 320ms cubic-bezier(.2,.9,.3,1), opacity 220ms ease';
          win.style.transform = 'none';
          win.style.opacity = '1';
        });
      });

      const onEnd = (e) => {
        if (e && e.propertyName && e.propertyName !== 'transform') return;
        win.removeEventListener('transitionend', onEnd);
        win.style.transition = '';
        win.style.transform = '';
        resolve();
      };
      win.addEventListener('transitionend', onEnd);
    } catch (err) { reject(err); }
  });
}

function animateWindowToIcon(win, btn) {
  return new Promise((resolve, reject) => {
    try {
      const winRect = win.getBoundingClientRect();
      const iconRect = btn.getBoundingClientRect();
      const winCenter = getCenter(winRect);
      const iconCenter = getCenter(iconRect);
      const dx = iconCenter.x - winCenter.x;
      const dy = iconCenter.y - winCenter.y;

      win.style.transition = 'transform 280ms cubic-bezier(.2,.9,.3,1), opacity 220ms ease';
      requestAnimationFrame(() => {
        win.style.transform = `translate(${dx}px, ${dy}px) scale(0.6)`;
        win.style.opacity = '0';
      });

      const onEnd = (e) => {
        if (e && e.propertyName && e.propertyName !== 'transform') return;
        win.removeEventListener('transitionend', onEnd);
        win.style.transition = '';
        win.style.transform = '';
        win.style.opacity = '';
        resolve();
      };
      win.addEventListener('transitionend', onEnd);
    } catch (err) { reject(err); }
  });
}

// ================================================================
// ---------------- ÉLÉMENTS LIBRES DU DESKTOP ----------------
// (title img, minecraft splash, gif omori) — drag sur le desktop
// ================================================================

function makeDesktopElementDraggable(el) {
  if (!el) return;
  let dragging = false, offX = 0, offY = 0;

  el.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const scale = getCurrentScale();
    dragging = true;
    el.classList.add('dragging');
    offX = e.clientX / scale - el.offsetLeft;
    offY = e.clientY / scale - el.offsetTop;
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const scale = getCurrentScale();
    const x = e.clientX / scale - offX;
    const y = e.clientY / scale - offY;
    el.style.left = Math.round(x) + 'px';
    el.style.top  = Math.round(y) + 'px';
    // Remove transform so position is purely left/top
    if (el.style.transform && el.id !== 'minecraft-title') el.style.transform = 'none';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('dragging');
    document.body.style.userSelect = '';
    saveDesktopElementPositions();
  });
}

function saveDesktopElementPositions() {
  const data = {};
  ['site-title-img', 'minecraft-title', 'mewo'].forEach(id => {
    const el = document.getElementById(id) || document.querySelector(`.gif-container2`);
    const target = id === 'mewo' ? document.querySelector('.gif-container2') : document.getElementById(id);
    if (!target) return;
    const key = id === 'mewo' ? 'gif-container2' : id;
    data[key] = { left: parseInt(target.style.left) || target.offsetLeft, top: parseInt(target.style.top) || target.offsetTop };
    if (id === 'site-title-img') data[key].width = parseInt(target.style.width) || target.offsetWidth;
  });
  localStorage.setItem('desktop_elements_v1', JSON.stringify(data));
}

function loadDesktopElementPositions() {
  try {
    const raw = localStorage.getItem('desktop_elements_v1');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data['site-title-img']) {
      const el = document.getElementById('site-title-img');
      if (el) {
        if (data['site-title-img'].left != null) el.style.left = data['site-title-img'].left + 'px';
        if (data['site-title-img'].top  != null) el.style.top  = data['site-title-img'].top  + 'px';
        if (data['site-title-img'].width) el.style.width = data['site-title-img'].width + 'px';
        el.style.transform = 'none';
      }
    }
    if (data['minecraft-title']) {
      const el = document.getElementById('minecraft-title');
      if (el) {
        if (data['minecraft-title'].left != null) el.style.left = data['minecraft-title'].left + 'px';
        if (data['minecraft-title'].top  != null) el.style.top  = data['minecraft-title'].top  + 'px';
      }
    }
    if (data['gif-container2']) {
      const el = document.querySelector('.gif-container2');
      if (el) {
        if (data['gif-container2'].left != null) el.style.left = data['gif-container2'].left + 'px';
        if (data['gif-container2'].top  != null) el.style.top  = data['gif-container2'].top  + 'px';
      }
    }
  } catch (e) { console.warn('loadDesktopElementPositions error', e); }
}

document.addEventListener('DOMContentLoaded', () => {
  makeDesktopElementDraggable(document.getElementById('site-title-img'));
  makeDesktopElementDraggable(document.getElementById('minecraft-title'));
  makeDesktopElementDraggable(document.querySelector('.gif-container2'));
  loadDesktopElementPositions();
});

// ================================================================
// ---------------- PANNEAU ADMIN DÉPLAÇABLE ----------------
// ================================================================
function makeAdminPanelDraggable(panel) {
  const handle = panel.querySelector('#admin-panel-title');
  if (!handle) return;
  let dragging = false, offX = 0, offY = 0;

  handle.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    dragging = true;
    handle.classList.add('dragging');
    offX = e.clientX - panel.getBoundingClientRect().left;
    offY = e.clientY - panel.getBoundingClientRect().top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const x = e.clientX - offX;
    const y = e.clientY - offY;
    panel.style.right = 'auto';
    panel.style.left = Math.max(0, Math.min(x, window.innerWidth - panel.offsetWidth)) + 'px';
    panel.style.top  = Math.max(0, Math.min(y, window.innerHeight - panel.offsetHeight)) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('dragging');
  });
}
// ================================================================
// Activer : Ctrl+Shift+A  |  Mot de passe demandé une fois
// Désactiver : Ctrl+Shift+A ou bouton "🔒 Lock & Save"
// Nouvelles fonctionnalités :
//   - Resize fenêtres (bords + coins)
//   - Éditeur titre du site, splash text, gif omori
//   - Contrôle taille interne (width/height) par fenêtre
// ================================================================

const ADMIN_CODE = '375513';
const LAYOUT_DOC = 'layout/windows'; // chemin Firestore

let adminMode = false;
let adminPanel = null;
let adminDrag = { win: null, offsetX: 0, offsetY: 0 };

// --- Récupérer l'instance Firestore ---
function getDB() {
  if (window.firebase && firebase.apps.length) return firebase.firestore();
  return null;
}

// --- Appliquer un layout ---
function applyLayout(layout) {
  Object.entries(layout).forEach(([id, pos]) => {
    const win = document.getElementById(id);
    if (!win) return;
    if (pos.left   != null) win.style.left   = pos.left   + 'px';
    if (pos.top    != null) win.style.top    = pos.top    + 'px';
    if (pos.width  != null) win.style.width  = pos.width  + 'px';
    if (pos.height != null) win.style.height = pos.height + 'px';
  });
}

// --- Charger le layout au démarrage ---
function loadSavedLayout() {
  const db = getDB();
  if (!db) return;
  db.doc(LAYOUT_DOC).get().then(doc => {
    if (doc.exists) applyLayout(doc.data());
  }).catch(e => console.warn('Layout load failed:', e));
}

// --- Sauvegarder ---
function saveLayout() {
  const db = getDB();
  if (!db) { showToast('❌ Firebase non disponible'); return; }
  const layout = {};
  document.querySelectorAll('.window').forEach(win => {
    if (!win.id) return;
    layout[win.id] = {
      left:   parseInt(win.style.left)   || win.offsetLeft,
      top:    parseInt(win.style.top)    || win.offsetTop,
      width:  parseInt(win.style.width)  || win.offsetWidth,
      height: parseInt(win.style.height) || win.offsetHeight,
    };
  });
  db.doc(LAYOUT_DOC).set(layout).then(() => {
    showToast('✅ Layout sauvegardé sur tous tes appareils !');
  }).catch(e => showToast('❌ Erreur sauvegarde : ' + e.message));
}

// --- Reset ---
function resetLayout() {
  if (!confirm('Remettre les positions par défaut ?')) return;
  const db = getDB();
  if (db) db.doc(LAYOUT_DOC).delete().catch(() => {});
  document.querySelectorAll('.window').forEach(win => {
    win.style.left = ''; win.style.top  = '';
    win.style.width = ''; win.style.height = '';
  });
  showToast('↩️ Positions réinitialisées');
}

// ================================================================
// RESIZE HANDLES
// ================================================================
const DIRS = ['n','s','e','w','ne','nw','se','sw'];

function addResizeHandles(win) {
  if (win.querySelector('.resize-handle')) return; // already added
  DIRS.forEach(dir => {
    const h = document.createElement('div');
    h.className = `resize-handle ${dir}`;
    h.dataset.dir = dir;
    win.appendChild(h);
  });
}

function removeResizeHandles(win) {
  win.querySelectorAll('.resize-handle').forEach(h => h.remove());
}

let activeResize = null;

function startResize(e, win, dir) {
  e.preventDefault();
  e.stopPropagation();
  const scale = getCurrentScale();
  const startX = e.clientX / scale;
  const startY = e.clientY / scale;
  const startLeft = win.offsetLeft;
  const startTop  = win.offsetTop;
  const startW    = win.offsetWidth;
  const startH    = win.offsetHeight;
  const MIN_W = 180, MIN_H = 80;

  activeResize = { win, dir, startX, startY, startLeft, startTop, startW, startH, MIN_W, MIN_H };
  win.querySelector(`.resize-handle.${dir}`)?.classList.add('resizing');
  document.body.style.userSelect = 'none';
}

document.addEventListener('mousemove', e => {
  if (!activeResize) return;
  const { win, dir, startX, startY, startLeft, startTop, startW, startH, MIN_W, MIN_H } = activeResize;
  const scale = getCurrentScale();
  const dx = e.clientX / scale - startX;
  const dy = e.clientY / scale - startY;

  let newLeft = startLeft, newTop = startTop, newW = startW, newH = startH;

  if (dir.includes('e')) newW = Math.max(MIN_W, startW + dx);
  if (dir.includes('s')) newH = Math.max(MIN_H, startH + dy);
  if (dir.includes('w')) { newW = Math.max(MIN_W, startW - dx); newLeft = startLeft + startW - newW; }
  if (dir.includes('n')) { newH = Math.max(MIN_H, startH - dy); newTop  = startTop  + startH - newH; }

  win.style.width  = Math.round(newW)    + 'px';
  win.style.height = Math.round(newH)    + 'px';
  win.style.left   = Math.round(newLeft) + 'px';
  win.style.top    = Math.round(newTop)  + 'px';

  // Mettre à jour le badge coords si en mode admin
  const badge = win.querySelector('.admin-coords-badge');
  if (badge) badge.textContent = `${Math.round(newLeft)}, ${Math.round(newTop)} | ${Math.round(newW)}×${Math.round(newH)}`;

  // Mettre à jour les champs dans le panneau admin si fenêtre sélectionnée
  if (adminMode) updateAdminSizeInputs(win);
});

document.addEventListener('mouseup', () => {
  if (activeResize) {
    const h = activeResize.win.querySelector(`.resize-handle.${activeResize.dir}`);
    if (h) h.classList.remove('resizing');
    activeResize = null;
    document.body.style.userSelect = '';
  }
});

// ================================================================
// PANNEAU ADMIN ÉTENDU
// ================================================================

function updateAdminSizeInputs(win) {
  const wIn = document.getElementById('admin-win-width');
  const hIn = document.getElementById('admin-win-height');
  const xIn = document.getElementById('admin-win-x');
  const yIn = document.getElementById('admin-win-y');
  if (wIn) wIn.value = Math.round(win.offsetWidth);
  if (hIn) hIn.value = Math.round(win.offsetHeight);
  if (xIn) xIn.value = Math.round(win.offsetLeft);
  if (yIn) yIn.value = Math.round(win.offsetTop);
}

let adminSelectedWin = null;

function createAdminPanel() {
  const panel = document.createElement('div');
  panel.id = 'admin-panel';

  // Build window list options
  const winOpts = [...document.querySelectorAll('.window')]
    .filter(w => w.id)
    .map(w => {
      const label = w.querySelector('.title-label')?.textContent?.trim() || w.id;
      return `<option value="${w.id}">${w.id} — ${label}</option>`;
    }).join('');

  panel.innerHTML = `
    <div id="admin-panel-title">⚙️ Admin Complet</div>

    <div class="admin-section-title">📐 Fenêtre sélectionnée</div>
    <select id="admin-win-select" style="width:100%;margin-bottom:6px;padding:4px;border-radius:5px;border:1px solid #5ea6e6;background:#0d1a2d;color:#e0f0ff;font-family:monospace;font-size:12px;">
      <option value="">— choisir —</option>
      ${winOpts}
    </select>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:6px;">
      <div><label style="font-size:11px;color:#7ae6ff">X (left)</label><br><input id="admin-win-x" type="number" style="width:100%;padding:3px 5px;border-radius:4px;border:1px solid #5ea6e6;background:#0d1a2d;color:#e0f0ff;font-family:monospace;font-size:12px;" placeholder="px"></div>
      <div><label style="font-size:11px;color:#7ae6ff">Y (top)</label><br><input id="admin-win-y" type="number" style="width:100%;padding:3px 5px;border-radius:4px;border:1px solid #5ea6e6;background:#0d1a2d;color:#e0f0ff;font-family:monospace;font-size:12px;" placeholder="px"></div>
      <div><label style="font-size:11px;color:#7ae6ff">Largeur</label><br><input id="admin-win-width" type="number" style="width:100%;padding:3px 5px;border-radius:4px;border:1px solid #5ea6e6;background:#0d1a2d;color:#e0f0ff;font-family:monospace;font-size:12px;" placeholder="px"></div>
      <div><label style="font-size:11px;color:#7ae6ff">Hauteur</label><br><input id="admin-win-height" type="number" style="width:100%;padding:3px 5px;border-radius:4px;border:1px solid #5ea6e6;background:#0d1a2d;color:#e0f0ff;font-family:monospace;font-size:12px;" placeholder="px"></div>
    </div>
    <button id="admin-apply-size">✅ Appliquer taille</button>

    <div class="admin-section-title" style="margin-top:10px;">✏️ Textes du site</div>
    <label style="font-size:11px;color:#7ae6ff">Titre (balise &lt;title&gt;)</label>
    <input id="admin-site-title" type="text" value="${document.title}" style="width:100%;margin-bottom:5px;padding:3px 5px;border-radius:4px;border:1px solid #5ea6e6;background:#0d1a2d;color:#e0f0ff;font-family:monospace;font-size:12px;">
    <label style="font-size:11px;color:#7ae6ff">Splash text</label>
    <input id="admin-splash-input" type="text" value="${document.getElementById('splash-text')?.textContent || ''}" style="width:100%;margin-bottom:5px;padding:3px 5px;border-radius:4px;border:1px solid #5ea6e6;background:#0d1a2d;color:#e0f0ff;font-family:monospace;font-size:12px;">
    <label style="font-size:11px;color:#7ae6ff">URL du GIF (Omori/Mewo)</label>
    <input id="admin-gif-url" type="text" value="${document.getElementById('mewo')?.src || ''}" style="width:100%;margin-bottom:5px;padding:3px 5px;border-radius:4px;border:1px solid #5ea6e6;background:#0d1a2d;color:#e0f0ff;font-family:monospace;font-size:12px;">
    <label style="font-size:11px;color:#7ae6ff">Largeur du titre PNG (px)</label>
    <input id="admin-title-width" type="number" value="${parseInt(document.getElementById('site-title-img')?.style.width) || 400}" style="width:100%;margin-bottom:6px;padding:3px 5px;border-radius:4px;border:1px solid #5ea6e6;background:#0d1a2d;color:#e0f0ff;font-family:monospace;font-size:12px;" placeholder="ex: 400">
    <button id="admin-apply-texts">✅ Appliquer textes/gif</button>

    <div class="admin-section-title" style="margin-top:10px;">💾 Layout</div>
    <div id="admin-coords" style="margin-bottom:6px;">Survole une fenêtre</div>
    <button id="admin-save">🔒 Lock & Save (sync)</button>
    <button id="admin-reset">↩️ Reset positions</button>
    <button id="admin-exit">✖ Quitter admin</button>
  `;

  Object.assign(panel.style, {
    position: 'fixed',
    top: '60px',
    right: '16px',
    zIndex: '99999',
    background: 'rgba(10,18,32,0.98)',
    border: '1px solid #5ea6e6',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#e0f0ff',
    fontFamily: 'monospace',
    fontSize: '13px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.7)',
    width: '260px',
    maxHeight: 'calc(100vh - 80px)',
    overflowY: 'auto',
    userSelect: 'none',
  });

  // Inject section title style
  panel.querySelectorAll('.admin-section-title').forEach(el => {
    Object.assign(el.style, { fontSize:'12px', fontWeight:'bold', color:'#7ae6ff', borderBottom:'1px solid rgba(94,166,230,0.3)', paddingBottom:'4px', marginBottom:'6px', marginTop:'4px' });
  });

  document.body.appendChild(panel);

  // --- Win select ---
  const winSelect = panel.querySelector('#admin-win-select');
  winSelect.addEventListener('change', () => {
    const win = document.getElementById(winSelect.value);
    if (win) { adminSelectedWin = win; updateAdminSizeInputs(win); }
  });

  // --- Apply size ---
  panel.querySelector('#admin-apply-size').addEventListener('click', () => {
    const win = adminSelectedWin || document.getElementById(winSelect.value);
    if (!win) { showToast('⚠️ Sélectionne une fenêtre d\'abord'); return; }
    const x = parseInt(document.getElementById('admin-win-x').value);
    const y = parseInt(document.getElementById('admin-win-y').value);
    const w = parseInt(document.getElementById('admin-win-width').value);
    const h = parseInt(document.getElementById('admin-win-height').value);
    if (!isNaN(x)) win.style.left   = x + 'px';
    if (!isNaN(y)) win.style.top    = y + 'px';
    if (!isNaN(w) && w >= 80)  win.style.width  = w + 'px';
    if (!isNaN(h) && h >= 40)  win.style.height = h + 'px';
    showToast(`✅ ${win.id} mis à jour`);
  });

  // --- Apply texts ---
  panel.querySelector('#admin-apply-texts').addEventListener('click', () => {
    const newTitle = document.getElementById('admin-site-title').value.trim();
    const newSplash = document.getElementById('admin-splash-input').value.trim();
    const newGif = document.getElementById('admin-gif-url').value.trim();
    const newTitleWidth = parseInt(document.getElementById('admin-title-width')?.value);
    if (newTitle) document.title = newTitle;
    const splashEl = document.getElementById('splash-text');
    if (splashEl && newSplash) splashEl.textContent = newSplash;
    const mewoEl = document.getElementById('mewo');
    if (mewoEl && newGif) mewoEl.src = newGif;
    const titleImg = document.getElementById('site-title-img');
    if (titleImg && !isNaN(newTitleWidth) && newTitleWidth > 20) {
      titleImg.style.width = newTitleWidth + 'px';
      titleImg.style.transform = 'none';
    }
    saveDesktopElementPositions();
    showToast('✅ Textes / GIF mis à jour');
  });

  panel.querySelector('#admin-save').addEventListener('click', () => { saveLayout(); exitAdminMode(); });
  panel.querySelector('#admin-reset').addEventListener('click', resetLayout);
  panel.querySelector('#admin-exit').addEventListener('click', exitAdminMode);

  makeAdminPanelDraggable(panel);
  return panel;
}

// --- Overlays ---
function addAdminOverlays() {
  document.querySelectorAll('.window').forEach(win => {
    win.classList.add('admin-draggable');
    if (!win.querySelector('.admin-coords-badge')) {
      const coords = document.createElement('div');
      coords.className = 'admin-coords-badge';
      coords.textContent = `${win.offsetLeft}, ${win.offsetTop}`;
      win.appendChild(coords);
    }
    // Resize handles are already added at DOMContentLoaded — just highlight them
  });
}

function removeAdminOverlays() {
  document.querySelectorAll('.window').forEach(win => {
    win.classList.remove('admin-draggable');
    const badge = win.querySelector('.admin-coords-badge');
    if (badge) badge.remove();
    // Keep resize handles active (useful outside admin too)
  });
}

// --- Drag admin ---
function adminStartDrag(win, clientX, clientY) {
  const scale = getCurrentScale();
  adminDrag.win = win;
  adminDrag.offsetX = clientX / scale - win.offsetLeft;
  adminDrag.offsetY = clientY / scale - win.offsetTop;
  win.style.zIndex = 9000;
  adminSelectedWin = win;
  const sel = document.getElementById('admin-win-select');
  if (sel) sel.value = win.id;
  updateAdminSizeInputs(win);
}

document.addEventListener('mousemove', e => {
  if (!adminMode) return;
  const hovered = e.target.closest('.window');
  if (hovered && !adminDrag.win && !activeResize) {
    const badge = hovered.querySelector('.admin-coords-badge');
    const coordsEl = document.getElementById('admin-coords');
    const info = `${hovered.id} — ${hovered.offsetLeft}px, ${hovered.offsetTop}px`;
    if (badge) badge.textContent = `${hovered.offsetLeft}, ${hovered.offsetTop} | ${hovered.offsetWidth}×${hovered.offsetHeight}`;
    if (coordsEl) coordsEl.textContent = info;
  }
  if (!adminDrag.win) return;
  const scale = getCurrentScale();
  const x = e.clientX / scale - adminDrag.offsetX;
  const y = e.clientY / scale - adminDrag.offsetY;
  adminDrag.win.style.left = Math.max(0, Math.round(x)) + 'px';
  adminDrag.win.style.top  = Math.max(0, Math.round(y)) + 'px';
  const badge = adminDrag.win.querySelector('.admin-coords-badge');
  if (badge) badge.textContent = `${Math.round(x)}, ${Math.round(y)} | ${adminDrag.win.offsetWidth}×${adminDrag.win.offsetHeight}`;
  const coordsEl = document.getElementById('admin-coords');
  if (coordsEl) coordsEl.textContent = `${adminDrag.win.id} — ${Math.round(x)}px, ${Math.round(y)}px`;
  updateAdminSizeInputs(adminDrag.win);
});

document.addEventListener('mouseup', () => {
  if (adminDrag.win) adminDrag.win = null;
});

// --- Entrée / sortie ---
function enterAdminMode() {
  adminMode = true;
  adminPanel = createAdminPanel();
  addAdminOverlays();

  document.querySelectorAll('.window').forEach(win => {
    const title = win.querySelector('.title');
    if (!title) return;
    title._adminHandler = (e) => {
      if (!adminMode) return;
      // Don't intercept if clicking window buttons or resize handles
      if (e.target.closest('.window-buttons') || e.target.closest('.resize-handle')) return;
      e.stopImmediatePropagation();
      adminStartDrag(win, e.clientX, e.clientY);
    };
    title.addEventListener('mousedown', title._adminHandler, true);
  });

  showToast('⚙️ Mode admin activé — drag, resize, édite, puis Lock & Save');
}

function exitAdminMode() {
  adminMode = false;
  adminSelectedWin = null;
  if (adminPanel) { adminPanel.remove(); adminPanel = null; }
  removeAdminOverlays();
  document.querySelectorAll('.window').forEach(win => {
    const title = win.querySelector('.title');
    if (title && title._adminHandler) {
      title.removeEventListener('mousedown', title._adminHandler, true);
      delete title._adminHandler;
    }
  });
}

// --- Raccourci Ctrl+Shift+A ---
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    if (adminMode) {
      exitAdminMode();
    } else {
      const code = prompt('Code admin :');
      if (code === ADMIN_CODE) {
        enterAdminMode();
      } else if (code !== null) {
        showToast('❌ Code incorrect');
      }
    }
  }
});

// --- Charger le layout sauvegardé au boot ---
document.addEventListener('DOMContentLoaded', loadSavedLayout);
