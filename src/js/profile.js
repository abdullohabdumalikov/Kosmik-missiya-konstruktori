// Profile, Dossier, and Operations Settings Controller
import { sound } from './audio.js';
import { api } from './api.js';
import { setLanguage, getLanguage } from './localization.js';

export const AVATARS = [
  { id: 'avatar_astronaut', icon: '🧑‍🚀', name: 'Commander' },
  { id: 'avatar_flight_director', icon: '👨‍💼', name: 'Flight Director' },
  { id: 'avatar_engineer', icon: '👩‍🔬', name: 'Chief Engineer' },
  { id: 'avatar_pioneer', icon: '🚀', name: 'Deep Space Pioneer' },
  { id: 'avatar_pilot', icon: '🎖️', name: 'Test Pilot' }
];

export class ProfileManager {
  constructor(app) {
    this.app = app;
  }

  renderProfileView() {
    const container = document.getElementById('profile-container');
    if (!container) return;

    const profile = this.app.userData.profile || {};
    const records = this.app.userData.records || {};
    const currentAvatar = AVATARS.find(a => a.id === profile.avatar) || AVATARS[0];

    const successRate = records.totalLaunches > 0
      ? Math.round((records.successfulLaunches / records.totalLaunches) * 100)
      : 0;

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-8">
        
        <!-- Director Card -->
        <div class="p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/60 to-slate-950 border border-blue-500/30 shadow-2xl flex flex-col sm:flex-row items-center gap-6">
          <div class="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-amber-400/80 flex items-center justify-center text-5xl shadow-xl">
            ${currentAvatar.icon}
          </div>
          <div class="flex-1 text-center sm:text-left">
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h2 class="text-2xl font-extrabold text-white tracking-tight">${profile.username}</h2>
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/40">
                CLEARANCE LEVEL ${profile.level || 1}
              </span>
            </div>
            <p class="text-sm text-cyan-300 font-mono mt-1">${profile.agencyName || 'Aerospace Corp'}</p>
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-6 mt-4 text-xs font-mono text-slate-300">
              <div><span class="text-slate-500">Funds:</span> <span class="text-amber-400 font-bold">${(profile.funds || 0).toLocaleString()}K</span></div>
              <div><span class="text-slate-500">Science:</span> <span class="text-cyan-400 font-bold">${profile.science || 0}</span></div>
              <div><span class="text-slate-500">Peak Alt:</span> <span class="text-emerald-400 font-bold">${(records.highestAltitude || 0).toLocaleString()} m</span></div>
            </div>
          </div>
        </div>

        <!-- Avatar Selection -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Choose Director Insignia</h3>
          <div class="grid grid-cols-5 gap-3">
            ${AVATARS.map(av => `
              <button data-avatar="${av.id}" class="avatar-select-btn p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                profile.avatar === av.id
                  ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-400'
                  : 'border-slate-800 hover:border-slate-600 bg-slate-950/40'
              }">
                <span class="text-3xl">${av.icon}</span>
                <span class="text-[10px] font-bold text-slate-300 truncate w-full text-center">${av.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Agency Profile Form -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400">Agency Designation</h3>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Space Program Name</label>
            <input type="text" id="profile-agency-input" value="${profile.agencyName || ''}" class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-blue-400 focus:outline-none">
          </div>
          <button id="btn-save-agency-name" class="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all">
            Update Agency Designation
          </button>
        </div>

        <!-- Career Milestones & Badges -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Space Program Milestones</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div class="text-xl">🚀</div>
              <div class="text-lg font-bold font-mono text-white mt-1">${records.totalLaunches || 0}</div>
              <div class="text-[10px] text-slate-500 uppercase">Launches</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div class="text-xl">🎯</div>
              <div class="text-lg font-bold font-mono text-emerald-400 mt-1">${successRate}%</div>
              <div class="text-[10px] text-slate-500 uppercase">Success Rate</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div class="text-xl">⚡</div>
              <div class="text-lg font-bold font-mono text-amber-400 mt-1">${(records.highestSpeed || 0).toLocaleString()} m/s</div>
              <div class="text-[10px] text-slate-500 uppercase">Top Speed</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div class="text-xl">🏆</div>
              <div class="text-lg font-bold font-mono text-cyan-400 mt-1">${(records.highestAltitude || 0).toLocaleString()} m</div>
              <div class="text-[10px] text-slate-500 uppercase">Apex Alt</div>
            </div>
          </div>
        </div>

      </div>
    `;

    // Event listeners
    container.querySelectorAll('.avatar-select-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const avId = btn.getAttribute('data-avatar');
        profile.avatar = avId;
        await api.updateProfile({ avatar: avId });
        this.app.updateHeaderMetrics();
        this.renderProfileView();
        sound.playEquip();
      });
    });

