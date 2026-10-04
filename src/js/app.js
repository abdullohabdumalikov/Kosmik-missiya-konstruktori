// Astra Horizon - Main Application Coordinator
import { api } from './api.js';
import { sound } from './audio.js';
import { VehicleDesigner } from './designer.js';
import { FlightEngine } from './flight.js';
import { CraftingManager } from './crafting.js';
import { RecordsManager } from './records.js';
import { ProfileManager, AVATARS } from './profile.js';
import { FleetHangar } from './fleet.js';
import { MISSIONS, getMissionById } from './missions.js';
import { setLanguage, updateDOMTranslations } from './localization.js';

class AstraApp {
  constructor() {
    this.userData = {
      profile: {
        username: 'Director',
        agencyName: 'Astra Aerospace',
        avatar: 'avatar_astronaut',
        level: 1,
        funds: 2500,
        science: 25,
        tier: 1
      },
      rocket: {
        name: 'Aero-Scout I',
        noseId: 'nose_mini_point',
        upperStageId: 'stage_none',
        mainTankId: 'tank_mini_core',
        engineId: 'engine_spark_mini',
        boosterId: 'booster_none',
        supplementaryBooster: 'none',
        wingsId: 'fins_small',
        payloadId: 'payload_mini_beeper'
      },
      inventory: [],
      records: {
        highestAltitude: 0,
        longestFlight: 0,
        highestSpeed: 0,
        totalLaunches: 0,
        successfulLaunches: 0,
        failedLaunches: 0,
        mostCoinsEarned: 0,
        bestRocketName: 'Aero-Scout I'
      },
      completedMissions: [],
      activeMissionId: 'mission_suborbital_sounding',
      shopStock: []
    };

    this.currentView = 'designer';

    // Sub-controllers
    this.designer = new VehicleDesigner(this);
    this.flight = new FlightEngine(this);
    this.crafting = new CraftingManager(this);
    this.records = new RecordsManager(this);
    this.profile = new ProfileManager(this);
    this.fleetHangar = new FleetHangar(this);
  }

  async init() {
    let userPacket = await api.getMe();
    if (!userPacket) {
      try {
        userPacket = await api.guestLogin();
      } catch (err) {
        console.warn('Backend fallback or offline:', err);
      }
    }

    if (userPacket) {
      if (userPacket.profile) this.userData.profile = userPacket.profile;
      if (userPacket.rocket) this.userData.rocket = userPacket.rocket;
      if (userPacket.inventory) this.userData.inventory = userPacket.inventory;
      if (userPacket.records) this.userData.records = userPacket.records;
      if (userPacket.shopStock) this.userData.shopStock = userPacket.shopStock;
      if (userPacket.completedMissions) this.userData.completedMissions = userPacket.completedMissions;
      if (userPacket.activeMissionId) this.userData.activeMissionId = userPacket.activeMissionId;
    }

    const savedLang = localStorage.getItem('astra_lang') || this.userData.profile.settings?.language || 'en';
    setLanguage(savedLang);

    // Initialize submodules
    this.designer.init();
    this.flight.init();
    this.bindGlobalNavigation();
    this.bindAuthModals();
    this.updateHeaderMetrics();

    // Start on designer view
    this.switchView('designer');
  }

