// Flight Physics & Simulation Engine
// Fixed zero-fuel thrust logic, strictly ballistic coasting after depletion, and collision physics

export const ALTITUDE_ZONES = [
  { id: 1, name: 'Zone 1 · Launch Complex & Ground', min: 0, max: 2500, skyTop: '#38bdf8', skyBottom: '#93c5fd', density: 1.0 },
  { id: 2, name: 'Zone 2 · Lower Troposphere', min: 2500, max: 8000, skyTop: '#0284c7', skyBottom: '#38bdf8', density: 0.75 },
  { id: 3, name: 'Zone 3 · Upper Atmosphere & Jet Stream', min: 8000, max: 18000, skyTop: '#1e3a8a', skyBottom: '#0369a1', density: 0.45 },
  { id: 4, name: 'Zone 4 · Stratosphere & Ozone Layer', min: 18000, max: 35000, skyTop: '#0f172a', skyBottom: '#1e3a8a', density: 0.20 },
  { id: 5, name: 'Zone 5 · Mesosphere & Atmospheric Glow', min: 35000, max: 60000, skyTop: '#080d1a', skyBottom: '#172554', density: 0.08 },
  { id: 6, name: 'Zone 6 · Kármán Line & Space Edge', min: 60000, max: 100000, skyTop: '#030712', skyBottom: '#0e1d3d', density: 0.02 },
  { id: 7, name: 'Zone 7 · Low Earth Orbit & Satellites', min: 100000, max: 250000, skyTop: '#020617', skyBottom: '#040b1e', density: 0.003 },
  { id: 8, name: 'Zone 8 · High Orbit & Lunar Vista', min: 250000, max: 600000, skyTop: '#01040e', skyBottom: '#020617', density: 0.0005 },
  { id: 9, name: 'Zone 9 · Deep Space Asteroid Belt', min: 600000, max: 1500000, skyTop: '#000208', skyBottom: '#01040e', density: 0.0 },
  { id: 10, name: 'Zone 10 · Interplanetary Void', min: 1500000, max: Infinity, skyTop: '#000000', skyBottom: '#02020a', density: 0.0 }
];

export const MILESTONE_FLAGS = [
  { altitude: 1000, label: '1,000 m', name: 'Sounding Apex' },
  { altitude: 5000, label: '5,000 m', name: 'Cloud Piercer' },
  { altitude: 10000, label: '10,000 m', name: 'Cruising Jet Altitude' },
  { altitude: 25000, label: '25,000 m', name: 'Ozone Layer Peak' },
  { altitude: 50000, label: '50,000 m', name: 'Mesospheric Gate' },
  { altitude: 100000, label: '100,000 m', name: 'KÁRMÁN LINE · SPACE!' },
  { altitude: 250000, label: '250,000 m', name: 'Low Orbit Station' },
  { altitude: 500000, label: '500,000 m', name: 'Radiation Belt Threshold' },
  { altitude: 1000000, label: '1,000,000 m', name: 'Deep Gravitational Escape' }
];

export class FlightSimulation {
  constructor(rocketStats, bestRecord = 0, currentGoal = 10000) {
    this.stats = rocketStats;
    this.bestRecord = bestRecord;
    this.currentGoal = currentGoal;

    // Flight Dynamics
    this.altitude = 0; // meters
    this.verticalSpeed = 0; // m/s
    this.horizontalPos = 0; // -180 to +180 relative offset
    this.horizontalSpeed = 0; // m/s
    this.angle = 0; // radians
    this.angularVelocity = 0;
    this.gimbal = 0;

    // Fuel State
    this.hasUpperStage = rocketStats.hasUpperStage && rocketStats.stage2.fuel > 0;
    this.stage = 1;
    this.stage1Fuel = rocketStats.stage1.fuel;
    this.stage1MaxFuel = rocketStats.stage1.fuel;
    this.stage2Fuel = this.hasUpperStage ? rocketStats.stage2.fuel : 0;
    this.stage2MaxFuel = this.hasUpperStage ? rocketStats.stage2.fuel : 0;
    this.integrity = 100; // 0 to 100%

    this.throttle = 1.0;
    this.targetThrottle = 1.0;
    this.isBoosting = false;
    this.steerInput = 0;

    // Spaceflight Simulator Parachute & Re-entry Systems
    this.isParachuteDeployed = false;
    this.parachuteProgress = 0;
    this.isTouchdown = false;
    this.reentryHeat = 0;
    this.dodgeStreak = 0;

    // Upgrades Integration
    this.upgrade = rocketStats.upgrade || null;
    this.shieldCharges = (this.upgrade && this.upgrade.shieldCharge) ? this.upgrade.shieldCharge : 0;
    this.magnetRadius = (this.upgrade && this.upgrade.magnetRadius) ? this.upgrade.magnetRadius : 0;
    this.maneuverBonus = (this.upgrade && this.upgrade.maneuverBonus) ? this.upgrade.maneuverBonus : 1.0;

    // Stage Separation
    this.isSeparating = false;
    this.separationProgress = 0;

    // Flight metrics
    this.maxAltitude = 0;
    this.maxSpeed = 0;
    this.flightTime = 0;
    this.isFinished = false;
    this.passedMilestones = new Set();
    this.recordBrokenTriggered = false;
    this.goalAchievedTriggered = false;

    //shake effect when hit by asteroid
    this.shakeIntensity = 0;
    this.isOutOfFuel = false;
    this.apogeeReached = false;
    this.apogeeTimer = 0;
    this.coinsCollected = 0;
    this.fuelCellsCollected = 0;
    this.asteroidsDodged = 0;
  }

