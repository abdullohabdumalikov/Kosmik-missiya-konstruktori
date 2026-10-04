// 4-to-1 Blueprint Crafting Engine
import { sound } from './audio.js';
import { api } from './api.js';
import { getPartStats } from './parts-data.js';
import { getPartSvg } from './part-icons.js';

export class CraftingManager {
  constructor(app) {
    this.app = app;
    this.selectedPartKey = null;
    this.selectedLevel = 1;
    this.isCrafting = false;
  }

  selectForCrafting(partKey, level) {
    this.selectedPartKey = partKey;
    this.selectedLevel = level;
    this.renderWorkbench();
    sound.playClick();
  }

  async executeCraft() {
    if (this.isCrafting) return;
    if (!this.selectedPartKey || this.selectedLevel >= 5) return;

    const inv = this.app.userData.inventory || [];
    const item = inv.find(i => i.partKey === this.selectedPartKey && i.level === this.selectedLevel);
    if (!item || item.quantity < 4) {
      alert(`Requirement not met: Need 4 matching parts to fuse.`);
      return;
    }

    this.isCrafting = true;
    sound.playClick();

    const workbenchEl = document.getElementById('crafting-workbench');
    if (workbenchEl) {
      workbenchEl.classList.add('fusing-active');
    }

    try {
      const res = await api.craft(this.selectedPartKey, this.selectedLevel);
      
      setTimeout(() => {
        sound.playCraftSuccess();
        if (workbenchEl) {
          workbenchEl.classList.remove('fusing-active');
          workbenchEl.classList.add('fusion-flash');
          setTimeout(() => workbenchEl.classList.remove('fusion-flash'), 800);
        }

        this.app.userData.inventory = res.inventory;
        if (res.science !== undefined) {
          this.app.userData.profile.science = res.science;
        }

        if (res.craftedItem && res.craftedItem.level < 5) {
          this.selectedLevel = res.craftedItem.level;
        }

        this.app.updateHeaderMetrics();
        this.renderBlueprintBoard();
        this.renderWorkbench();
        this.isCrafting = false;
      }, 700);
    } catch (err) {
      this.isCrafting = false;
      if (workbenchEl) workbenchEl.classList.remove('fusing-active');
      console.error('Crafting failed:', err);
      alert('Crafting failed: ' + err.message);
    }
  }

