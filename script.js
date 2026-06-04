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
        win.style.width = '100%';
        win.style.height = '100vh';
        win.dataset.maximized = 'true';
      }
    });
  }

  if (btnClose) {
    btnClose.addEventListener('click', () => { win.style.display = 'none'; });
  }
});

// ---------------- Déplacement des Fenêtres ----------------
let activeDrag = { win: null, offsetX: 0, offsetY: 0 };
// Keep windows below the taskbar (taskbar z-index = 2000 in CSS)
let highestZ = 1800;

function bumpZ() {
  // increment but cap below taskbar
  highestZ = Math.min(highestZ + 1, 1999);
  return highestZ;
}

document.querySelectorAll('.window').forEach(win => {
  const titleBar = win.querySelector('.title');
  if (getComputedStyle(win).position === 'static') win.style.position = 'absolute';

  const startDrag = (clientX, clientY) => {
    activeDrag.win = win;
    activeDrag.offsetX = clientX - win.offsetLeft;
    activeDrag.offsetY = clientY - win.offsetTop;
    win.style.zIndex = bumpZ();
    titleBar.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  titleBar.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY));
  titleBar.addEventListener('touchstart', e => {
    const t = e.touches[0];
    if (t) startDrag(t.clientX, t.clientY);
  }, { passive: false });
});

document.addEventListener('mousemove', e => {
  if (!activeDrag.win) return;
  const win = activeDrag.win;
  const x = e.clientX - activeDrag.offsetX;
  const y = e.clientY - activeDrag.offsetY;
  const vw = Math.max(window.innerWidth, document.documentElement.scrollWidth);
  const vh = Math.max(window.innerHeight, document.documentElement.scrollHeight, document.body.scrollHeight) + 900;
  const rect = win.getBoundingClientRect();
  const maxTop = Math.max(-rect.height + 40, vh - rect.height - 40);
  win.style.left = Math.min(Math.max(x, -rect.width + 40), vw - 40) + 'px';
  win.style.top = Math.min(Math.max(y, -rect.height + 40), maxTop) + 'px';
});

const stopDrag = () => {
  if (!activeDrag.win) return;
  activeDrag.win.querySelector('.title').style.cursor = 'grab';
  document.body.style.userSelect = '';
  activeDrag.win = null;
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
// On crée l'objet sans charger de source immédiatement pour éviter les erreurs
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

// Fonction de chargement sécurisée
function loadTrack(i) {
  const track = playlist[i];
  if (!track) return;
  
  music.src = track.src;
  if(titleEl) titleEl.textContent = track.title;
  if(artistEl) artistEl.textContent = track.artist;
  if(coverEl) coverEl.src = track.cover;
  
  music.load();
  // On ne fait play() que si c'est déclenché par un clic, 
  // sinon on attend que l'utilisateur appuie sur Play
}

// Play/Pause
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    // Si aucune musique n'est chargée, on charge la première
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

// Skip
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

// Mise à jour de la barre de progression
music.addEventListener("timeupdate", () => {
  if (!isNaN(music.duration) && progressEl) {
    progressEl.value = (music.currentTime / music.duration) * 100;
    const m = Math.floor(music.currentTime / 60);
    const s = Math.floor(music.currentTime % 60).toString().padStart(2, "0");
    if(currentEl) currentEl.textContent = `${m}:${s}`;
  }
});

// Affichage de la durée totale
music.addEventListener("loadedmetadata", () => {
  if(durationEl) {
    const m = Math.floor(music.duration / 60);
    const s = Math.floor(music.duration % 60).toString().padStart(2, "0");
    durationEl.textContent = `${m}:${s}`;
  }
});

// Interaction avec la barre de progression
if (progressEl) {
  progressEl.addEventListener("input", () => {
    if (music.duration) {
      music.currentTime = (progressEl.value / 100) * music.duration;
    }
  });
}

// Passage à la suivante automatique
music.addEventListener("ended", () => {
  if (skipBtn) skipBtn.click();
});

// AU DÉMARRAGE : On prépare juste l'affichage (sans lancer le son)
const initialTrack = playlist[currentTrackIndex];
if(titleEl) titleEl.textContent = initialTrack.title;
if(artistEl) artistEl.textContent = initialTrack.artist;
if(coverEl) coverEl.src = initialTrack.cover;

// On lance la musique uniquement au premier clic sur la page pour respecter les navigateurs
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
      if (!response.ok) {
        continue;
      }
      const text = await endpoint.parse(response);
      if (text) return text;
    } catch (error) {
      continue;
    }
  }
  throw new Error('Steam proxy error: no available endpoint');
}

