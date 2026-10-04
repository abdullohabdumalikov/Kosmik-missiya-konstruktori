// Complete Rocket Components Database & Balance Progression
// Includes Starter Mini-Rocket parts up to Heavy Orbital Stages

export const RARITIES = {
  common: { name: 'Standard', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', border: '#64748b' },
  uncommon: { name: 'Advanced', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.12)', border: '#22c55e' },
  rare: { name: 'Prototype', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: '#0284c7' },
  epic: { name: 'Military-Spec', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: '#9333ea' },
  legendary: { name: 'Experimental', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)', border: '#d97706' }
};

export const PARTS_CATALOG = {
  // --- 1. NOSE CONES ---
  nose_mini_point: {
    key: 'nose_mini_point',
    category: 'nose',
    name: 'Micro-Cone Alpha',
    desc: 'Ultra-light needle fairing for sounding test rockets. Minimal drag profile.',
    baseMass: 60,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 98,
    baseCost: 35,
    baseBuildMonths: 1,
    aerodynamics: 0.95,
    visual: { type: 'needle', height: 45, width: 26 }
  },
  nose_aerodynamic: {
    key: 'nose_aerodynamic',
    category: 'nose',
    name: 'Aero-Cone Mark I',
    desc: 'Parabolic payload shroud with passive acoustic damping insulation.',
    baseMass: 250,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 96,
    baseCost: 90,
    baseBuildMonths: 2,
    aerodynamics: 0.90,
    visual: { type: 'ogive', height: 65, width: 36 }
  },
  nose_heatshield: {
    key: 'nose_heatshield',
    category: 'nose',
    name: 'Ablative Ceramic Shroud',
    desc: 'Heavy reinforced nose cone for hypersonic orbital atmospheric entry.',
    baseMass: 550,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 99,
    baseCost: 220,
    baseBuildMonths: 4,
    aerodynamics: 0.85,
    visual: { type: 'blunt', height: 75, width: 44 }
  },

  // --- 2. UPPER STAGES ---
  stage_none: {
    key: 'stage_none',
    category: 'upperStage',
    name: 'None (Single Stage)',
    desc: 'Direct single-stage-to-orbit / sounding configuration. Zero upper dry mass.',
    baseMass: 0,
    baseThrust: 0,
    baseFuel: 0,
    burnRate: 0,
    baseReliability: 100,
    baseCost: 0,
    baseBuildMonths: 0,
    targetOrbit: 'Suborbital & Low Apex',
    visual: null
  },
  stage_upper_light: {
    key: 'stage_upper_light',
    category: 'upperStage',
    name: 'Centaur Vacuum Upper',
    desc: 'Restartable vacuum stage with hydrolox expansion nozzle for orbital insertion.',
    baseMass: 850,
    baseThrust: 180,
    baseFuel: 1200,
    burnRate: 22,
    baseReliability: 95,
    baseCost: 280,
    baseBuildMonths: 4,
    targetOrbit: 'Low & Medium Orbit',
    visual: { height: 60, width: 34 }
  },
  stage_centaur: {
    key: 'stage_centaur',
    category: 'upperStage',
    name: 'Ares Deep-Vacuum Stage',
    desc: 'Heavy cryogenic stage optimized for lunar flybys and interplanetary trajectories.',
    baseMass: 1800,
    baseThrust: 420,
    baseFuel: 2800,
    burnRate: 36,
    baseReliability: 97,
    baseCost: 550,
    baseBuildMonths: 6,
    targetOrbit: 'Deep Space & Planetary',
    visual: { height: 85, width: 40 }
  },

  // --- 3. MAIN TANKS ---
  tank_mini_core: {
    key: 'tank_mini_core',
    category: 'mainTank',
    name: 'Micro Methalox Tank',
    desc: 'Compact pressurized propellant tank. Ideal for nimble sounding flights.',
    baseMass: 450,
    baseThrust: 0,
    baseFuel: 2400,
    baseReliability: 98,
    baseCost: 65,
    baseBuildMonths: 1,
    visual: { height: 90, width: 28 }
  },
  tank_cryo_medium: {
    key: 'tank_cryo_medium',
    category: 'mainTank',
    name: 'Mid-Class Cryo Tank',
    desc: 'Rigid orthogrid core tank with automated internal helium pressurization.',
    baseMass: 1500,
    baseThrust: 0,
    baseFuel: 8500,
    baseReliability: 97,
    baseCost: 240,
    baseBuildMonths: 3,
    visual: { height: 135, width: 38 }
  },
  tank_hypergolic: {
    key: 'tank_hypergolic',
    category: 'mainTank',
    name: 'Heavy Falcon Core Tank',
    desc: 'Superdense cryogenic core holding vast oxidizer reserves for high-apogee flights.',
    baseMass: 3400,
    baseThrust: 0,
    baseFuel: 18000,
    baseReliability: 96,
    baseCost: 580,
    baseBuildMonths: 5,
    visual: { height: 185, width: 44 }
  },

  // --- 4. ENGINES ---
  engine_spark_mini: {
    key: 'engine_spark_mini',
    category: 'engine',
    name: 'Spark-85 Turbopump',
    desc: 'Lightweight agile thruster with high sea-level efficiency and rapid spool-up.',
    baseMass: 160,
    baseThrust: 140, // kN
    burnRate: 18,
    baseReliability: 98,
    baseCost: 75,
    baseBuildMonths: 1,
    gimbalTorque: 1.2,
    visual: { nozzleCount: 1, bellSize: 16 }
  },
  engine_vector: {
    key: 'engine_vector',
    category: 'engine',
    name: 'Merlin-V Gimbal Engine',
    desc: 'Powerful single-chamber rocket engine with electro-hydraulic thrust vectoring.',
    baseMass: 650,
    baseThrust: 680,
    burnRate: 64,
    baseReliability: 97,
    baseCost: 290,
    baseBuildMonths: 3,
    gimbalTorque: 1.0,
    visual: { nozzleCount: 1, bellSize: 24 }
  },
  engine_aerospike: {
    key: 'engine_aerospike',
    category: 'engine',
    name: 'Linear Aerospike Cluster',
    desc: 'Altitude-compensating engine that maintains peak thrust from sea level to vacuum.',
    baseMass: 1200,
    baseThrust: 1600,
    burnRate: 110,
    baseReliability: 95,
    baseCost: 650,
    baseBuildMonths: 5,
    gimbalTorque: 1.3,
    visual: { nozzleCount: 3, bellSize: 20 }
  },

  // --- 5. BOOSTERS ---
  booster_none: {
    key: 'booster_none',
    category: 'booster',
    name: 'No Side Boosters',
    desc: 'Single core configuration. Clean aerodynamic profile and minimum liftoff weight.',
    baseMass: 0,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 100,
    baseCost: 0,
    baseBuildMonths: 0,
    visual: null
  },
  booster_micro_strap: {
    key: 'booster_micro_strap',
    category: 'booster',
    name: 'Twin Solid Strapons',
    desc: 'Lightweight composite solid boosters providing initial 15-second liftoff kick.',
    baseMass: 600,
    baseThrust: 320,
    baseFuel: 1400,
    burnRate: 65,
    baseReliability: 97,
    baseCost: 110,
    baseBuildMonths: 1,
    visual: { count: 2, height: 80, width: 14 }
  },
  booster_solid_heavy: {
    key: 'booster_solid_heavy',
    category: 'booster',
    name: 'Castor Segmented Boosters',
    desc: 'High-thrust heavy solid rocket boosters to catapult payloads into the stratosphere.',
    baseMass: 2400,
    baseThrust: 1450,
    baseFuel: 5200,
    burnRate: 140,
    baseReliability: 96,
    baseCost: 380,
    baseBuildMonths: 3,
    visual: { count: 2, height: 130, width: 18 }
  },

  // --- 6. FINS / WINGS ---
  fins_small: {
    key: 'fins_small',
    category: 'wings',
    name: 'Micro Delta Fins',
    desc: 'Small trapezoidal carbon fins to prevent roll and tumble in dense low air.',
    baseMass: 35,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 99,
    baseCost: 20,
    baseBuildMonths: 1,
    stabilityBonus: 1.15,
    visual: { span: 16 }
  },
  fins_delta: {
    key: 'fins_delta',
    category: 'wings',
    name: 'Swept Carbon Aero-Fins',
    desc: 'Aero stabilizers designed to dampen high-speed atmospheric wind shear.',
    baseMass: 110,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 99,
    baseCost: 65,
    baseBuildMonths: 2,
    stabilityBonus: 1.35,
    visual: { span: 24 }
  },

  // --- 7. PAYLOADS ---
  payload_mini_beeper: {
    key: 'payload_mini_beeper',
    category: 'payload',
    name: 'Beacon Telemetry Probe',
    desc: 'Miniature transmitter transmitting altitude telemetry back to ground antennas.',
    baseMass: 35,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 99,
    baseCost: 25,
    baseBuildMonths: 1,
    minAltitude: 2000,
    missionValue: 120,
    visual: { icon: 'beacon' }
  },
  payload_suborbital_sensor: {
    key: 'payload_suborbital_sensor',
    category: 'payload',
    name: 'Atmospheric Sensor Suite',
    desc: 'Scientific package measuring barometric density, cosmic ray flux, and temperature.',
    baseMass: 140,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 97,
    baseCost: 80,
    baseBuildMonths: 2,
    minAltitude: 15000,
    missionValue: 350,
    visual: { icon: 'sensor' }
  },
  payload_weather_satellite: {
    key: 'payload_weather_satellite',
    category: 'payload',
    name: 'Nimbus Orbital Satellite',
    desc: 'Infrared imaging satellite for long-term orbital observation.',
    baseMass: 420,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 96,
    baseCost: 240,
    baseBuildMonths: 4,
    minAltitude: 80000,
    missionValue: 800,
    visual: { icon: 'satellite' }
  },

  // --- 8. UPGRADES & AVIONICS ---
  upgrade_none: {
    key: 'upgrade_none',
    category: 'upgrade',
    name: 'No Module Slot',
    desc: 'Empty avionics bay. Standard flight computer without specialized boosts.',
    baseMass: 0,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 100,
    baseCost: 0,
    baseBuildMonths: 0,
    visual: null
  },
  upgrade_rcs: {
    key: 'upgrade_rcs',
    category: 'upgrade',
    name: 'RCS Lateral Thrusters',
    desc: 'Cold-gas quads granting +80% faster dodging response against cosmic asteroids.',
    baseMass: 40,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 98,
    baseCost: 85,
    baseBuildMonths: 1,
    maneuverBonus: 1.8,
    stabilityBonus: 1.15,
    visual: { type: 'rcs' }
  },
  upgrade_magnet: {
    key: 'upgrade_magnet',
    category: 'upgrade',
    name: 'Magnetic Salvage Harpoon',
    desc: 'Grav-tether actively attracting gold crates, fuel cells, and nanobots from 260m.',
    baseMass: 60,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 97,
    baseCost: 110,
    baseBuildMonths: 2,
    magnetRadius: 260,
    visual: { type: 'magnet' }
  },
  upgrade_shield: {
    key: 'upgrade_shield',
    category: 'upgrade',
    name: 'Ablative Kinetic Shield',
    desc: 'Reinforced ceramic matrix absorbing 1 high-speed asteroid collision without damage.',
    baseMass: 110,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 99,
    baseCost: 140,
    baseBuildMonths: 2,
    shieldCharge: 1,
    visual: { type: 'shield' }
  },
  upgrade_turbo: {
    key: 'upgrade_turbo',
    category: 'upgrade',
    name: 'Cryo Turbopump Overclock',
    desc: 'Supercharges fuel injection rate, boosting core engine thrust by +25%.',
    baseMass: 90,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 96,
    baseCost: 160,
    baseBuildMonths: 3,
    thrustMultiplier: 1.25,
    visual: { type: 'turbo' }
  },
  upgrade_titanium: {
    key: 'upgrade_titanium',
    category: 'upgrade',
    name: 'Lightweight Titanium Lattice',
    desc: 'Superalloy framing that shaves 20% off total rocket dry structural mass.',
    baseMass: 0,
    baseThrust: 0,
    baseFuel: 0,
    baseReliability: 99,
    baseCost: 175,
    baseBuildMonths: 3,
    massReduction: 0.80,
    visual: { type: 'titanium' }
  }
};

export const SUPPLEMENTARY_BOOSTERS = {
  none: { key: 'none', name: 'None', mass: 0, thrust: 0, fuel: 0, burnRate: 0, cost: 0 },
  srb_2x: { key: 'srb_2x', name: '2x Micro SRBs', mass: 450, thrust: 220, fuel: 900, burnRate: 45, cost: 60 },
  srb_4x: { key: 'srb_4x', name: '4x Micro SRBs', mass: 900, thrust: 440, fuel: 1800, burnRate: 90, cost: 120 }
};

export function getPartStats(partKey, level = 1) {
  const base = PARTS_CATALOG[partKey];
  if (!base) return null;
  const lvl = Math.max(1, Math.min(5, level));

  const statMult = 1 + (lvl - 1) * 0.35;
  const massMult = Math.max(0.7, 1 - (lvl - 1) * 0.075);
  const relBonus = (lvl - 1) * 2;

  const rarityKeys = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const rarity = rarityKeys[lvl - 1];

  return {
    ...base,
    level: lvl,
    rarity,
    rarityMeta: RARITIES[rarity],
    mass: Math.round(base.baseMass * massMult),
    thrust: Math.round(base.baseThrust * statMult),
    fuel: Math.round(base.baseFuel * statMult),
    burnRate: base.burnRate ? Math.round(base.burnRate * (1 + (lvl - 1) * 0.15)) : 0,
    reliability: Math.min(99, base.baseReliability + relBonus),
    cost: Math.round(base.baseCost * (1 + (lvl - 1) * 0.4)),
    buildMonths: Math.max(1, base.baseBuildMonths)
  };
}

export function calculateRocketStats(rocketConfig, userInventory = []) {
  const getEquippedLevel = (partKey) => {
    const item = userInventory.find(i => i.partKey === partKey);
    return item ? item.level : 1;
  };

  const nose = getPartStats(rocketConfig.noseId, getEquippedLevel(rocketConfig.noseId)) || getPartStats('nose_mini_point', 1);
  const upper = rocketConfig.upperStageId && rocketConfig.upperStageId !== 'stage_none'
    ? getPartStats(rocketConfig.upperStageId, getEquippedLevel(rocketConfig.upperStageId))
    : null;
  const tank = getPartStats(rocketConfig.mainTankId, getEquippedLevel(rocketConfig.mainTankId)) || getPartStats('tank_mini_core', 1);
  const engine = getPartStats(rocketConfig.engineId, getEquippedLevel(rocketConfig.engineId)) || getPartStats('engine_spark_mini', 1);
  const booster = rocketConfig.boosterId && rocketConfig.boosterId !== 'booster_none'
    ? getPartStats(rocketConfig.boosterId, getEquippedLevel(rocketConfig.boosterId))
    : null;
  const supplementary = SUPPLEMENTARY_BOOSTERS[rocketConfig.supplementaryBooster] || SUPPLEMENTARY_BOOSTERS.none;
  const wings = getPartStats(rocketConfig.wingsId, getEquippedLevel(rocketConfig.wingsId)) || getPartStats('fins_small', 1);
  const payload = getPartStats(rocketConfig.payloadId, getEquippedLevel(rocketConfig.payloadId)) || getPartStats('payload_mini_beeper', 1);
  const upgrade = rocketConfig.upgradeId && rocketConfig.upgradeId !== 'upgrade_none'
    ? getPartStats(rocketConfig.upgradeId, getEquippedLevel(rocketConfig.upgradeId))
    : null;

  // Upgrade bonuses
  const thrustMult = upgrade && upgrade.thrustMultiplier ? upgrade.thrustMultiplier : 1.0;
  const dryMassMult = upgrade && upgrade.massReduction ? upgrade.massReduction : 1.0;

  // STAGE 1 (Core / Liftoff)
  let stage1DryMass = tank.mass + engine.mass + (booster ? booster.mass : 0) + supplementary.mass + wings.mass + (upgrade ? upgrade.mass : 0);
  stage1DryMass = Math.round(stage1DryMass * dryMassMult);

  const stage1Fuel = tank.fuel + (booster ? booster.fuel : 0) + supplementary.fuel;
  const stage1Thrust = Math.round((engine.thrust + (booster ? booster.thrust : 0) + supplementary.thrust) * thrustMult);
  const stage1BurnRate = engine.burnRate + (booster ? booster.burnRate : 0) + supplementary.burnRate;

  // STAGE 2 (Upper Stage, if installed)
  const hasUpperStage = !!upper;
  let stage2DryMass = hasUpperStage ? (upper.mass + nose.mass + payload.mass) : (nose.mass + payload.mass);
  stage2DryMass = Math.round(stage2DryMass * dryMassMult);

  const stage2Fuel = hasUpperStage ? upper.fuel : 0;
  const stage2Thrust = Math.round((hasUpperStage ? upper.thrust : 0) * thrustMult);
  const stage2BurnRate = hasUpperStage ? upper.burnRate : 0;

  const totalDryMass = stage1DryMass + stage2DryMass;
  const totalFuel = stage1Fuel + stage2Fuel;
  const totalMass = totalDryMass + totalFuel;

  const stage1BurnDuration = stage1BurnRate > 0 ? (stage1Fuel / stage1BurnRate) : 25;
  const stage2BurnDuration = stage2BurnRate > 0 ? (stage2Fuel / stage2BurnRate) : 0;

  const twr = totalMass > 0 ? (stage1Thrust * 1000) / (totalMass * 9.81) : 0;

  const partsList = [nose, tank, engine, wings, payload];
  if (upper) partsList.push(upper);
  if (booster) partsList.push(booster);
  if (upgrade) partsList.push(upgrade);

  const avgReliability = Math.round(
    partsList.reduce((acc, p) => acc + (p.reliability || 90), 0) / partsList.length
  );

  const payloadReliability = Math.round((payload.reliability * 0.7) + ((upper ? upper.reliability : 98) * 0.3));
  const totalBuildMonths = Math.max(...partsList.map(p => p.buildMonths || 1));
  const totalCost = partsList.reduce((acc, p) => acc + (p.cost || 0), 0) + supplementary.cost;
  const aeroScore = (nose.aerodynamics || 0.95) * (1 / (wings.stabilityBonus || 1.15));
  const stability = (wings.stabilityBonus || 1.15) * (engine.gimbalTorque || 1.0) * (upgrade && upgrade.stabilityBonus ? upgrade.stabilityBonus : 1.0);

  return {
    nose,
    upper,
    hasUpperStage,
    tank,
    engine,
    booster,
    supplementary,
    wings,
    payload,
    upgrade,
    totalMass,
    totalDryMass,
    totalFuel,
    totalCost,
    totalBuildMonths,
    launchReliability: avgReliability,
    payloadReliability,
    twr: Number(twr.toFixed(2)),
    aeroScore: Number(aeroScore.toFixed(2)),
    stability: Number(stability.toFixed(2)),
    stage1: {
      dryMass: stage1DryMass,
      fuel: stage1Fuel,
      thrust: stage1Thrust,
      burnRate: stage1BurnRate,
      duration: Math.round(stage1BurnDuration)
    },
    stage2: {
      dryMass: stage2DryMass,
      fuel: stage2Fuel,
      thrust: stage2Thrust,
      burnRate: stage2BurnRate,
      duration: Math.round(stage2BurnDuration)
    }
  };
}