  renderBlueprintBoard(filterCategory = 'all') {
    const boardContainer = document.getElementById('crafting-grid');
    if (!boardContainer) return;

    boardContainer.innerHTML = '';
    const inventory = this.app.userData.inventory || [];

    const filtered = filterCategory === 'all'
      ? inventory
      : inventory.filter(i => i.category === filterCategory);

    if (filtered.length === 0) {
      boardContainer.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400">
          <p class="text-sm font-medium">No components available in this category.</p>
          <p class="text-xs text-slate-500 mt-1">Fly higher missions and salvage loot to unlock more parts!</p>
        </div>
      `;
      return;
    }

    filtered.sort((a, b) => b.level - a.level || b.quantity - a.quantity);

    filtered.forEach(item => {
      const stats = getPartStats(item.partKey, item.level);
      if (!stats) return;

      const card = document.createElement('div');
      const isSelected = item.partKey === this.selectedPartKey && item.level === this.selectedLevel;
      const canCraft = item.quantity >= 4 && item.level < 5;

      card.className = `blueprint-card p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
        isSelected
          ? 'bg-blue-950/80 border-blue-400 shadow-md ring-1 ring-blue-400'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80'
      }`;

      const svgIcon = getPartSvg(item.category, item.partKey, 48);

      card.innerHTML = `
        <div class="flex items-start justify-between">
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded" style="background:${stats.rarityMeta.bg}; color:${stats.rarityMeta.color}; border: 1px solid ${stats.rarityMeta.border}">
            LV ${item.level}
          </span>
          <span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">
            x${item.quantity}
          </span>
        </div>

        <div class="my-2 flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-center shrink-0">
            ${svgIcon}
          </div>
          <div class="min-w-0">
            <h4 class="text-xs font-bold text-white truncate">${stats.name}</h4>
            <p class="text-[10px] text-slate-400 truncate mt-0.5">${stats.category.toUpperCase()}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-300 pt-2 border-t border-slate-800/80">
          <div><span class="text-slate-500">Mass:</span> ${stats.mass}kg</div>
          <div><span class="text-slate-500">Rel:</span> ${stats.reliability}%</div>
          ${stats.thrust > 0 ? `<div><span class="text-slate-500">Thrust:</span> ${stats.thrust}kN</div>` : ''}
          ${stats.fuel > 0 ? `<div><span class="text-slate-500">Fuel:</span> ${stats.fuel}kg</div>` : ''}
        </div>

        <div class="mt-2.5 flex items-center justify-between text-[10px]">
          ${item.level >= 5
            ? `<span class="font-bold text-amber-400">★ MAX LEVEL</span>`
            : canCraft
              ? `<span class="font-bold text-emerald-400 animate-pulse">✓ 4/4 READY</span>`
              : `<span class="text-slate-500">${item.quantity}/4 to Upgrade</span>`
          }
          <span class="font-bold text-blue-400">${isSelected ? 'Selected' : 'Select'}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectForCrafting(item.partKey, item.level);
      });

      boardContainer.appendChild(card);
    });
  }

  renderWorkbench() {
    const workbench = document.getElementById('crafting-workbench');
    if (!workbench) return;

    if (!this.selectedPartKey) {
      workbench.innerHTML = `
        <div class="p-6 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <h3 class="text-sm font-bold text-white">4-to-1 Fusion Workbench</h3>
          <p class="text-xs text-slate-400 mt-0.5">Select a component below to fuse 4 identical units into 1 upgraded level.</p>
        </div>
      `;
      return;
    }

    const inv = this.app.userData.inventory || [];
    const item = inv.find(i => i.partKey === this.selectedPartKey && i.level === this.selectedLevel);
    const count = item ? item.quantity : 0;
    const statsCurrent = getPartStats(this.selectedPartKey, this.selectedLevel);
    const nextLevel = Math.min(5, this.selectedLevel + 1);
    const statsNext = getPartStats(this.selectedPartKey, nextLevel);
    const canCraft = count >= 4 && this.selectedLevel < 5;

    const svgCurrent = getPartSvg(statsCurrent.category, this.selectedPartKey, 36);
    const svgNext = getPartSvg(statsNext.category, this.selectedPartKey, 48);

    workbench.innerHTML = `
      <div class="p-4 rounded-xl bg-slate-900/90 border border-blue-500/30 shadow-xl relative overflow-hidden">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <!-- 4 Input Slots with SVG -->
          <div class="flex items-center gap-2">
            ${[0, 1, 2, 3].map(slotIdx => {
              const hasPart = count > slotIdx;
              return `
                <div class="fusion-slot w-14 h-18 rounded-lg border flex flex-col items-center justify-center p-1 transition-all ${
                  hasPart
                    ? 'border-blue-400/80 bg-blue-950/60 shadow text-white'
                    : 'border-slate-800 border-dashed bg-slate-950/40 text-slate-600'
                }">
                  <div class="w-8 h-8 flex items-center justify-center">
                    ${hasPart ? svgCurrent : '<span class="text-xs text-slate-600">Empty</span>'}
                  </div>
                  <span class="text-[9px] font-mono mt-1">${hasPart ? `LV ${this.selectedLevel}` : `${slotIdx + 1}/4`}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Fusion Arrow & Button -->
          <div class="flex flex-col items-center">
            <span class="text-xl text-blue-400 mb-1 font-bold">➔</span>
            <button id="btn-execute-craft" class="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
              canCraft && !this.isCrafting
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }" ${!canCraft || this.isCrafting ? 'disabled' : ''}>
              ${this.selectedLevel >= 5
                ? 'MAX LEVEL'
                : canCraft
                  ? 'FUSE 4-TO-1 UPGRADE'
                  : `NEED ${4 - count} MORE`}
            </button>
          </div>

          <!-- Upgraded Output Card -->
          <div class="w-48 p-2.5 rounded-lg border border-amber-500/60 bg-gradient-to-b from-amber-950/30 to-slate-950/80 text-white flex items-center gap-3">
            <div class="w-12 h-12 rounded bg-slate-950/80 border border-amber-500/40 flex items-center justify-center shrink-0">
              ${svgNext}
            </div>
            <div class="min-w-0">
              <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                TARGET LV ${nextLevel}
              </span>
              <h5 class="text-xs font-bold text-white truncate mt-0.5">${statsNext.name}</h5>
              <div class="text-[9px] font-mono text-emerald-400 mt-0.5">
                Rel: ${statsNext.reliability}% · ${statsNext.mass}kg
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    const craftBtn = document.getElementById('btn-execute-craft');
    if (craftBtn) {
      craftBtn.addEventListener('click', () => this.executeCraft());
    }
  }
}