// Partagé entre loadSteamProfile et loadSteamScreenshots
const steamHoursMap = {}; // appId (string) → hours (string)

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

    // Déterminer la couleur de statut et l'URL du profil complet
    const statusColor = onlineState === 'in-game' ? '#8bc53f' : (onlineState === 'online' ? '#57cbde' : '#898989');

    // Mettre à jour le HTML
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

    // Mettre à jour les widgets du carrousel de screenshots avec les vraies heures
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
  // Simpler behavior: show a single image element and shuffle it periodically
  // Try to fetch the user's Steam screenshots page and parse all screenshot URLs.
  let SCREENSHOTS = [];
  try {
    const html = await fetchSteamText('https://steamcommunity.com/id/HYL1A/screenshots/');
    if (html) {
      // Match patterns where an <a> links to /app/<id> and contains an <img src="...ugc...">
      const re = /<a[^>]+href="https?:\/\/steamcommunity\.com\/app\/(\d+)[^\"]*"[^>]*>[\s\S]*?<img[^>]+src="(https?:\/\/images\.steamusercontent\.com\/ugc\/[^"]+)"/gi;
      let m;
      while ((m = re.exec(html)) !== null) {
        SCREENSHOTS.push({ imageUrl: m[2], appId: m[1] });
      }

      // If none found with surrounding <a>, fallback to any ugc image src occurrences
      if (SCREENSHOTS.length === 0) {
        const re2 = /src="(https?:\/\/images\.steamusercontent\.com\/ugc\/[^"]+)"/gi;
        while ((m = re2.exec(html)) !== null) {
          SCREENSHOTS.push({ imageUrl: m[1], appId: '' });
        }
      }

      // dedupe
      SCREENSHOTS = SCREENSHOTS.filter((v, i, a) => a.findIndex(t => t.imageUrl === v.imageUrl) === i);
    }
  } catch (err) {
    console.warn('fetch screenshots page failed', err);
  }

  // fallback static list if parsing failed or returned nothing
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

  // render simple single-image layout
  container.innerHTML = `
    <div class="simple-steam-screen">
      <img id="simple-steam-image" src="${SCREENSHOTS[0].imageUrl}" alt="Screenshot">
      <div class="simple-steam-caption">
        <div class="simple-game-name" id="simple-game-name">${GAME_NAMES[SCREENSHOTS[0].appId] || 'Steam'}</div>
        <div class="simple-game-hours" id="simple-game-hours">${steamHoursMap[SCREENSHOTS[0].appId] || '— hrs on record'}</div>
      </div>
    </div>
  `;

  const imgEl = container.querySelector('#simple-steam-image');
  const nameEl = container.querySelector('#simple-game-name');
  const hoursEl = container.querySelector('#simple-game-hours');

  let current = 0;
  const show = (index) => {
    const shot = SCREENSHOTS[index];
    if (!shot) return;
    imgEl.src = shot.imageUrl;
    nameEl.textContent = GAME_NAMES[shot.appId] || 'Steam';
    const hours = steamHoursMap[shot.appId] || null;
    hoursEl.textContent = hours ? `${hours} hrs on record` : '— hrs on record';
    current = index;
  };

  // simple shuffle every 5-7s
  setInterval(() => {
    if (SCREENSHOTS.length <= 1) return;
    let next = Math.floor(Math.random() * SCREENSHOTS.length);
    while (next === current && SCREENSHOTS.length > 1) next = Math.floor(Math.random() * SCREENSHOTS.length);
    show(next);
  }, 6000);
}

// Lancer le chargement
document.addEventListener('DOMContentLoaded', () => {
  // s'assurer que le profil se charge d'abord (remplit steamHoursMap),
  // puis afficher les screenshots afin que les temps de jeu soient visibles.
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

  // --- CHAT ---
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

  // --- HALL OF FAME ---
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

    // Ticker
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

// ---------------- UI helpers: theme, mood, boot, toasts ----------------
const OWNER_CODE = '375513'; // change this to your secret owner code

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

  // Boot overlay
  const boot = document.getElementById('boot-overlay');
  const skip = document.getElementById('boot-skip');
  if (skip && boot) skip.addEventListener('click', () => boot.style.display = 'none');
  if (boot) setTimeout(() => { boot.style.display = 'none'; }, 1800);

  // Chat notifications: watch latest message id
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
  // initialize microblog UI
  try { initMicroblog(); } catch (e) { console.error('initMicroblog error', e); }
}

document.addEventListener('DOMContentLoaded', () => {
  try { initUI(); } catch (e) { console.error('initUI error', e); }
});

// ---------------- Microblog (local-only, owner posts only) ----------------
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
        // animate to icon then hide
        animateWindowToIcon(win, btn).then(() => {
          win.style.display = 'none';
          btn.classList.remove('active');
        }).catch(() => {
          win.style.display = 'none'; btn.classList.remove('active');
        });
      } else {
        // show and animate from icon
        // ensure it's displayed to measure
        win.style.display = '';
        win.style.zIndex = bumpZ();
        animateWindowFromIcon(win, btn).then(() => {
          // done
        }).catch(() => {});
        document.querySelectorAll('.taskbar-window').forEach(w => w.classList.remove('active'));
        btn.classList.add('active');
      }
    };
    btn.addEventListener('click', click);
    btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') click(); });
  });
}

document.addEventListener('DOMContentLoaded', () => { initTaskbarNav(); });

// ---------------- Window <-> Icon animation helpers ----------------
function getCenter(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function animateWindowFromIcon(win, btn) {
  return new Promise((resolve, reject) => {
    try {
      // prepare window invisible but rendered to measure
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

      // set starting transform at icon position
      win.style.transition = 'none';
      win.style.transform = `translate(${dx}px, ${dy}px) scale(0.72)`;
      win.style.opacity = '0';
      win.style.visibility = 'visible';

      // force reflow then animate to identity
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
      // animate towards icon and shrink
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