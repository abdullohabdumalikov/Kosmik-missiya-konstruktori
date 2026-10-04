// Ready-Made Pre-Assembled Rocket Fleet Catalog
// Allows players to purchase and pilot iconic historical and legendary rockets

import { sound } from './audio.js';
import { api } from './api.js';

export const FLEET_CATALOG = [
  {
    id: 'fleet_aero_scout',
    name: 'Aero-Scout I',
    classType: 'Micro Sounding Rocket',
    desc: 'Nimble atmospheric probe designed for initial telemetry recording and low-altitude research.',
    cost: 0,
    owned: true,
    height: '12m',
    mass: '3,090 kg',
    thrust: '140 kN',
    apogee: '8,000m',
    config: {
      name: 'Aero-Scout I',
      noseId: 'nose_mini_point',
      upperStageId: 'stage_none',
      mainTankId: 'tank_mini_core',
      engineId: 'engine_spark_mini',
      boosterId: 'booster_none',
      supplementaryBooster: 'none',
      wingsId: 'fins_small',
      payloadId: 'payload_mini_beeper'
    }
  },
  {
    id: 'fleet_vostok_cosmo',
    name: 'Vostok Cosmo-Explorer',
    classType: 'Light Orbital Vehicle',
    desc: 'Classic Soviet-era inspired multi-engine launcher capable of breaching the Kármán line into orbit.',
    cost: 480,
    height: '28m',
    mass: '14,200 kg',
    thrust: '1,000 kN',
    apogee: '120,000m (Space)',
    config: {
      name: 'Vostok Cosmo-Explorer',
      noseId: 'nose_aerodynamic',
      upperStageId: 'stage_upper_light',
      mainTankId: 'tank_cryo_medium',
      engineId: 'engine_vector',
      boosterId: 'booster_micro_strap',
      supplementaryBooster: 'srb_2x',
      wingsId: 'fins_delta',
      payloadId: 'payload_suborbital_sensor'
    }
  },
  {
    id: 'fleet_titan_centaur',
    name: 'Titan-Centaur Heavy',
    classType: 'Multistage Deep Probe',
    desc: 'Heavy cryogenic workhorse equipped with high-expansion vacuum bell for interplanetary trajectories.',
    cost: 1800,
    height: '46m',
    mass: '34,500 kg',
    thrust: '2,800 kN',
    apogee: '450,000m (High Orbit)',
    config: {
      name: 'Titan-Centaur Heavy',
      noseId: 'nose_aerodynamic',
      upperStageId: 'stage_centaur',
      mainTankId: 'tank_hypergolic',
      engineId: 'engine_vector',
      boosterId: 'booster_solid_heavy',
      supplementaryBooster: 'srb_2x',
      wingsId: 'fins_delta',
      payloadId: 'payload_weather_satellite'
    }
  },
  {
    id: 'fleet_saturn_apollo',
    name: 'Saturn-V Apollo Moonshot',
    classType: 'Superheavy Lunar Stack',
    desc: 'Legendary three-stage mega-rocket designed to break Earth gravity and reach the deep lunar sphere.',
    cost: 4200,
    height: '62m',
    mass: '58,000 kg',
    thrust: '5,200 kN',
    apogee: '1,200,000m (Deep Void)',
    config: {
      name: 'Saturn-V Apollo Moonshot',
      noseId: 'nose_heatshield',
      upperStageId: 'stage_centaur',
      mainTankId: 'tank_hypergolic',
      engineId: 'engine_aerospike',
      boosterId: 'booster_solid_heavy',
      supplementaryBooster: 'srb_4x',
      wingsId: 'fins_delta',
      payloadId: 'payload_weather_satellite'
    }
  },
  {
    id: 'fleet_starship_titan',
    name: 'Starship Interplanetary',
    classType: 'Next-Gen Stainless Titan',
    desc: 'Full-flow staged combustion methalox superheavy craft engineered for interplanetary voyages.',
    cost: 7500,
    height: '75m',
    mass: '82,000 kg',
    thrust: '7,800 kN',
    apogee: '2,500,000m+ (Interplanetary)',
    config: {
      name: 'Starship Interplanetary',
      noseId: 'nose_heatshield',
      upperStageId: 'stage_centaur',
      mainTankId: 'tank_hypergolic',
      engineId: 'engine_aerospike',
      boosterId: 'booster_solid_heavy',
      supplementaryBooster: 'srb_4x',
      wingsId: 'fins_delta',
      payloadId: 'payload_weather_satellite'
    }
  }
];