  bindGlobalNavigation() {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const viewId = btn.getAttribute('data-view');
        if (viewId) {
          sound.playClick();
          this.switchView(viewId);
        }
      });
    });

    const muteBtn = document.getElementById('btn-toggle-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = sound.toggleMute();
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
        sound.playClick();
      });
    }

    const authTrigger = document.getElementById('header-director-badge');
    if (authTrigger) {
      authTrigger.addEventListener('click', () => {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.style.display = 'flex';
      });
    }

    // Crafting filters
    document.querySelectorAll('.craft-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.craft-filter-btn').forEach(b => b.classList.remove('active-filter'));
        btn.classList.add('active-filter');
        const cat = btn.getAttribute('data-category');
        this.crafting.renderBlueprintBoard(cat);
        sound.playClick();
      });
    });
  }

  bindAuthModals() {
    const modal = document.getElementById('auth-modal');
    const closeBtn = document.getElementById('btn-close-auth');
    const switchReg = document.getElementById('btn-switch-to-register');
    const switchLogin = document.getElementById('btn-switch-to-login');
    const loginForm = document.getElementById('auth-login-form');
    const regForm = document.getElementById('auth-register-form');
    const loginView = document.getElementById('auth-login-view');
    const regView = document.getElementById('auth-register-view');

    if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');

    if (switchReg) {
      switchReg.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.style.display = 'none';
        regView.style.display = 'block';
      });
    }

    if (switchLogin) {
      switchLogin.addEventListener('click', (e) => {
        e.preventDefault();
        regView.style.display = 'none';
        loginView.style.display = 'block';
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('login-username').value;
        const p = document.getElementById('login-password').value;
        try {
          const res = await api.login(u, p);
          this.userData.profile = res.profile;
          this.userData.rocket = res.rocket;
          this.userData.inventory = res.inventory;
          this.userData.records = res.records;
          this.userData.shopStock = res.shopStock || [];
          modal.style.display = 'none';
          this.updateHeaderMetrics();
          this.designer.updateCategoryView();
          sound.playEquip();
          alert(`Welcome back, Director ${res.profile.username}!`);
        } catch (err) {
          alert('Login failed: ' + err.message);
        }
      });
    }

    if (regForm) {
      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('reg-username').value;
        const p = document.getElementById('reg-password').value;
        try {
          const res = await api.register(u, p);
          this.userData.profile = res.profile;
          this.userData.rocket = res.rocket;
          this.userData.inventory = res.inventory;
          this.userData.records = res.records;
          this.userData.shopStock = res.shopStock || [];
          modal.style.display = 'none';
          this.updateHeaderMetrics();
          this.designer.updateCategoryView();
          sound.playEquip();
          alert(`Commission granted! Welcome Director ${res.profile.username}!`);
        } catch (err) {
          alert('Registration failed: ' + err.message);
        }
      });
    }
  }

  switchView(viewName) {
    this.currentView = viewName;

    document.querySelectorAll('.app-view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-view') === viewName) {
        btn.classList.add('active-nav-tab');
      } else {
        btn.classList.remove('active-nav-tab');
      }
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.style.display = 'flex';

    const viewTitleEl = document.getElementById('header-view-title');

    if (viewName === 'designer') {
      if (viewTitleEl) viewTitleEl.textContent = 'Vehicle Designer';
      this.designer.updateCategoryView();
    } else if (viewName === 'missions') {
      if (viewTitleEl) viewTitleEl.textContent = 'Mission Control';
      this.renderMissionsView();
    } else if (viewName === 'crafting') {
      if (viewTitleEl) viewTitleEl.textContent = 'Blueprint Board';
      this.crafting.renderBlueprintBoard();
      this.crafting.renderWorkbench();
    } else if (viewName === 'flight') {
      if (viewTitleEl) viewTitleEl.textContent = 'Launch Complex';
      this.flight.resizeCanvas();
      this.flight.startFlight();
    } else if (viewName === 'records') {
      if (viewTitleEl) viewTitleEl.textContent = 'Agency Records';
      this.records.renderRecordsView();
    } else if (viewName === 'profile') {
      if (viewTitleEl) viewTitleEl.textContent = 'Director Dossier';
      this.profile.renderProfileView();
    } else if (viewName === 'settings') {
      if (viewTitleEl) viewTitleEl.textContent = 'Agency Settings';
      this.profile.renderSettingsView();
    }

    updateDOMTranslations();
  }

  getActiveMission() {
    return getMissionById(this.userData.activeMissionId);
  }

  renderMissionsView() {
    const container = document.getElementById('missions-list-container');
    if (!container) return;

    container.innerHTML = '';
    const activeId = this.userData.activeMissionId;
    const completed = this.userData.completedMissions || [];

    MISSIONS.forEach(mission => {
      const isActive = mission.id === activeId;
      const isCompleted = completed.includes(mission.id);

      const card = document.createElement('div');
      card.className = `p-4 rounded-xl border transition-all ${
        isActive
          ? 'bg-blue-950/80 border-blue-400 ring-2 ring-blue-400 shadow-xl'
          : isCompleted
            ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-300'
            : 'bg-slate-900/80 border-slate-700/70 hover:border-slate-500'
      }`;

      card.innerHTML = `
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">${mission.category}</span>
              ${isCompleted ? '<span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">COMPLETED</span>' : ''}
              ${isActive ? '<span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 border border-blue-400 animate-pulse">ACTIVE CONTRACT</span>' : ''}
            </div>
            <h3 class="text-base font-bold text-white mt-0.5">${mission.title}</h3>
            <p class="text-xs text-slate-400 mt-0.5 max-w-xl">${mission.desc}</p>
          </div>

          <div class="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-5 w-full md:w-auto justify-between md:justify-end">
            <div class="text-right">
              <div class="text-[10px] text-slate-400">Target Altitude</div>
              <div class="text-xs font-bold font-mono text-cyan-300">${mission.requiredAltitude.toLocaleString()} m</div>
              <div class="text-[10px] text-amber-400 font-mono mt-0.5">+${mission.rewardFunds}K Funds · +${mission.rewardScience} Science</div>
            </div>

            <button class="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
              isActive
                ? 'bg-blue-600/30 text-blue-300 border border-blue-400 cursor-default'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30'
            }">
              ${isActive ? 'ACTIVE' : 'ACCEPT'}
            </button>
          </div>
        </div>
      `;

      card.querySelector('button').addEventListener('click', async () => {
        if (!isActive) {
          this.userData.activeMissionId = mission.id;
          await api.selectMission(mission.id);
          sound.playEquip();
          this.renderMissionsView();
        }
      });

      container.appendChild(card);
    });
  }

  updateHeaderMetrics() {
    const prof = this.userData.profile || {};
    const fundsEl = document.getElementById('header-funds-val');
    const scienceEl = document.getElementById('header-science-val');
    const tierEl = document.getElementById('header-tier-val');
    const avatarEl = document.getElementById('header-avatar-icon');
    const usernameEl = document.getElementById('header-username-text');

    if (fundsEl) fundsEl.textContent = `${(prof.funds || 0).toLocaleString()}K`;
    if (scienceEl) scienceEl.textContent = `${prof.science || 0}`;
    if (tierEl) tierEl.textContent = `Tier ${prof.tier || 1}`;
    if (usernameEl) usernameEl.textContent = prof.username || 'Director';

    const av = AVATARS.find(a => a.id === prof.avatar) || AVATARS[0];
    if (avatarEl) avatarEl.textContent = av.icon;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new AstraApp();
  window.astraApp = app;
  app.init();
});
