// Playable 2D Vertical Rocket Flight Engine
// Rich environmental background objects, active asteroid dodging, energy orbs, funny space easter-eggs, and live goal tracking

import { FlightSimulation, MILESTONE_FLAGS } from './physics.js';
import { calculateRocketStats } from './parts-data.js';
import { rocketRenderer } from './rocket-renderer.js';
import { spaceEvents } from './events.js';
import { sound } from './audio.js';
import { api } from './api.js';

export class FlightEngine {
  constructor(app) {
    this.app = app;
    this.canvas = null;
    this.ctx = null;
    this.sim = null;
    this.stats = null;
    this.running = false;
    this.countdownTimer = 3;
    this.countdownActive = false;
    this.lastFrameTime = 0;
    this.animId = null;

    // Environmental entities
    this.stars = [];
    this.clouds = [];
    this.smokeParticles = [];
    this.asteroids = [];
    this.energyOrbs = [];
    this.funnyObjects = [];
    this.birds = [];
    this.jetCruiser = null;
    this.spaceStation = null;

    this.keys = {
      left: false,
      right: false,
      boost: false
    };

    this.activeEventNotification = null;
    this.radioChatterQueue = [];
    this.activeChatter = null;
  }

  init() {
    this.canvas = document.getElementById('flight-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }

    this.bindInputs();
    this.generateWorldEntities();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    }
  }

  bindInputs() {
    window.addEventListener('keydown', (e) => {
      if (!this.running) return;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;
      if (e.code === 'Space') {
        this.keys.boost = true;
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
      if (e.code === 'Space') this.keys.boost = false;
    });

    const btnLeft = document.getElementById('hud-btn-left');
    const btnRight = document.getElementById('hud-btn-right');
    const btnBoost = document.getElementById('hud-btn-boost');

    if (btnLeft) {
      btnLeft.addEventListener('pointerdown', () => this.keys.left = true);
      btnLeft.addEventListener('pointerup', () => this.keys.left = false);
    }
    if (btnRight) {
      btnRight.addEventListener('pointerdown', () => this.keys.right = true);
      btnRight.addEventListener('pointerup', () => this.keys.right = false);
    }
    if (btnBoost) {
      btnBoost.addEventListener('pointerdown', () => this.keys.boost = true);
      btnBoost.addEventListener('pointerup', () => this.keys.boost = false);
    }

    const abortBtn = document.getElementById('hud-abort-flight');
    if (abortBtn) {
      abortBtn.addEventListener('click', () => {
        if (this.sim && !this.sim.isFinished) {
          this.sim.finishFlight();
        }
      });
    }

    const debriefCloseBtn = document.getElementById('btn-debrief-continue');
    if (debriefCloseBtn) {
      debriefCloseBtn.addEventListener('click', () => {
        document.getElementById('flight-debrief-modal').style.display = 'none';
        this.app.switchView('designer');
      });
    }
  }

  generateWorldEntities() {
    // 300 Stars with multi-spectral colors
    this.stars = [];
    const starColors = ['#ffffff', '#bae6fd', '#fef08a', '#fbcfe8', '#a7f3d0'];
    for (let i = 0; i < 300; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random(),
        radius: 0.6 + Math.random() * 1.8,
        alpha: 0.35 + Math.random() * 0.65,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        twinkleSpeed: 1 + Math.random() * 4
      });
    }

    // Clouds with volume shading
    this.clouds = [];
    for (let i = 0; i < 32; i++) {
      this.clouds.push({
        x: (Math.random() - 0.5) * 800,
        alt: 600 + Math.random() * 22000,
        width: 150 + Math.random() * 220,
        height: 50 + Math.random() * 50,
        alpha: 0.35 + Math.random() * 0.4
      });
    }

    // Commercial Passenger Jet crossing at 10,500m
    this.jetCruiser = {
      alt: 10500,
      x: -450,
      speed: 95
    };

    // Stratospheric Weather Research Balloon at 26,000m
    this.weatherBalloon = {
      alt: 26000,
      x: 120,
      sway: 0
    };

    // Scattering birds near pad
    this.birds = [];
    for (let i = 0; i < 10; i++) {
      this.birds.push({
        x: (Math.random() - 0.5) * 250,
        alt: 80 + Math.random() * 600,
        vx: (Math.random() > 0.5 ? 1 : -1) * (45 + Math.random() * 35),
        vy: 18 + Math.random() * 22,
        flap: Math.random() * Math.PI
      });
    }

    // ISS-style space station at 160,000m
    this.spaceStation = {
      alt: 160000,
      x: -160,
      speed: 40
    };

    // Passing orbital spy satellite at 72,000m
    this.orbitalSatellite = {
      alt: 72000,
      x: 140,
      speed: -55
    };

    // Deep Space Space-Telescope at 380,000m
    this.spaceTelescope = {
      alt: 380000,
      x: -110,
      speed: 25
    };

    // DENSE ACTIVE ASTEROIDS (Starting early at 18,000m all the way to 1,800,000m)
    this.asteroids = [];
    for (let i = 0; i < 95; i++) {
      this.asteroids.push({
        x: (Math.random() - 0.5) * 350,
        alt: 18000 + Math.random() * 1600000,
        size: 18 + Math.random() * 36,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 2.5,
        driftVx: (Math.random() - 0.5) * 32,
        vertices: this.generateAsteroidShape(8),
        hit: false
      });
    }