export class FleetHangar {
  constructor(app) {
    this.app = app;
    this.ownedFleets = new Set(['fleet_aero_scout']);
  }

  openHangarModal() {
    const modal = document.getElementById('fleet-hangar-modal');
    if (!modal) return;
    this.renderHangarCards();
    modal.style.display = 'flex';
    sound.playClick();
  }

  closeHangarModal() {
    const modal = document.getElementById('fleet-hangar-modal');
    if (modal) modal.style.display = 'none';
  }

  renderHangarCards() {
    const container = document.getElementById('fleet-cards-container');
    if (!container) return;

    container.innerHTML = '';
    const funds = this.app.userData.profile?.funds || 0;

    FLEET_CATALOG.forEach(craft => {
      const isOwned = this.ownedFleets.has(craft.id) || craft.cost === 0;
      const canAfford = funds >= craft.cost;
      const isCurrentlyEquipped = this.app.userData.rocket.name === craft.config.name;

      const card = document.createElement('div');
      card.className = `p-4 rounded-xl border transition-all flex flex-col justify-between ${
        isCurrentlyEquipped
          ? 'bg-blue-950/80 border-blue-400 ring-2 ring-blue-400 shadow-xl'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-600'
      }`;

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">${craft.classType}</span>
            <span class="text-xs font-mono font-bold ${isOwned ? 'text-emerald-400' : 'text-amber-400'}">
              ${isOwned ? 'OWNED IN FLEET' : `Ⓢ ${craft.cost.toLocaleString()}K`}
            </span>
          </div>

          <h4 class="text-base font-extrabold text-white mt-1">${craft.name}</h4>
          <p class="text-xs text-slate-400 mt-1 leading-relaxed">${craft.desc}</p>

          <div class="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300 my-3 p-2 rounded-lg bg-slate-950/80 border border-slate-800">
            <div><span class="text-slate-500">Mass:</span> ${craft.mass}</div>
            <div><span class="text-slate-500">Thrust:</span> ${craft.thrust}</div>
            <div><span class="text-slate-500">Height:</span> ${craft.height}</div>
            <div><span class="text-slate-500">Apogee:</span> <span class="text-cyan-300">${craft.apogee}</span></div>
          </div>
        </div>

        <div class="pt-2">
          <button class="btn-fleet-action w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            isCurrentlyEquipped
              ? 'bg-blue-600 text-white cursor-default'
              : isOwned
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                : canAfford
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }">
            ${isCurrentlyEquipped
              ? 'CURRENT FLAGSHIP'
              : isOwned
                ? 'DEPLOY FLEET CRAFT'
                : canAfford
                  ? `PURCHASE & DEPLOY (${craft.cost}K)`
                  : `NEED ${craft.cost - funds}K MORE FUNDS`}
          </button>
        </div>
      `;

      const actionBtn = card.querySelector('.btn-fleet-action');
      actionBtn.addEventListener('click', async () => {
        if (isCurrentlyEquipped) return;

        if (isOwned) {
          // Equip vehicle
          this.deployVehicle(craft);
        } else if (canAfford) {
          // Buy vehicle
          try {
            this.app.userData.profile.funds -= craft.cost;
            this.ownedFleets.add(craft.id);
            await api.updateProfile({ funds: this.app.userData.profile.funds });
            this.app.updateHeaderMetrics();
            sound.playCraftSuccess();
            this.deployVehicle(craft);
          } catch (err) {
            alert('Purchase failed: ' + err.message);
          }
        }
      });

      container.appendChild(card);
    });
  }

  async deployVehicle(craft) {
    this.app.userData.rocket = { ...craft.config };
    await api.saveRocket(this.app.userData.rocket);
    sound.playEquip();

    this.app.designer.renderPartsShop();
    this.app.designer.renderChecklistSummary();
    this.app.designer.updateDropSlotLabels();
    this.closeHangarModal();
  }
}