    const saveNameBtn = document.getElementById('btn-save-agency-name');
    const input = document.getElementById('profile-agency-input');
    if (saveNameBtn && input) {
      saveNameBtn.addEventListener('click', async () => {
        const val = input.value.trim();
        if (val) {
          profile.agencyName = val;
          await api.updateProfile({ agencyName: val });
          this.app.updateHeaderMetrics();
          sound.playEquip();
          alert('Agency designation saved!');
        }
      });
    }
  }

  renderSettingsView() {
    const container = document.getElementById('settings-container');
    if (!container) return;

    const currentLang = getLanguage();

    container.innerHTML = `
      <div class="max-w-2xl mx-auto space-y-6">
        
        <!-- Language Selection -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Interface Language</h3>
          <div class="grid grid-cols-3 gap-3">
            <button data-lang="en" class="lang-btn p-3 rounded-xl border font-bold text-xs transition-all ${currentLang === 'en' ? 'border-blue-400 bg-blue-950 text-white' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'}">
              English
            </button>
            <button data-lang="ru" class="lang-btn p-3 rounded-xl border font-bold text-xs transition-all ${currentLang === 'ru' ? 'border-blue-400 bg-blue-950 text-white' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'}">
              Русский
            </button>
            <button data-lang="uz" class="lang-btn p-3 rounded-xl border font-bold text-xs transition-all ${currentLang === 'uz' ? 'border-blue-400 bg-blue-950 text-white' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'}">
              O'zbekcha
            </button>
          </div>
        </div>

        <!-- Audio Volume Sliders -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400">Audio Acoustics</h3>
          <div>
            <div class="flex justify-between text-xs text-slate-300 mb-1">
              <span>Sound Effects (Thrusters & Ignition)</span>
              <span id="sfx-vol-val">${Math.round(sound.sfxVolume * 100)}%</span>
            </div>
            <input type="range" id="slider-sfx-vol" min="0" max="100" value="${Math.round(sound.sfxVolume * 100)}" class="w-full accent-blue-500">
          </div>
          <div>
            <div class="flex justify-between text-xs text-slate-300 mb-1">
              <span>Ambient Space Drone</span>
              <span id="music-vol-val">${Math.round(sound.musicVolume * 100)}%</span>
            </div>
            <input type="range" id="slider-music-vol" min="0" max="100" value="${Math.round(sound.musicVolume * 100)}" class="w-full accent-blue-500">
          </div>
        </div>

        <!-- Controls Guide -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Flight Controls</h3>
          <div class="space-y-2 text-xs font-mono text-slate-300">
            <div class="flex justify-between py-1 border-b border-slate-800/80">
              <span>Steer Left</span>
              <span class="px-2 py-0.5 rounded bg-slate-800 text-cyan-300">A / Left Arrow</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-800/80">
              <span>Steer Right</span>
              <span class="px-2 py-0.5 rounded bg-slate-800 text-cyan-300">D / Right Arrow</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-800/80">
              <span>Oxidizer Turbo Boost</span>
              <span class="px-2 py-0.5 rounded bg-slate-800 text-amber-300">Spacebar</span>
            </div>
          </div>
        </div>

        <!-- Reset Settings -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <h4 class="text-xs font-bold text-white uppercase">Reset Interface Settings</h4>
            <p class="text-[11px] text-slate-500">Resets sound and language options without affecting saved rocket or coins.</p>
          </div>
          <button id="btn-reset-settings" class="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">
            Reset Defaults
          </button>
        </div>

      </div>
    `;

    // Bind settings events
    container.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
        sound.playClick();
        this.renderSettingsView();
      });
    });

    const sfxSlider = document.getElementById('slider-sfx-vol');
    const musicSlider = document.getElementById('slider-music-vol');

    if (sfxSlider) {
      sfxSlider.addEventListener('input', (e) => {
        const val = Number(e.target.value) / 100;
        sound.setSfxVolume(val);
        const text = document.getElementById('sfx-vol-val');
        if (text) text.textContent = `${e.target.value}%`;
      });
    }

    if (musicSlider) {
      musicSlider.addEventListener('input', (e) => {
        const val = Number(e.target.value) / 100;
        sound.setMusicVolume(val);
        const text = document.getElementById('music-vol-val');
        if (text) text.textContent = `${e.target.value}%`;
      });
    }

    const resetBtn = document.getElementById('btn-reset-settings');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        await api.resetSettings();
        setLanguage('en');
        sound.setSfxVolume(0.8);
        sound.setMusicVolume(0.5);
        this.renderSettingsView();
        sound.playClick();
        alert('Settings restored to default!');
      });
    }
  }
}