    // FLOATING GOLD BOUNTY CRATES (Rewarding active steering!)
    this.goldCrates = [];
    for (let i = 0; i < 35; i++) {
      this.goldCrates.push({
        x: (Math.random() - 0.5) * 320,
        alt: 5000 + Math.random() * 1500000,
        amount: Math.random() > 0.6 ? 3000 : 1500,
        collected: false,
        bobAngle: Math.random() * Math.PI * 2
      });
    }

    // Collectible Plasma Energy Orbs (fuel recharge)
    this.energyOrbs = [];
    for (let i = 0; i < 35; i++) {
      this.energyOrbs.push({
        x: (Math.random() - 0.5) * 300,
        alt: 4000 + Math.random() * 1200000,
        radius: 13,
        collected: false,
        pulse: Math.random() * Math.PI
      });
    }

    // Collectible Hull Repair Nanobot Pods
    this.repairPods = [];
    for (let i = 0; i < 20; i++) {
      this.repairPods.push({
        x: (Math.random() - 0.5) * 290,
        alt: 25000 + Math.random() * 1300000,
        radius: 12,
        collected: false,
        pulse: Math.random() * Math.PI
      });
    }

    // Quirky / Funny Space Objects (Kerbal spirit easter eggs!)
    this.funnyObjects = [
      {
        alt: 22000,
        x: -95,
        icon: '🍕',
        name: 'Orbital Pizza Slice',
        chatter: 'Sensors detect cheese bubbling in the stratosphere! Still warm!'
      },
      {
        alt: 42000,
        x: 80,
        icon: '☕',
        name: 'Chief Engineer\'s Mug',
        chatter: 'Houston: "Found it! Chief engineer left his coffee in near-space!"'
      },
      {
        alt: 85000,
        x: 105,
        icon: '🐹',
        name: 'Cosmonaut Hamster Bob',
        chatter: 'Hamster Bob in mini-bubble: "Squeak! Beautiful rocket, Director!"'
      },
      {
        alt: 220000,
        x: -75,
        icon: '🚽',
        name: 'Golden Orbital Commode',
        chatter: 'Telemetry: "Luxury zero-g titanium commode detected in low orbit!"'
      },
      {
        alt: 550000,
        x: 110,
        icon: '🚗',
        name: 'Red Electric Roadster',
        chatter: 'Radio: "Is that an electric convertible blasting Bowie on orbital radio?!"'
      },
      {
        alt: 950000,
        x: -90,
        icon: '🛸',
        name: 'Friendly Alien Diplomat',
        chatter: 'Alien over comms: "Greetings Earthlings! 10/10 rocket design, very stylish!"'
      }
    ];
  }

  generateAsteroidShape(points = 8) {
    const verts = [];
    for (let i = 0; i < points; i++) {
      const a = (i / points) * Math.PI * 2;
      const r = 0.7 + Math.random() * 0.5;
      verts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    return verts;
  }

  startFlight() {
    this.stats = calculateRocketStats(this.app.userData.rocket, this.app.userData.inventory);
    const bestRecord = this.app.userData.records?.highestAltitude || 0;
    const currentGoal = this.app.getActiveMission()?.requiredAltitude || (bestRecord > 0 ? bestRecord + 10000 : 8000);

    this.sim = new FlightSimulation(this.stats, bestRecord, currentGoal);
    spaceEvents.reset();

    this.running = true;
    this.countdownActive = true;
    this.countdownTimer = 3;
    this.smokeParticles = [];
    this.activeEventNotification = null;
    this.radioChatterQueue = [];
    this.activeChatter = null;

    const countdownEl = document.getElementById('flight-countdown-overlay');
    const countdownNum = document.getElementById('flight-countdown-number');
    if (countdownEl) countdownEl.style.display = 'flex';
    if (countdownNum) countdownNum.textContent = '3';

    sound.playCountdownBeep(false);

    const interval = setInterval(() => {
      this.countdownTimer -= 1;
      if (this.countdownTimer > 0) {
        if (countdownNum) countdownNum.textContent = String(this.countdownTimer);
        sound.playCountdownBeep(false);
      } else if (this.countdownTimer === 0) {
        if (countdownNum) countdownNum.textContent = 'IGNITION!';
        sound.playCountdownBeep(true);
        sound.playIgnitionBoom();
        sound.startEngineRoar();
      } else {
        clearInterval(interval);
        this.countdownActive = false;
        if (countdownEl) countdownEl.style.display = 'none';
        this.triggerComicalChatter('Ground Control: "Hold onto your potatoes, we have liftoff!"');
      }
    }, 1000);

    this.lastFrameTime = performance.now();
    this.loop();
  }

  loop() {
    if (!this.running) return;

    const now = performance.now();
    const dt = Math.min(0.08, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    if (!this.countdownActive) {
      let steer = 0;
      if (this.keys.left) steer -= 1;
      if (this.keys.right) steer += 1;
      this.sim.steerInput = steer;
      this.sim.isBoosting = this.keys.boost && (this.sim.stage1Fuel > 0 || this.sim.stage2Fuel > 0);

      const state = this.sim.update(dt);

      // 1. Strict Engine Roar / Out of Fuel Handling
      const isFiring = (this.sim.stage === 1 && this.sim.stage1Fuel > 0) || (this.sim.stage === 2 && this.sim.stage2Fuel > 0);
      const mecoBanner = document.getElementById('hud-meco-banner');

      if (!isFiring || state.isOutOfFuel) {
        sound.stopEngineRoar();
        if (mecoBanner) mecoBanner.style.display = 'block';
      } else {
        sound.updateEngineRoar(this.sim.throttle, this.sim.isBoosting);
        if (mecoBanner) mecoBanner.style.display = 'none';
      }

      // Stage Separation Trigger
      if (state.isSeparating && state.separationProgress < 0.1) {
        sound.playStageSeparation();
        this.showTransientNotification(`STAGE SEPARATION CONFIRMED!`, 'info');
        this.triggerComicalChatter('Director: "First stage jettisoned cleanly! Stage 2, ignite!"');
      }

      // Record & Goal Achievements
      if (state.isNewRecord) {
        sound.playRecordTrumpet();
        this.showNewRecordBanner(state.altitude);
        this.triggerComicalChatter('Houston: "WE HAVE A NEW AGENCY RECORD! Drinks on the Director tonight!"');
      }

      if (state.isGoalAchieved) {
        sound.playDiscoveryFanfare();
        this.showTransientNotification(`🎯 TARGET GOAL REACHED! (${state.currentGoal.toLocaleString()}m)`, 'milestone');
        this.triggerComicalChatter('Mission Control: "Target flight contract altitude accomplished! Contract bonuses secured!"');
      }

      if (state.milestone) {
        this.showTransientNotification(`FLAG: ${state.milestone.label} - ${state.milestone.name}`, 'milestone');
      }

      // Update background moving entities
      if (this.jetCruiser) this.jetCruiser.x += this.jetCruiser.speed * dt;
      if (this.spaceStation) this.spaceStation.x += this.spaceStation.speed * dt;
      if (this.orbitalSatellite) this.orbitalSatellite.x += this.orbitalSatellite.speed * dt;
      if (this.spaceTelescope) this.spaceTelescope.x += this.spaceTelescope.speed * dt;
      this.birds.forEach(b => {
        b.x += b.vx * dt;
        b.alt += b.vy * dt;
      });

      // 2. Active Asteroids Collision & Radar Warning
      const rocketX = this.sim.horizontalPos;
      let hasNearAsteroid = false;

      this.asteroids.forEach(a => {
        a.angle += a.rotSpeed * dt;
        a.x += a.driftVx * dt;

        // Collision check
        const distY = Math.abs(a.alt - state.altitude);
        const distX = Math.abs(a.x - rocketX);

        // Warning radar check
        if (!a.hit && (a.alt - state.altitude) > 0 && (a.alt - state.altitude) < 2800 && distX < 120) {
          hasNearAsteroid = true;
        }

        if (!a.hit && distY < 22 && distX < a.size * 0.8 + 18) {
          a.hit = true;
          const hitRes = this.sim.applyAsteroidImpact();
          sound.playAsteroidHit();
          if (hitRes && hitRes.absorbed) {
            this.showTransientNotification('🛡️ KINETIC SHIELD ABSORBED ASTEROID COLLISION!', 'bonus');
            this.triggerComicalChatter('Pilot: "Direct asteroid hit absorbed by the kinetic shield! Deflectors holding!"');
          } else {
            this.triggerComicalChatter('Pilot: "BAM! Direct asteroid impact on heatshield! Steer with [A / D] to evade!"');
          }
        }
      });

      const warnBanner = document.getElementById('hud-asteroid-warning');
      if (warnBanner) {
        warnBanner.style.display = hasNearAsteroid ? 'block' : 'none';
      }

      // Magnetic Salvage Harpoon Upgrade (Pulls nearby collectibles)
      const magnetRadius = this.sim.magnetRadius || 0;
      if (magnetRadius > 0) {
        this.goldCrates.forEach(crate => {
          if (!crate.collected && Math.hypot(crate.alt - state.altitude, crate.x - rocketX) < magnetRadius) {
            crate.x += Math.sign(rocketX - crate.x) * 160 * dt;
            crate.alt += Math.sign(state.altitude - crate.alt) * 160 * dt;
          }
        });
        this.energyOrbs.forEach(orb => {
          if (!orb.collected && Math.hypot(orb.alt - state.altitude, orb.x - rocketX) < magnetRadius) {
            orb.x += Math.sign(rocketX - orb.x) * 160 * dt;
            orb.alt += Math.sign(state.altitude - orb.alt) * 160 * dt;
          }
        });
        this.repairPods.forEach(pod => {
          if (!pod.collected && Math.hypot(pod.alt - state.altitude, pod.x - rocketX) < magnetRadius) {
            pod.x += Math.sign(rocketX - pod.x) * 160 * dt;
            pod.alt += Math.sign(state.altitude - pod.alt) * 160 * dt;
          }
        });
      }

      // 3. Collectible Floating Gold Bounty Crates (+1,500K - +3,000K Coins)
      this.goldCrates.forEach(crate => {
        if (!crate.collected) {
          crate.bobAngle += dt * 3;
          const distY = Math.abs(crate.alt - state.altitude);
          const distX = Math.abs(crate.x - rocketX);
          if (distY < 26 && distX < 30) {
            crate.collected = true;
            this.sim.applyCoinCrate(crate.amount);
            sound.playCoinCollect();
            this.showTransientNotification(`+Ⓢ ${crate.amount.toLocaleString()}K ORBITAL GOLD CRATE!`, 'bonus');
          }
        }
      });

      // 4. Collectible Plasma Energy Orbs (Fuel recharge)
      this.energyOrbs.forEach(orb => {
        if (!orb.collected) {
          const distY = Math.abs(orb.alt - state.altitude);
          const distX = Math.abs(orb.x - rocketX);
          if (distY < 26 && distX < 28) {
            orb.collected = true;
            this.sim.applyOrbBoost();
            sound.playEquip();
            this.showTransientNotification('+PLASMA BOOST CELL! (+20% Fuel)', 'bonus');
          }
        }
      });

      // 5. Collectible Nanobot Repair Pods (+30% Integrity)
      this.repairPods.forEach(pod => {
        if (!pod.collected) {
          const distY = Math.abs(pod.alt - state.altitude);
          const distX = Math.abs(pod.x - rocketX);
          if (distY < 26 && distX < 28) {
            pod.collected = true;
            this.sim.applyRepairNanobots();
            sound.playEquip();
            this.showTransientNotification('+NANOBOT HULL REPAIR! (+30% Integrity)', 'bonus');
          }
        }
      });

      // 6. Quirky / Funny Space Objects
      this.funnyObjects.forEach(obj => {
        if (!obj.encountered && Math.abs(obj.alt - state.altitude) < 32) {
          obj.encountered = true;
          this.sim.applyCoinCrate(2500);
          sound.playDiscoveryFanfare();
          this.triggerComicalChatter(`${obj.name}: "${obj.chatter}" (+2,500K Bonus!)`);
        }
      });

      // 7. Periodic Comical Radio Chatter (Kerbal / Mars Horizon vibe)
      this.chatterTimer = (this.chatterTimer || 0) + dt;
      if (this.chatterTimer > 12) {
        this.chatterTimer = 0;
        this.triggerRandomRadioChatter(state);
      }

      // Exhaust Smoke particles (only when engines are active!)
      if (isFiring && Math.random() < 0.75) {
        this.smokeParticles.push({
          x: this.sim.horizontalPos + (Math.random() - 0.5) * 8,
          y: 40,
          vy: 90 + Math.random() * 140 + Math.max(0, this.sim.verticalSpeed * 0.35),
          vx: (Math.random() - 0.5) * 16,
          radius: 8 + Math.random() * 6,
          maxRadius: 28 + Math.random() * 14,
          alpha: 0.65
        });
      }

      for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
        const p = this.smokeParticles[i];
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        p.radius += (p.maxRadius - p.radius) * dt * 3;
        p.alpha -= dt * 0.8;
        if (p.alpha <= 0 || p.y > 600) {
          this.smokeParticles.splice(i, 1);
        }
      }

      this.updateHUD(state);

      if (state.isFinished) {
        this.concludeFlight();
        return;
      }
    }

    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  triggerComicalChatter(text) {
    const box = document.getElementById('hud-comical-chatter');
    const textEl = document.getElementById('hud-chatter-text');
    if (!box) return;
    if (textEl) textEl.textContent = text;
    else box.textContent = text;
    box.style.display = 'flex';
    sound.playRadioChirp();
    if (this.chatterTimeout) clearTimeout(this.chatterTimeout);
    this.chatterTimeout = setTimeout(() => {
      box.style.display = 'none';
    }, 4500);
  }

  triggerRandomRadioChatter(state) {
    const quotes = [
      'Astronaut Bob: "Houston, my floating sandwich just bumped the nav computer!"',
      'Chief Engineer Gribkov: "Telemetry looks nominal! If it vibrates, smile for the press cameras!"',
      'Director: "Remember team: gravity is merely a suggestion, keep burning!"',
      'Copilot: "Mach 5 reached! My mustache is officially hypersonic!"',
      'Mission Control: "Telemetry confirms zero space pigeons were disturbed."',
      'Capsule Comm: "Zero-G is awesome! Floating pickles are surprisingly fast though!"',
      'Launch Director: "Fuel burn is textbook. Don\'t touch the big red button, Bob!"'
    ];
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    this.triggerComicalChatter(q);
  }

  showTransientNotification(text, type = 'info') {
    const banner = document.getElementById('flight-transient-toast');
    if (!banner) return;
    banner.textContent = text;
    banner.className = `fixed top-20 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider shadow-2xl z-50 transition-all ${
      type === 'milestone' || type === 'bonus'
        ? 'bg-emerald-500 text-slate-950 border border-emerald-300'
        : 'bg-blue-600 text-white border border-blue-400'
    }`;
    banner.style.opacity = '1';
    setTimeout(() => { banner.style.opacity = '0'; }, 3000);
  }

  showNewRecordBanner(alt) {
    const el = document.getElementById('flight-record-banner');
    if (el) {
      el.innerHTML = `
        <div class="text-2xl font-black text-amber-300 animate-pulse">🎉 NEW ALTITUDE RECORD! 🎉</div>
        <div class="text-lg font-mono font-bold text-white mt-1">${alt.toLocaleString()} METERS</div>
      `;
      el.style.display = 'block';
      setTimeout(() => { el.style.display = 'none'; }, 4000);
    }
  }

  updateHUD(state) {
    const altEl = document.getElementById('hud-altitude-val');
    const speedEl = document.getElementById('hud-speed-val');
    const fuelEl = document.getElementById('hud-fuel-val');
    const fuelBar = document.getElementById('hud-fuel-bar');
    const thrustEl = document.getElementById('hud-thrust-val');
    const integrityBar = document.getElementById('hud-integrity-bar');
    const integrityText = document.getElementById('hud-stability-val');
    const zoneBadge = document.getElementById('hud-zone-badge');
    const stageBadge = document.getElementById('hud-stage-badge');
    const recordVal = document.getElementById('hud-best-record-val');
    const goalBadge = document.getElementById('hud-flight-goal-badge');
    const lootVal = document.getElementById('hud-loot-val');

    if (altEl) altEl.textContent = `${state.altitude.toLocaleString()} m`;
    if (speedEl) speedEl.textContent = `${state.speed.toLocaleString()} m/s`;
    if (fuelEl) fuelEl.textContent = `${state.fuelPercent}%`;
    if (fuelBar) fuelBar.style.width = `${state.fuelPercent}%`;
    if (thrustEl) thrustEl.textContent = `${state.thrust.toLocaleString()} kN`;
    if (integrityBar) integrityBar.style.width = `${state.integrity}%`;
    if (integrityText) integrityText.textContent = `${state.integrity}%`;
    if (zoneBadge) zoneBadge.textContent = state.zone.name;
    if (stageBadge) stageBadge.textContent = state.hasUpperStage ? `STAGE ${state.stage}` : 'SINGLE STAGE';
    if (recordVal) recordVal.textContent = `${(this.app.userData.records?.highestAltitude || 0).toLocaleString()} m`;
    if (goalBadge) goalBadge.textContent = `🎯 GOAL: ${state.currentGoal.toLocaleString()} m`;
    if (lootVal) lootVal.textContent = `+${(state.coinsCollected || 0).toLocaleString()}K`;
  }

  render() {
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);

    const alt = this.sim.altitude;
    const zone = this.sim.getCurrentZone();

    // 1. DYNAMIC RICH SKY GRADIENT
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, zone.skyTop);
    skyGrad.addColorStop(1, zone.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. STARS (Twinkle & drift in Space)
    const starAlpha = Math.min(1.0, Math.max(0, (alt - 8000) / 30000));
    if (starAlpha > 0.05) {
      ctx.save();
      const now = performance.now() * 0.002;
      this.stars.forEach(s => {
        const screenY = (s.y * height + alt * 0.02) % height;
        const twinkle = 0.7 + Math.sin(now * s.twinkleSpeed) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * starAlpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(s.x * width, screenY, s.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // 3. COSMIC MOON & NEBULAE (In High Orbit & Deep Space)
    if (alt > 35000) {
      ctx.save();
      // Glowing deep space nebula gas dust
      const nebula1 = ctx.createRadialGradient(width * 0.25, height * 0.25, 10, width * 0.25, height * 0.25, 260);
      nebula1.addColorStop(0, 'rgba(168, 85, 247, 0.16)');
      nebula1.addColorStop(0.5, 'rgba(56, 189, 248, 0.08)');
      nebula1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(width * 0.75, height * 0.45, 10, width * 0.75, height * 0.45, 220);
      nebula2.addColorStop(0, 'rgba(236, 72, 153, 0.12)');
      nebula2.addColorStop(0.6, 'rgba(30, 58, 138, 0.08)');
      nebula2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // Glowing Moon Crescent in upper right
      const moonY = Math.max(40, 120 - (alt - 40000) * 0.0003);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(width - 80, moonY, 32, 0, Math.PI * 2);
      ctx.fill();
      // Moon shadow
      ctx.fillStyle = zone.skyTop;
      ctx.beginPath();
      ctx.arc(width - 70, moonY, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Shimmering Aurora Borealis ribbons in upper stratosphere
    if (alt > 18000 && alt < 65000) {
      ctx.save();
      const aGrad = ctx.createLinearGradient(0, height * 0.1, width, height * 0.3);
      aGrad.addColorStop(0, 'rgba(52, 211, 153, 0.15)');
      aGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.22)');
      aGrad.addColorStop(1, 'rgba(167, 139, 250, 0.10)');
      ctx.fillStyle = aGrad;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.15);
      ctx.bezierCurveTo(width * 0.35, height * 0.08, width * 0.65, height * 0.22, width, height * 0.12);
      ctx.lineTo(width, height * 0.28);
      ctx.bezierCurveTo(width * 0.65, height * 0.36, width * 0.35, height * 0.22, 0, height * 0.30);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 4. EARTH HORIZON (Visible in Space > 35,000m)
    if (alt > 35000) {
      ctx.save();
      const curvatureY = height + Math.min(height * 0.85, (alt - 35000) * 0.001);
      const earthRadius = width * 1.5;

      const earthGrad = ctx.createRadialGradient(width / 2, curvatureY + earthRadius * 0.85, earthRadius * 0.8, width / 2, curvatureY, earthRadius);
      earthGrad.addColorStop(0, '#1d4ed8');
      earthGrad.addColorStop(0.35, '#0284c7');
      earthGrad.addColorStop(0.9, 'rgba(56, 189, 248, 0.45)');
      earthGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(width / 2, curvatureY + earthRadius, earthRadius, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Camera Center
    const rocketScreenX = width / 2 + this.sim.horizontalPos;
    const rocketScreenY = height * 0.62;

    // 5. DISTANT MOUNTAIN SILHOUETTES AT GROUND LEVEL
    if (alt < 15000) {
      ctx.save();
      const mountainY = rocketScreenY + 70 + alt * 0.35;
      ctx.fillStyle = '#1e3a5f';
      ctx.beginPath();
      ctx.moveTo(0, mountainY);
      ctx.lineTo(width * 0.2, mountainY - 70);
      ctx.lineTo(width * 0.45, mountainY - 40);
      ctx.lineTo(width * 0.7, mountainY - 90);
      ctx.lineTo(width, mountainY - 30);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 6. CLOUDS (Falling past rocket)
    if (alt < 30000) {
      ctx.save();
      this.clouds.forEach(c => {
        const cloudScreenY = rocketScreenY - (c.alt - alt) * 0.5;
        if (cloudScreenY > -100 && cloudScreenY < height + 100) {
          ctx.fillStyle = `rgba(255, 255, 255, ${c.alpha})`;
          ctx.beginPath();
          ctx.ellipse(width / 2 + c.x, cloudScreenY, c.width / 2, c.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
    }

    // 7. PASSING PASSENGER JET AT 10,500m
    if (this.jetCruiser && Math.abs(this.jetCruiser.alt - alt) < 2500) {
      ctx.save();
      const jetY = rocketScreenY - (this.jetCruiser.alt - alt) * 0.5;
      const jetX = width / 2 + this.jetCruiser.x;
      // Contrail
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(jetX - 160, jetY);
      ctx.lineTo(jetX, jetY);
      ctx.stroke();
      // Plane silhouette
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(jetX, jetY - 3, 24, 6);
      ctx.fillRect(jetX + 6, jetY - 12, 5, 24);
      ctx.restore();
    }

    // Stratospheric Weather Balloon at 26,000m
    if (this.weatherBalloon && Math.abs(this.weatherBalloon.alt - alt) < 3000) {
      ctx.save();
      const balloonY = rocketScreenY - (this.weatherBalloon.alt - alt) * 0.5;
      const balloonX = width / 2 + this.weatherBalloon.x;
      // White sphere
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(balloonX, balloonY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();
      // String & sensor box
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(balloonX, balloonY + 18);
      ctx.lineTo(balloonX, balloonY + 36);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(balloonX - 5, balloonY + 36, 10, 8);
      ctx.restore();
    }

    // Passing Spy Satellite at 72,000m
    if (this.orbitalSatellite && Math.abs(this.orbitalSatellite.alt - alt) < 3500) {
      ctx.save();
      const satY = rocketScreenY - (this.orbitalSatellite.alt - alt) * 0.5;
      const satX = width / 2 + this.orbitalSatellite.x;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(satX - 8, satY - 5, 16, 10);
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#38bdf8';
      ctx.fillRect(satX - 26, satY - 4, 16, 8);
      ctx.strokeRect(satX - 26, satY - 4, 16, 8);
      ctx.fillRect(satX + 10, satY - 4, 16, 8);
      ctx.strokeRect(satX + 10, satY - 4, 16, 8);
      ctx.restore();
    }

    // ISS Space Station at 160,000m
    if (this.spaceStation && Math.abs(this.spaceStation.alt - alt) < 4000) {
      ctx.save();
      const issY = rocketScreenY - (this.spaceStation.alt - alt) * 0.5;
      const issX = width / 2 + this.spaceStation.x;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(issX - 22, issY - 3, 44, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(issX - 38, issY - 14, 14, 28);
      ctx.fillRect(issX + 24, issY - 14, 14, 28);
      ctx.restore();
    }

    // 8. ACTIVE DRIFTING ASTEROIDS (Avoid with A/D!)
    if (alt > 16000) {
      ctx.save();
      this.asteroids.forEach(a => {
        const asteroidScreenY = rocketScreenY - (a.alt - alt) * 0.5;
        if (asteroidScreenY > -80 && asteroidScreenY < height + 80) {
          ctx.save();
          ctx.translate(width / 2 + a.x, asteroidScreenY);
          ctx.rotate(a.angle);

          // Atmospheric friction ablation glow if lower than 70k
          if (alt < 70000) {
            ctx.fillStyle = 'rgba(249, 115, 22, 0.25)';
            ctx.beginPath();
            ctx.arc(0, 0, a.size * 1.3, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle = a.hit ? '#ef4444' : '#64748b';
          ctx.strokeStyle = a.hit ? '#f87171' : '#334155';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          a.vertices.forEach((v, i) => {
            const vx = v.x * a.size;
            const vy = v.y * a.size;
            if (i === 0) ctx.moveTo(vx, vy);
            else ctx.lineTo(vx, vy);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Craters
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(-a.size * 0.25, -a.size * 0.15, a.size * 0.2, 0, Math.PI * 2);
          ctx.arc(a.size * 0.2, a.size * 0.2, a.size * 0.15, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });
      ctx.restore();
    }

    // 9. COLLECTIBLE FLOATING GOLD BOUNTY CRATES
    ctx.save();
    this.goldCrates.forEach(crate => {
      if (!crate.collected) {
        const crateY = rocketScreenY - (crate.alt - alt) * 0.5;
        if (crateY > -50 && crateY < height + 50) {
          ctx.save();
          ctx.translate(width / 2 + crate.x, crateY);
          // Gold crate
          ctx.fillStyle = '#d97706';
          ctx.fillRect(-12, -12, 24, 24);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-10, -10, 20, 20);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-12, -12, 24, 24);
          // Ⓢ Symbol
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Ⓢ', 0, 0);
          ctx.restore();
        }
      }
    });
    ctx.restore();

    // 10. COLLECTIBLE PLASMA ENERGY ORBS
    ctx.save();
    this.energyOrbs.forEach(orb => {
      if (!orb.collected) {
        const orbY = rocketScreenY - (orb.alt - alt) * 0.5;
        if (orbY > -50 && orbY < height + 50) {
          orb.pulse += 0.05;
          const r = orb.radius + Math.sin(orb.pulse) * 2;
          const oGrad = ctx.createRadialGradient(width / 2 + orb.x, orbY, 2, width / 2 + orb.x, orbY, r);
          oGrad.addColorStop(0, '#ffffff');
          oGrad.addColorStop(0.4, '#4ade80');
          oGrad.addColorStop(1, 'rgba(74, 222, 128, 0)');
          ctx.fillStyle = oGrad;
          ctx.beginPath();
          ctx.arc(width / 2 + orb.x, orbY, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
    ctx.restore();

    // 11. COLLECTIBLE REPAIR NANOBOT PODS
    ctx.save();
    this.repairPods.forEach(pod => {
      if (!pod.collected) {
        const podY = rocketScreenY - (pod.alt - alt) * 0.5;
        if (podY > -50 && podY < height + 50) {
          ctx.save();
          ctx.translate(width / 2 + pod.x, podY);
          ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
          ctx.beginPath();
          ctx.arc(0, 0, pod.radius + 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(0, 0, pod.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🔧', 0, 1);
          ctx.restore();
        }
      }
    });
    ctx.restore();

    // 12. FUNNY / QUIRKY SPACE OBJECTS
    ctx.save();
    this.funnyObjects.forEach(obj => {
      const objY = rocketScreenY - (obj.alt - alt) * 0.5;
      if (objY > -60 && objY < height + 60) {
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obj.icon, width / 2 + obj.x, objY);
      }
    });
    ctx.restore();

    // 11. GROUND LAUNCH PAD (Drops away downwards)
    const groundScreenY = rocketScreenY + 70 + alt * 0.8;
    if (groundScreenY < height + 250) {
      this.drawLaunchComplex(ctx, width, groundScreenY);
    }

    // 12. IN-WORLD MILESTONE FLAGS
    this.drawWorldFlags(ctx, width, height, rocketScreenY, alt);

    // 13. EXHAUST SMOKE BILLOWS
    ctx.save();
    this.smokeParticles.forEach(p => {
      ctx.fillStyle = `rgba(226, 232, 240, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(rocketScreenX + p.x, rocketScreenY + p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 14. ROCKET (With screen shake if hit by asteroid)
    const isEnginesActive = (this.sim.stage === 1 && this.sim.stage1Fuel > 0) || (this.sim.stage === 2 && this.sim.stage2Fuel > 0);
    const shakeOffsetX = (Math.random() - 0.5) * this.sim.shakeIntensity * 16;
    const shakeOffsetY = (Math.random() - 0.5) * this.sim.shakeIntensity * 16;

    rocketRenderer.draw(
      ctx,
      rocketScreenX + shakeOffsetX,
      rocketScreenY + shakeOffsetY,
      1.0,
      this.sim.angle,
      {
        rocketConfig: this.app.userData.rocket,
        stats: this.stats,
        stage: this.sim.stage,
        throttle: isEnginesActive ? this.sim.throttle : 0,
        isBoosting: this.sim.isBoosting,
        gimbal: this.sim.gimbal,
        isSeparating: this.sim.isSeparating,
        jettisonProgress: this.sim.separationProgress,
        showPlume: isEnginesActive && !this.countdownActive
      }
    );
  }

  drawLaunchComplex(ctx, width, groundY) {
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, groundY, width, 400);

    const towerX = width / 2 - 60;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(towerX - 22, groundY - 180, 24, 180);

    ctx.fillStyle = '#475569';
    ctx.fillRect(towerX + 2, groundY - 120, 36, 5);

    // Launch floodlights
    ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.beginPath();
    ctx.moveTo(towerX - 20, groundY - 170);
    ctx.lineTo(towerX + 40, groundY);
    ctx.lineTo(towerX - 80, groundY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawWorldFlags(ctx, width, height, rocketScreenY, currentAlt) {
    ctx.save();

    MILESTONE_FLAGS.forEach(flag => {
      const screenY = rocketScreenY - (flag.altitude - currentAlt) * 0.5;
      if (screenY > -50 && screenY < height + 50) {
        this.renderMilestoneBanner(ctx, width / 2 + 110, screenY, flag.label, flag.name, false);
      }
    });

    const bestRecord = this.app.userData.records?.highestAltitude || 0;
    if (bestRecord > 400) {
      const recordY = rocketScreenY - (bestRecord - currentAlt) * 0.5;
      if (recordY > -50 && recordY < height + 50) {
        this.renderMilestoneBanner(ctx, width / 2 - 190, recordY, `RECORD: ${bestRecord.toLocaleString()} m`, 'Personal Best Record', true);
      }
    }

    const activeGoal = this.sim.currentGoal || (this.app.getActiveMission()?.requiredAltitude || 0);
    if (activeGoal > 500) {
      const goalY = rocketScreenY - (activeGoal - currentAlt) * 0.5;
      if (goalY > -50 && goalY < height + 50) {
        this.renderGoalBanner(ctx, width / 2 - 180, goalY, `🎯 GOAL: ${activeGoal.toLocaleString()} m`, 'Active Mission Target');
      }
    }

    ctx.restore();
  }

  renderGoalBanner(ctx, x, y, label, name) {
    ctx.save();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width / window.devicePixelRatio, y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;

    ctx.fillRect(x, y - 18, 155, 34);
    ctx.strokeRect(x, y - 18, 155, 34);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(label, x + 8, y - 2);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = '9px sans-serif';
    ctx.fillText(name, x + 8, y + 10);

    ctx.restore();
  }

  renderMilestoneBanner(ctx, x, y, label, name, isRecord = false) {
    ctx.save();
    ctx.strokeStyle = isRecord ? '#fbbf24' : 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = isRecord ? 2 : 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width / window.devicePixelRatio, y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = isRecord ? 'rgba(245, 158, 11, 0.95)' : 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = isRecord ? '#fef08a' : '#38bdf8';
    ctx.lineWidth = 1.5;

    ctx.fillRect(x, y - 18, 145, 34);
    ctx.strokeRect(x, y - 18, 145, 34);

    ctx.fillStyle = isRecord ? '#0f172a' : '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(label, x + 8, y - 2);

    ctx.fillStyle = isRecord ? '#451a03' : '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.fillText(name, x + 8, y + 10);

    ctx.restore();
  }

  async concludeFlight() {
    this.running = false;
    sound.stopEngineRoar();

    const maxAlt = this.sim.maxAltitude;
    const maxSpeed = this.sim.maxSpeed;
    const duration = Math.round(this.sim.flightTime);

    const activeMission = this.app.getActiveMission();
    const missionCompleted = activeMission && maxAlt >= activeMission.requiredAltitude;
    const inFlightCoins = this.sim.coinsCollected || 0;

    try {
      const result = await api.completeLaunch({
        altitude: maxAlt,
        flightDuration: duration,
        maxSpeed: maxSpeed,
        missionCompleted,
        inFlightCoins
      });

      this.app.userData.profile = result.profile;
      this.app.userData.records = result.records;
      this.app.userData.inventory = result.inventory;
      this.app.userData.completedMissions = result.completedMissions;
      this.app.updateHeaderMetrics();

      this.showDebriefingModal(result, duration, maxSpeed);
    } catch (err) {
      console.error('Launch reporting failed:', err);
    }
  }

  showDebriefingModal(result, duration, maxSpeed) {
    const modal = document.getElementById('flight-debrief-modal');
    if (!modal) return;

    sound.playDiscoveryFanfare();

    const altEl = document.getElementById('debrief-alt-val');
    const timeEl = document.getElementById('debrief-time-val');
    const speedEl = document.getElementById('debrief-speed-val');
    const fundsEl = document.getElementById('debrief-funds-val');
    const scienceEl = document.getElementById('debrief-science-val');
    const recordBanner = document.getElementById('debrief-record-banner');
    const discoveryBox = document.getElementById('debrief-discovery-box');

    if (altEl) altEl.textContent = `${result.altitude.toLocaleString()} m`;
    if (timeEl) timeEl.textContent = `${duration}s`;
    if (speedEl) speedEl.textContent = `${maxSpeed.toLocaleString()} m/s`;
    if (fundsEl) fundsEl.textContent = `+${result.coinsEarned.toLocaleString()}K`;
    if (scienceEl) scienceEl.textContent = `+${result.scienceEarned}`;

    if (recordBanner) {
      recordBanner.style.display = result.isNewRecord ? 'block' : 'none';
    }

    if (discoveryBox) {
      if (result.discovery) {
        discoveryBox.innerHTML = `
          <div class="p-3.5 rounded-xl border border-amber-500/60 bg-amber-950/30 flex items-center gap-3">
            <div class="w-10 h-10 rounded bg-slate-900 border border-amber-500/40 flex items-center justify-center shrink-0">
              <span class="text-amber-400 font-bold font-mono text-xs">LV ${result.discovery.level}</span>
            </div>
            <div>
              <span class="text-xs font-bold text-amber-300 uppercase tracking-wide">Salvaged Discovery!</span>
              <h4 class="text-xs font-bold text-white mt-0.5">${result.discovery.partKey.replace(/_/g, ' ').toUpperCase()}</h4>
              <p class="text-[11px] text-slate-300 mt-0.5">+1 Added to Component Inventory for crafting & upgrades.</p>
            </div>
          </div>
        `;
      } else {
        discoveryBox.innerHTML = `
          <div class="p-3 text-center text-xs text-slate-500 border border-slate-800 rounded-xl">
            No component salvage recovered on this flight path. Reach higher space zones for greater odds!
          </div>
        `;
      }
    }

    modal.style.display = 'flex';
  }
}
