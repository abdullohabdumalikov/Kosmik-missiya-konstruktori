// Vehicle Designer Controller
// Direct slot drag & drop targeting, unequip buttons, and no intrusive screen overlays

import { PARTS_CATALOG, calculateRocketStats, getPartStats } from './parts-data.js';
import { rocketRenderer } from './rocket-renderer.js';
import { getPartSvg } from './part-icons.js';
import { sound } from './audio.js';
import { api } from './api.js';

export class VehicleDesigner {
  constructor(app) {
    this.app = app;
    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;
    this.activeFilter = 'all';
    this.draggedPart = null;
    this.draggedOffSlot = null;
    this.showCoM = true;
    this.showCoT = true;
  }

  init() {
    this.canvas = document.getElementById('designer-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }

    this.bindEvents();
    this.renderPartsShop();
    this.renderChecklistSummary();
    this.updateDropSlotLabels();
    this.startRenderingLoop();
  }

  updateCategoryView() {
    this.renderPartsShop();
    this.renderChecklistSummary();
    this.updateDropSlotLabels();
    this.resizeCanvas();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : 500;
    const h = rect.height > 0 ? rect.height : 600;

    this.canvas.width = w * window.devicePixelRatio;
    this.canvas.height = h * window.devicePixelRatio;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  bindEvents() {
    // Filter tabs
    document.querySelectorAll('.designer-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.designer-filter-btn').forEach(b => b.classList.remove('active-tab'));
        btn.classList.add('active-tab');
        this.activeFilter = btn.getAttribute('data-filter');
        this.renderPartsShop();
        sound.playClick();
      });
    });

    // Reroll Shop Button (-25K)
    const rerollBtn = document.getElementById('btn-shop-reroll');
    if (rerollBtn) {
      rerollBtn.addEventListener('click', async () => {
        sound.playClick();
        try {
          const res = await api.request('/api/shop/reroll', { method: 'POST' });
          this.app.userData.profile.funds = res.funds;
          this.app.userData.shopStock = res.shopStock;
          this.app.updateHeaderMetrics();
          this.renderPartsShop();
          sound.playEquip();
        } catch (err) {
          alert(err.message);
        }
      });
    }

    // Fleet Hangar
    const hangarBtn = document.getElementById('btn-open-hangar');
    if (hangarBtn) {
      hangarBtn.addEventListener('click', () => {
        if (this.app.fleetHangar) {
          this.app.fleetHangar.openHangarModal();
        }
      });
    }

    const closeHangarBtn = document.getElementById('btn-close-hangar');
    if (closeHangarBtn) {
      closeHangarBtn.addEventListener('click', () => {
        if (this.app.fleetHangar) {
          this.app.fleetHangar.closeHangarModal();
        }
      });
    }

    // Rocket Name input
    const nameInput = document.getElementById('designer-rocket-name');
    if (nameInput) {
      nameInput.addEventListener('change', (e) => {
        this.app.userData.rocket.name = e.target.value.trim() || 'Aero-Scout I';
        this.saveRocket(false);
      });
    }

    // Launch Button
    const launchBtn = document.getElementById('btn-designer-launch');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        sound.playClick();
        this.app.switchView('flight');
      });
    }

    // Slot remove / unequip buttons
    document.querySelectorAll('.btn-remove-slot').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slotKey = btn.getAttribute('data-remove');
        this.unequipSlot(slotKey);
      });
    });

    // CoM and CoT Gizmo Toggle Buttons (SimpleRockets 2 Style)
    const comBtn = document.getElementById('btn-toggle-com');
    if (comBtn) {
      comBtn.addEventListener('click', () => {
        this.showCoM = !this.showCoM;
        comBtn.classList.toggle('opacity-50', !this.showCoM);
        sound.playClick();
      });
    }

    const cotBtn = document.getElementById('btn-toggle-cot');
    if (cotBtn) {
      cotBtn.addEventListener('click', () => {
        this.showCoT = !this.showCoT;
        cotBtn.classList.toggle('opacity-50', !this.showCoT);
        sound.playClick();
      });
    }

    // Global dragover tracker for floating custom ghost (Element qb olish)
    window.addEventListener('dragover', (e) => {
      this.updateFloatingGhost(e);
    });

    // Setup interactive Rocket Slots Drop Targets & Inventory Return
    this.setupSlotDropZones();
    this.setupInventoryReturnZone();
  }

  showFloatingGhost(name, category, partKey, actionText = '⚡ SNAP TO ROCKET') {
    const ghost = document.getElementById('designer-floating-drag-ghost');
    if (!ghost) return;
    const iconWrap = document.getElementById('ghost-icon-wrap');
    const nameEl = document.getElementById('ghost-name');
    const subEl = document.getElementById('ghost-sub');

    if (iconWrap) iconWrap.innerHTML = getPartSvg(category, partKey, 36);
    if (nameEl) nameEl.textContent = name;
    if (subEl) subEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span><span>${actionText}</span>`;

    ghost.classList.remove('hidden');
  }

  updateFloatingGhost(e) {
    const ghost = document.getElementById('designer-floating-drag-ghost');
    if (ghost && !ghost.classList.contains('hidden') && e.clientX && e.clientY) {
      ghost.style.left = `${e.clientX + 16}px`;
      ghost.style.top = `${e.clientY + 16}px`;
    }
  }

  hideFloatingGhost() {
    const ghost = document.getElementById('designer-floating-drag-ghost');
    if (ghost) ghost.classList.add('hidden');
  }

  setupSlotDropZones() {
    const allSlots = document.querySelectorAll('.rocket-drop-slot');
    allSlots.forEach(slot => {
      const slotCat = slot.getAttribute('data-slot');

      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        slot.classList.add('slot-drag-hover');
      });

      slot.addEventListener('dragleave', () => {
        slot.classList.remove('slot-drag-hover');
      });

      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        slot.classList.remove('slot-drag-hover');
        if (this.draggedPart) {
          this.equipPart(this.draggedPart.category, this.draggedPart.key);
          this.draggedPart = null;
          this.hideFloatingGhost();
          this.clearSlotHighlights();
        }
      });

      slot.addEventListener('click', () => {
        const filterBtn = document.querySelector(`.designer-filter-btn[data-filter="${slotCat}"]`);
        if (filterBtn) filterBtn.click();
      });

      // Dragging component directly OFF the slot to return to inventory
      slot.addEventListener('dragstart', (e) => {
        const currentPart = this.getEquippedPart(slotCat);
        if (currentPart && currentPart.key && !currentPart.key.endsWith('_none')) {
          this.draggedOffSlot = slotCat;
          e.dataTransfer.setData('text/plain', slotCat);
          this.showFloatingGhost(currentPart.name, slotCat, currentPart.key, '📥 TASHING / INVENTARGA QAYTARISH');
          const returnZone = document.getElementById('inventory-return-zone');
          if (returnZone) returnZone.classList.remove('hidden');
        }
      });

      slot.addEventListener('dragend', () => {
        this.hideFloatingGhost();
        const returnZone = document.getElementById('inventory-return-zone');
        if (returnZone) returnZone.classList.add('hidden');
        this.draggedOffSlot = null;
      });
    });

    // Also support dropping anywhere on the center assembly canvas
    const canvasBay = document.getElementById('designer-canvas-bay');
    if (canvasBay) {
      canvasBay.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.updateFloatingGhost(e);
      });
      canvasBay.addEventListener('drop', (e) => {
        e.preventDefault();
        if (this.draggedPart) {
          this.equipPart(this.draggedPart.category, this.draggedPart.key);
          this.draggedPart = null;
          this.hideFloatingGhost();
          this.clearSlotHighlights();
        }
      });
    }
  }

  setupInventoryReturnZone() {
    const returnZone = document.getElementById('inventory-return-zone');
    const leftAside = document.querySelector('#view-designer aside');

    const handleReturnDrop = (e) => {
      e.preventDefault();
      if (this.draggedOffSlot) {
        this.unequipSlot(this.draggedOffSlot);
        sound.playStageSeparation();
        this.draggedOffSlot = null;
        this.hideFloatingGhost();
        if (returnZone) returnZone.classList.add('hidden');
      }
    };

    if (returnZone) {
      returnZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        returnZone.classList.add('border-amber-300', 'bg-amber-900');
      });
      returnZone.addEventListener('dragleave', () => {
        returnZone.classList.remove('border-amber-300', 'bg-amber-900');
      });
      returnZone.addEventListener('drop', handleReturnDrop);
    }

    if (leftAside) {
      leftAside.addEventListener('dragover', (e) => {
        if (this.draggedOffSlot) e.preventDefault();
      });
      leftAside.addEventListener('drop', handleReturnDrop);
    }
  }

  getEquippedPart(slotCat) {
    const r = this.app.userData.rocket;
    let partKey = null;
    if (slotCat === 'nose') partKey = r.noseId;
    else if (slotCat === 'upperStage') partKey = r.upperStageId;
    else if (slotCat === 'mainTank') partKey = r.mainTankId;
    else if (slotCat === 'engine') partKey = r.engineId;
    else if (slotCat === 'booster') partKey = r.boosterId;
    else if (slotCat === 'wings') partKey = r.wingsId;
    else if (slotCat === 'payload') partKey = r.payloadId;
    else if (slotCat === 'upgrade') partKey = r.upgradeId;

    if (!partKey) return null;
    return PARTS_CATALOG[partKey] || null;
  }

  highlightTargetSlots(category) {
    document.querySelectorAll('.rocket-drop-slot').forEach(slot => {
      const isTarget = slot.getAttribute('data-slot') === category;
      const tag = slot.querySelector('.slot-target-tag');
      if (isTarget) {
        slot.classList.add('slot-active-target', 'ring-2', 'ring-emerald-400', 'bg-emerald-950/90', 'scale-105');
        if (tag) tag.classList.remove('hidden');
      } else {
        slot.classList.remove('slot-active-target', 'ring-2', 'ring-emerald-400', 'bg-emerald-950/90', 'scale-105');
        if (tag) tag.classList.add('hidden');
      }
    });
  }

  clearSlotHighlights() {
    document.querySelectorAll('.rocket-drop-slot').forEach(slot => {
      slot.classList.remove('slot-active-target', 'slot-drag-hover', 'ring-2', 'ring-emerald-400', 'bg-emerald-950/90', 'scale-105');
      const tag = slot.querySelector('.slot-target-tag');
      if (tag) tag.classList.add('hidden');
    });
  }

  unequipSlot(slotKey) {
    const r = this.app.userData.rocket;
    if (slotKey === 'upperStage') r.upperStageId = 'stage_none';
    else if (slotKey === 'booster') r.boosterId = 'booster_none';
    else if (slotKey === 'wings') r.wingsId = 'fins_small'; // reset to micro fins
    else if (slotKey === 'payload') r.payloadId = 'payload_mini_beeper';
    else if (slotKey === 'upgrade') r.upgradeId = 'upgrade_none';
    else if (slotKey === 'nose') r.noseId = 'nose_mini_point';
    else if (slotKey === 'mainTank') r.mainTankId = 'tank_mini_core';
    else if (slotKey === 'engine') r.engineId = 'engine_spark_mini';

    sound.playEquip();
    this.renderPartsShop();
    this.renderChecklistSummary();
    this.updateDropSlotLabels();
    this.saveRocket(false);
  }

  renderPartsShop() {
    const listContainer = document.getElementById('designer-shop-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    const inventory = this.app.userData.inventory || [];
    const shopStock = this.app.userData.shopStock || [];
    const itemsToShow = [];

    inventory.forEach(invItem => {
      const stats = getPartStats(invItem.partKey, invItem.level);
      if (stats && (this.activeFilter === 'all' || stats.category === this.activeFilter)) {
        itemsToShow.push({
          key: invItem.partKey,
          category: stats.category,
          name: stats.name,
          level: invItem.level,
          stats,
          owned: true,
          quantity: invItem.quantity,
          cost: 0
        });
      }
    });

    shopStock.forEach(stockItem => {
      const stats = getPartStats(stockItem.partKey, stockItem.level);
      if (stats && (this.activeFilter === 'all' || stats.category === this.activeFilter)) {
        itemsToShow.push({
          key: stockItem.partKey,
          category: stats.category,
          name: stats.name,
          level: stockItem.level,
          stats,
          owned: false,
          quantity: 1,
          cost: stockItem.cost
        });
      }
    });

    if (itemsToShow.length === 0) {
      listContainer.innerHTML = `
        <div class="py-8 text-center text-xs text-slate-500">
          No components in this filter.<br>Click Reroll to find new parts!
        </div>
      `;
      return;
    }

    itemsToShow.forEach(item => {
      const card = document.createElement('div');
      const isEquipped = this.isPartEquipped(item.category, item.key);

      card.draggable = true;
      card.className = `p-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing flex items-center gap-3 select-none ${
        isEquipped
          ? 'bg-blue-950/70 border-blue-400 ring-1 ring-blue-400/80 shadow-md'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
      }`;

      const svgIcon = getPartSvg(item.category, item.key, 42);

      card.innerHTML = `
        <div class="w-11 h-11 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-center shrink-0 pointer-events-none">
          ${svgIcon}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-white truncate">${item.name}</span>
            <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              LV ${item.level}
            </span>
          </div>
          <div class="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
            <span>${item.stats.mass}kg</span>
            ${item.stats.thrust > 0 ? `<span>· ${item.stats.thrust}kN</span>` : ''}
            <span>· ${item.stats.reliability}% Rel</span>
          </div>
          <div class="flex items-center justify-between mt-1 text-[10px]">
            ${item.owned 
              ? `<span class="text-emerald-400 font-bold font-mono">Owned (x${item.quantity})</span>`
              : `<span class="text-amber-400 font-bold font-mono">Cost: ${item.cost}K</span>`
            }
            <button class="btn-part-action text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
              isEquipped
                ? (item.category === 'upperStage' || item.category === 'booster' || item.category === 'upgrade')
                  ? 'bg-rose-900/60 hover:bg-rose-700 text-rose-200 border border-rose-500/50'
                  : 'bg-blue-600 text-white'
                : item.owned
                  ? 'bg-slate-800 hover:bg-blue-600 text-slate-200'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950'
            }">
              ${isEquipped ? ((item.category === 'upperStage' || item.category === 'booster' || item.category === 'upgrade') ? 'UNEQUIP' : 'EQUIPPED') : item.owned ? 'EQUIP' : 'BUY'}
            </button>
          </div>
        </div>
      `;

      card.addEventListener('dragstart', (e) => {
        this.draggedPart = item;
        e.dataTransfer.setData('text/plain', item.key);
        this.showFloatingGhost(item.name, item.category, item.key, '⚡ SNAP TO ROCKET');
        this.highlightTargetSlots(item.category);
      });

      card.addEventListener('dragend', () => {
        this.hideFloatingGhost();
        this.clearSlotHighlights();
      });

      const actionBtn = card.querySelector('.btn-part-action');
      actionBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (isEquipped && (item.category === 'upperStage' || item.category === 'booster' || item.category === 'upgrade')) {
          this.unequipSlot(item.category);
          return;
        }
        if (item.owned) {
          this.equipPart(item.category, item.key);
        } else {
          try {
            const res = await api.request('/api/shop/buy', {
              method: 'POST',
              body: JSON.stringify({ partKey: item.key, category: item.category, level: item.level, cost: item.cost })
            });
            this.app.userData.profile.funds = res.funds;
            this.app.userData.inventory = res.inventory;
            this.app.updateHeaderMetrics();
            this.renderPartsShop();
            sound.playCraftSuccess();
          } catch (err) {
            alert(err.message);
          }
        }
      });

      card.addEventListener('click', () => {
        if (item.owned) {
          this.equipPart(item.category, item.key);
        }
      });

      listContainer.appendChild(card);
    });
  }

  isPartEquipped(category, partKey) {
    const r = this.app.userData.rocket;
    if (category === 'nose') return r.noseId === partKey;
    if (category === 'upperStage') return r.upperStageId === partKey;
    if (category === 'mainTank') return r.mainTankId === partKey;
    if (category === 'engine') return r.engineId === partKey;
    if (category === 'booster') return r.boosterId === partKey;
    if (category === 'wings') return r.wingsId === partKey;
    if (category === 'payload') return r.payloadId === partKey;
    if (category === 'upgrade') return r.upgradeId === partKey;
    return false;
  }

  equipPart(category, partKey) {
    const r = this.app.userData.rocket;
    if (category === 'nose') r.noseId = partKey;
    else if (category === 'upperStage') r.upperStageId = partKey;
    else if (category === 'mainTank') r.mainTankId = partKey;
    else if (category === 'engine') r.engineId = partKey;
    else if (category === 'booster') r.boosterId = partKey;
    else if (category === 'wings') r.wingsId = partKey;
    else if (category === 'payload') r.payloadId = partKey;
    else if (category === 'upgrade') r.upgradeId = partKey;

    sound.playEquip();
    this.renderPartsShop();
    this.renderChecklistSummary();
    this.updateDropSlotLabels();
    this.saveRocket(false);
  }

  updateDropSlotLabels() {
    const r = this.app.userData.rocket;
    const noseSlot = document.getElementById('slot-nose-val');
    const upperSlot = document.getElementById('slot-upper-val');
    const tankSlot = document.getElementById('slot-tank-val');
    const engineSlot = document.getElementById('slot-engine-val');
    const boosterSlot = document.getElementById('slot-booster-val');
    const finSlot = document.getElementById('slot-wings-val');
    const upgradeSlot = document.getElementById('slot-upgrade-val');

    const noseName = PARTS_CATALOG[r.noseId]?.name || 'Nose';
    const upperName = PARTS_CATALOG[r.upperStageId]?.name || 'None (Single-Stage)';
    const tankName = PARTS_CATALOG[r.mainTankId]?.name || 'Core Tank';
    const engineName = PARTS_CATALOG[r.engineId]?.name || 'Engine';
    const boosterName = PARTS_CATALOG[r.boosterId]?.name || 'None';
    const finName = PARTS_CATALOG[r.wingsId]?.name || 'Fins';
    const upgradeName = PARTS_CATALOG[r.upgradeId]?.name || 'None';

    if (noseSlot) noseSlot.textContent = noseName;
    if (upperSlot) upperSlot.textContent = upperName;
    if (tankSlot) tankSlot.textContent = tankName;
    if (engineSlot) engineSlot.textContent = engineName;
    if (boosterSlot) boosterSlot.textContent = boosterName;
    if (finSlot) finSlot.textContent = finName;
    if (upgradeSlot) upgradeSlot.textContent = upgradeName;
  }

  renderChecklistSummary() {
    const stats = calculateRocketStats(this.app.userData.rocket, this.app.userData.inventory);
    this.currentStats = stats;

    const s1Mass = document.getElementById('chk-s1-mass');
    const s1Thrust = document.getElementById('chk-s1-thrust');
    const s1Burn = document.getElementById('chk-s1-burn');
    const s1Twr = document.getElementById('chk-s1-twr');

    if (s1Mass) s1Mass.textContent = `${stats.stage1.dryMass.toLocaleString()} kg dry · ${stats.stage1.fuel.toLocaleString()} kg fuel`;
    if (s1Thrust) s1Thrust.textContent = `${stats.stage1.thrust.toLocaleString()} kN`;
    if (s1Burn) s1Burn.textContent = `${stats.stage1.duration}s`;
    if (s1Twr) s1Twr.textContent = `${stats.twr} TWR`;

    const s2Target = document.getElementById('chk-s2-target');
    const s2Mass = document.getElementById('chk-s2-mass');
    const payloadRelBar = document.getElementById('chk-payload-rel-bar');
    const payloadRelText = document.getElementById('chk-payload-rel-text');

    if (s2Target) s2Target.textContent = stats.upper ? stats.upper.targetOrbit : 'Suborbital';
    if (s2Mass) s2Mass.textContent = stats.upper ? `${stats.stage2.dryMass} kg` : 'Single Stage';
    if (payloadRelBar) payloadRelBar.style.width = `${stats.payloadReliability}%`;
    if (payloadRelText) payloadRelText.textContent = `${stats.payloadReliability}% Payload Reliability`;

    const totalMass = document.getElementById('chk-total-mass');
    const launchRelBar = document.getElementById('chk-launch-rel-bar');
    const launchRelText = document.getElementById('chk-launch-rel-text');
    const totalCost = document.getElementById('chk-total-cost');
    const buildMonths = document.getElementById('chk-build-months');

    if (totalMass) totalMass.textContent = `${stats.totalMass.toLocaleString()} kg`;
    if (launchRelBar) launchRelBar.style.width = `${stats.launchReliability}%`;
    if (launchRelText) launchRelText.textContent = `${stats.launchReliability}% Mission Reliability`;
    if (totalCost) totalCost.textContent = `Ⓢ ${stats.totalCost.toLocaleString()}K`;
    if (buildMonths) buildMonths.textContent = `${stats.totalBuildMonths} Months`;

    // Active Goal Display in Top Bar
    const activeMission = this.app.getActiveMission ? this.app.getActiveMission() : null;
    const goalNameEl = document.getElementById('designer-goal-name');
    const goalRewardEl = document.getElementById('designer-goal-reward');
    if (activeMission && goalNameEl) {
      goalNameEl.textContent = `${activeMission.title} (${activeMission.requiredAltitude.toLocaleString()}m)`;
      if (goalRewardEl) goalRewardEl.textContent = `+Ⓢ ${activeMission.rewards?.funds || 25}K`;
    }
  }

  async saveRocket(showToast = true) {
    try {
      await api.saveRocket(this.app.userData.rocket);
      if (showToast) {
        sound.playEquip();
      }
    } catch (err) {
      console.error('Error saving rocket:', err);
    }
  }

  startRenderingLoop() {
    let animAngle = 0;
    const render = () => {
      const designerView = document.getElementById('view-designer');
      if (this.canvas && this.ctx && designerView && designerView.style.display !== 'none') {
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;

        if (width > 0 && height > 0) {
          this.ctx.clearRect(0, 0, width, height);

          // Blueprint Grid Background
          this.drawBlueprintGrid(width, height);

          animAngle += 0.003;
          const subtleRocking = Math.sin(animAngle) * 0.012;
          const stats = this.currentStats || calculateRocketStats(this.app.userData.rocket, this.app.userData.inventory);

          const isMini = this.app.userData.rocket.mainTankId === 'tank_mini_core';
          const renderScale = isMini ? 1.3 : 1.1;
          const rocketCenterX = width / 2;
          const rocketCenterY = height * 0.58;

          rocketRenderer.draw(
            this.ctx,
            rocketCenterX,
            rocketCenterY,
            renderScale,
            subtleRocking,
            {
              rocketConfig: this.app.userData.rocket,
              stats,
              stage: 1,
              throttle: 0,
              isBoosting: false,
              showPlume: false
            }
          );

          // SimpleRockets 2 Engineering Gizmos: Height Ruler
          this.drawBlueprintRuler(width, height, rocketCenterX, rocketCenterY, renderScale);

          // SimpleRockets 2 Center of Thrust (CoT)
          if (this.showCoT) {
            this.drawCoT(rocketCenterX, rocketCenterY + 45 * renderScale);
          }

          // SimpleRockets 2 Center of Mass (CoM)
          if (this.showCoM) {
            const hasUpper = this.app.userData.rocket.upperStageId && this.app.userData.rocket.upperStageId !== 'stage_none';
            const comOffsetY = hasUpper ? -45 : -25;
            this.drawCoM(rocketCenterX, rocketCenterY + comOffsetY * renderScale);
          }

          // SimpleRockets 2 Holographic Drag Snap Highlight (Clean, Non-Intrusive)
          if (this.draggedPart) {
            this.drawHolographicSnapBracket(rocketCenterX, rocketCenterY, renderScale, this.draggedPart.category);
          }
        }
      }
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  drawBlueprintRuler(w, h, rx, ry, scale) {
    const ctx = this.ctx;
    ctx.save();
    const rulerX = Math.max(30, rx - 160 * scale);
    const bottomY = ry + 95 * scale;
    const topY = ry - 220 * scale;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);

    ctx.beginPath();
    ctx.moveTo(rulerX, bottomY);
    ctx.lineTo(rulerX, topY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.textAlign = 'right';

    // 0m, 5m, 10m, 15m, 20m, 25m markers
    const totalMeters = 25;
    for (let m = 0; m <= totalMeters; m += 5) {
      const my = bottomY - (m / totalMeters) * (bottomY - topY);
      ctx.beginPath();
      ctx.moveTo(rulerX - 5, my);
      ctx.lineTo(rulerX + 5, my);
      ctx.stroke();
      ctx.fillText(`${m}m`, rulerX - 8, my + 3);
    }
    ctx.restore();
  }

  drawCoM(x, y) {
    const ctx = this.ctx;
    ctx.save();
    const r = 9;

    // Checkered Circle (SimpleRockets 2 / KSP Standard: Alternating Yellow and Black quadrants)
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Top-Right quadrant yellow
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, -Math.PI / 2, 0);
    ctx.closePath();
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    // Bottom-Left quadrant yellow
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, Math.PI / 2, Math.PI);
    ctx.closePath();
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    // Outer ring & crosshair
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - r - 4, y);
    ctx.lineTo(x + r + 4, y);
    ctx.moveTo(x, y - r - 4);
    ctx.lineTo(x, y + r + 4);
    ctx.stroke();

    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'left';
    ctx.fillText('CoM', x + r + 6, y + 3);
    ctx.restore();
  }

  drawCoT(x, y) {
    const ctx = this.ctx;
    ctx.save();
    // Purple Thrust Vector Arrow pointing straight up through the engine nozzle
    ctx.strokeStyle = '#c084fc';
    ctx.fillStyle = '#c084fc';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x, y + 22);
    ctx.lineTo(x, y - 10);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(x, y - 16);
    ctx.lineTo(x - 5, y - 8);
    ctx.lineTo(x + 5, y - 8);
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CoT', x + 8, y + 3);
    ctx.restore();
  }

  drawHolographicSnapBracket(cx, cy, scale, category) {
    const ctx = this.ctx;
    ctx.save();
    let targetY = cy;
    let targetW = 60 * scale;
    let targetH = 40 * scale;

    if (category === 'nose') {
      targetY = cy - 145 * scale;
      targetH = 50 * scale;
    } else if (category === 'upperStage') {
      targetY = cy - 90 * scale;
      targetH = 45 * scale;
    } else if (category === 'mainTank') {
      targetY = cy - 25 * scale;
      targetH = 80 * scale;
    } else if (category === 'engine') {
      targetY = cy + 45 * scale;
      targetH = 40 * scale;
    } else if (category === 'booster') {
      targetY = cy - 20 * scale;
      targetW = 110 * scale;
      targetH = 75 * scale;
    } else if (category === 'wings') {
      targetY = cy + 30 * scale;
      targetW = 95 * scale;
      targetH = 35 * scale;
    } else if (category === 'upgrade') {
      targetY = cy - 35 * scale;
      targetW = 75 * scale;
      targetH = 40 * scale;
    }

    // Holographic Cyan Pulse Bracket
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    const left = cx - targetW / 2;
    const top = targetY - targetH / 2;
    ctx.strokeRect(left, top, targetW, targetH);
    ctx.setLineDash([]);

    // Glowing corner brackets
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.5;
    const clen = 8;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(left, top + clen);
    ctx.lineTo(left, top);
    ctx.lineTo(left + clen, top);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(left + targetW - clen, top);
    ctx.lineTo(left + targetW, top);
    ctx.lineTo(left + targetW, top + clen);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(left, top + targetH - clen);
    ctx.lineTo(left, top + targetH);
    ctx.lineTo(left + clen, top + targetH);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(left + targetW - clen, top + targetH);
    ctx.lineTo(left + targetW, top + targetH);
    ctx.lineTo(left + targetW, top + targetH - clen);
    ctx.stroke();

    ctx.restore();
  }

  drawBlueprintGrid(w, h) {
    const ctx = this.ctx;
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h));
    bgGrad.addColorStop(0, '#122554');
    bgGrad.addColorStop(0.6, '#0f1d3f');
    bgGrad.addColorStop(1, '#091024');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const step = 28;

    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.58, 140, 0, Math.PI * 2);
    ctx.arc(w / 2, h * 0.58, 220, 0, Math.PI * 2);
    ctx.stroke();
  }
}