  getCurrentZone() {
    for (let i = ALTITUDE_ZONES.length - 1; i >= 0; i--) {
      if (this.altitude >= ALTITUDE_ZONES[i].min) {
        return ALTITUDE_ZONES[i];
      }
    }
    return ALTITUDE_ZONES[0];
  }

  getAtmosphericDensity() {
    if (this.altitude >= 100000) return 0;
    return Math.exp(-this.altitude / 14000);
  }

  setThrottle(val) {
    this.targetThrottle = Math.max(0, Math.min(1, Number(val) || 0));
  }

  deployParachute() {
    if (!this.isParachuteDeployed) {
      this.isParachuteDeployed = true;
      this.parachuteProgress = 0;
    }
  }

  update(dt) {
    if (this.isFinished) return this.getState();

    this.flightTime += dt;
    const density = this.getAtmosphericDensity();

    // Smooth throttle adjustment (Spaceflight Simulator responsive throttle control)
    this.throttle += (this.targetThrottle - this.throttle) * Math.min(1, dt * 10);

    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 3);
    }

    // 1. FUEL & ACTIVE ENGINE THRUST (Variable throttle & strict zero-fuel cutoff)
    let activeThrust = 0;
    let currentFuelPercent = 0;

    if (this.stage === 1) {
      if (this.stage1Fuel > 0 && this.throttle > 0.01) {
        const burnMultiplier = this.isBoosting ? 1.6 : 1.0;
        const fuelConsumption = this.stats.stage1.burnRate * this.throttle * burnMultiplier * dt;
        this.stage1Fuel = Math.max(0, this.stage1Fuel - fuelConsumption);
        
        const thrustBoost = this.isBoosting ? 1.4 : 1.0;
        activeThrust = this.stats.stage1.thrust * thrustBoost * this.throttle;
        currentFuelPercent = (this.stage1Fuel / this.stage1MaxFuel) * 100;
      } else if (this.stage1Fuel <= 0) {
        // Stage 1 is fully empty!
        this.stage1Fuel = 0;
        activeThrust = 0;
        currentFuelPercent = 0;

        if (this.hasUpperStage) {
          this.startStageSeparation();
        } else {
          // Single stage out of fuel!
          this.throttle = 0;
          this.isOutOfFuel = true;
        }
      } else {
        // Throttle idle
        activeThrust = 0;
        currentFuelPercent = (this.stage1Fuel / this.stage1MaxFuel) * 100;
      }
    } else if (this.stage === 2) {
      if (this.hasUpperStage && this.stage2Fuel > 0 && this.throttle > 0.01) {
        const burnMultiplier = this.isBoosting ? 1.5 : 1.0;
        const fuelConsumption = this.stats.stage2.burnRate * this.throttle * burnMultiplier * dt;
        this.stage2Fuel = Math.max(0, this.stage2Fuel - fuelConsumption);

        const thrustBoost = this.isBoosting ? 1.35 : 1.0;
        activeThrust = this.stats.stage2.thrust * thrustBoost * this.throttle;
        currentFuelPercent = (this.stage2Fuel / this.stage2MaxFuel) * 100;
      } else if (this.stage2Fuel <= 0) {
        // Stage 2 fuel fully exhausted -> strictly 0 thrust & cutoff!
        this.stage2Fuel = 0;
        this.throttle = 0;
        activeThrust = 0;
        currentFuelPercent = 0;
        this.isOutOfFuel = true;
      } else {
        activeThrust = 0;
        currentFuelPercent = (this.stage2Fuel / this.stage2MaxFuel) * 100;
      }
    }

    // Advance stage separation animation
    if (this.isSeparating) {
      this.separationProgress += dt * 2.2;
      if (this.separationProgress >= 1.0) {
        this.isSeparating = false;
        this.separationProgress = 1.0;
      }
    }

    // 2. MASS COMPUTATION
    const activeStageFuel = (this.stage === 1)
      ? (this.stage1Fuel + this.stage2Fuel)
      : this.stage2Fuel;
    const currentDryMass = (this.stage === 1)
      ? (this.stats.stage1.dryMass + this.stats.stage2.dryMass)
      : this.stats.stage2.dryMass;
    const currentTotalMass = Math.max(80, currentDryMass + activeStageFuel);

    // 3. STEERING & GIMBAL FORCES
    const targetGimbal = this.steerInput * 0.65 * (this.maneuverBonus || 1.0);
    this.gimbal += (targetGimbal - this.gimbal) * Math.min(1, dt * 10);

    const steeringTorque = this.gimbal * (activeThrust > 0 ? 2.5 : 0.9) * (this.stats.stability || 1.15);
    const aeroRestoring = -this.angle * density * 3.5 * (this.stats.stability || 1.15);
    const angularDamping = -this.angularVelocity * (2.0 + density * 2.5);

    this.angularVelocity += (steeringTorque + aeroRestoring + angularDamping) * dt;
    this.angle += this.angularVelocity * dt;
    this.angle = Math.max(-0.65, Math.min(0.65, this.angle));

    // Horizontal velocity
    const horizontalThrust = (activeThrust * 1000) * Math.sin(this.angle);
    const horizontalDrag = -0.5 * density * Math.sign(this.horizontalSpeed) * (this.horizontalSpeed ** 2) * 2.0;
    const horizontalAcc = (horizontalThrust + horizontalDrag) / currentTotalMass;

    this.horizontalSpeed += horizontalAcc * dt;
    this.horizontalPos += this.horizontalSpeed * dt;
    this.horizontalPos = Math.max(-175, Math.min(175, this.horizontalPos));

    // 4. VERTICAL FORCES & BALLISTIC GRAVITY
    const thrustForce = (activeThrust * 1000) * Math.cos(this.angle);
    const gravityForce = currentTotalMass * (9.81 * Math.pow(6371000 / (6371000 + this.altitude), 2));
    let dragForce = 0.5 * density * (this.verticalSpeed ** 2) * (this.stats.aeroScore || 0.8) * 3.8;

    // Parachute Aerodynamics (Spaceflight Simulator recovery system)
    if (this.isParachuteDeployed) {
      this.parachuteProgress = Math.min(1.0, this.parachuteProgress + dt * 0.85);
      const chuteArea = 160 * this.parachuteProgress;
      const chuteDrag = 0.5 * Math.max(0.15, density) * (this.verticalSpeed ** 2) * chuteArea;
      dragForce += chuteDrag;

      if (this.verticalSpeed < 0) {
        // Slow descent smoothly down to safe touchdown speed ~ -7.5 m/s
        const decel = (chuteDrag / currentTotalMass) * dt;
        this.verticalSpeed = Math.min(-7.5, this.verticalSpeed + decel);
      }
    }

    const netVerticalForce = thrustForce - gravityForce - (this.verticalSpeed > 0 ? dragForce : -dragForce);
    const verticalAcc = netVerticalForce / currentTotalMass;

    this.verticalSpeed += verticalAcc * dt;
    this.altitude += this.verticalSpeed * dt;

    if (this.altitude <= 0 && this.flightTime > 3) {
      this.altitude = 0;
      if (this.isParachuteDeployed && this.verticalSpeed >= -18) {
        this.isTouchdown = true;
      }
      this.finishFlight();
    }

    if (this.altitude > this.maxAltitude) {
      this.maxAltitude = Math.round(this.altitude);
    }
    const currentSpeed = Math.round(Math.hypot(this.verticalSpeed, this.horizontalSpeed));
    if (currentSpeed > this.maxSpeed) {
      this.maxSpeed = currentSpeed;
    }

    // Spaceflight Simulator Hypersonic Re-entry Bow Shock Plasma Glow
    this.reentryHeat = (currentSpeed > 450 && density > 0.04)
      ? Math.min(1.0, ((currentSpeed - 450) / 750) * Math.min(1.0, density * 2.2))
      : 0;

    // Record check
    let isNewRecordThisTick = false;
    if (this.bestRecord > 400 && this.altitude > this.bestRecord && !this.recordBrokenTriggered) {
      this.recordBrokenTriggered = true;
      isNewRecordThisTick = true;
    }

    // Goal check
    let isGoalAchieved = false;
    if (this.currentGoal > 0 && this.altitude >= this.currentGoal && !this.goalAchievedTriggered) {
      this.goalAchievedTriggered = true;
      isGoalAchieved = true;
    }

    // Milestones check
    let newMilestone = null;
    for (const flag of MILESTONE_FLAGS) {
      if (this.altitude >= flag.altitude && !this.passedMilestones.has(flag.altitude)) {
        this.passedMilestones.add(flag.altitude);
        newMilestone = flag;
      }
    }

    // Ballistic Apogee Detection & Mission Conclusion
    // When all fuel is exhausted, the rocket coasts up to its highest peak (apogee).
    // If parachute is deployed, let it descend to touchdown. Otherwise conclude at apex.
    const allFuelGone = this.stage1Fuel <= 0 && (!this.hasUpperStage || this.stage2Fuel <= 0);
    if (allFuelGone) {
      this.isOutOfFuel = true;
      this.throttle = 0;
      if (this.verticalSpeed <= 0 && this.flightTime > 4) {
        this.apogeeReached = true;
        this.apogeeTimer += dt;
        // If no parachute deployed and already coasting downwards for 2.5s, conclude
        if (!this.isParachuteDeployed && this.apogeeTimer >= 2.2) {
          this.finishFlight();
        }
      }
    }

    // Hull integrity failure check
    if (this.integrity <= 0) {
      this.integrity = 0;
      this.finishFlight();
    }

    return this.getState(isNewRecordThisTick, isGoalAchieved, newMilestone, currentSpeed, activeThrust, currentFuelPercent);
  }

  separateStage() {
    if (this.hasUpperStage && this.stage === 1 && !this.isSeparating) {
      this.startStageSeparation();
      return true;
    }
    return false;
  }

  applyAsteroidImpact() {
    if (this.shieldCharges > 0) {
      this.shieldCharges--;
      this.shakeIntensity = 0.5;
      return { absorbed: true };
    }
    this.integrity = Math.max(0, this.integrity - 25);
    this.shakeIntensity = 1.0;
    this.dodgeStreak = 0;
    this.horizontalSpeed += (Math.random() - 0.5) * 60;
    this.angularVelocity += (Math.random() - 0.5) * 1.2;
    return { absorbed: false };
  }

  recordAsteroidDodge() {
    this.asteroidsDodged++;
    this.dodgeStreak++;
    return this.dodgeStreak;
  }

  applyOrbBoost() {
    // Collect energetic plasma orb: +20% fuel recharge
    this.fuelCellsCollected++;
    if (this.stage === 1) {
      this.stage1Fuel = Math.min(this.stage1MaxFuel, this.stage1Fuel + this.stage1MaxFuel * 0.20);
      this.isOutOfFuel = false;
      this.throttle = 1.0;
    } else if (this.stage === 2 && this.hasUpperStage) {
      this.stage2Fuel = Math.min(this.stage2MaxFuel, this.stage2Fuel + this.stage2MaxFuel * 0.25);
      this.isOutOfFuel = false;
      this.throttle = 1.0;
    }
  }

  applyRepairNanobots() {
    this.integrity = Math.min(100, this.integrity + 30);
  }

  applyCoinCrate(amount = 1500) {
    this.coinsCollected += amount;
  }

  startStageSeparation() {
    if (this.stage === 1 && !this.isSeparating) {
      this.stage = 2;
      this.isSeparating = true;
      this.separationProgress = 0;
      this.throttle = 1.0;
    }
  }

  finishFlight() {
    this.isFinished = true;
  }

  getState(isNewRecord = false, isGoalAchieved = false, milestone = null, speed = 0, thrust = 0, fuelPercent = 0) {
    const isOutOfFuel = this.stage1Fuel <= 0 && (!this.hasUpperStage || this.stage2Fuel <= 0);
    return {
      altitude: Math.round(this.altitude),
      maxAltitude: this.maxAltitude,
      speed: speed || Math.round(Math.hypot(this.verticalSpeed, this.horizontalSpeed)),
      verticalSpeed: Math.round(this.verticalSpeed),
      fuelPercent: Math.round(fuelPercent),
      thrust: Math.round(thrust),
      throttle: this.throttle,
      targetThrottle: this.targetThrottle,
      isParachuteDeployed: this.isParachuteDeployed,
      parachuteProgress: this.parachuteProgress,
      isTouchdown: this.isTouchdown,
      reentryHeat: this.reentryHeat,
      dodgeStreak: this.dodgeStreak,
      stability: Math.max(10, Math.round((1 - Math.abs(this.angle) / 0.65) * 100)),
      integrity: Math.round(this.integrity),
      stage: this.stage,
      hasUpperStage: this.hasUpperStage,
      isOutOfFuel,
      apogeeReached: this.apogeeReached,
      coinsCollected: this.coinsCollected,
      fuelCellsCollected: this.fuelCellsCollected,
      zone: this.getCurrentZone(),
      isSeparating: this.isSeparating,
      separationProgress: this.separationProgress,
      isFinished: this.isFinished,
      isNewRecord,
      isGoalAchieved,
      milestone,
      shakeIntensity: this.shakeIntensity,
      currentGoal: this.currentGoal,
      distanceToGoal: Math.max(0, Math.round(this.currentGoal - this.altitude))
    };
  }
}
