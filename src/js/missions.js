// Space Missions & Exploration Contracts System

export const MISSIONS = [
  {
    id: 'mission_suborbital_sounding',
    title: 'Project Zenith · Troposphere Sounding',
    category: 'Suborbital',
    desc: 'Launch a meteorological probe through the dense troposphere to gather temperature and atmospheric barometric gradients.',
    requiredAltitude: 5000,
    requiredPayload: 'payload_suborbital_sensor',
    minReliability: 85,
    rewardFunds: 350,
    rewardScience: 20,
    badge: '🌤️'
  },
  {
    id: 'mission_karman_breach',
    title: 'Project Karman · First Space Boundary',
    category: 'Edge of Space',
    desc: 'Surpass 100,000 meters into hard vacuum and deploy science instrumentation above the Earth atmosphere.',
    requiredAltitude: 100000,
    requiredPayload: 'payload_suborbital_sensor',
    minReliability: 90,
    rewardFunds: 750,
    rewardScience: 45,
    badge: '🌌'
  },
  {
    id: 'mission_weather_network',
    title: 'Nimbus-I · Meteorological Orbit',
    category: 'Orbital Insertion',
    desc: 'Inject the Nimbus multi-spectral satellite into sustained Low Earth Orbit for global weather analysis.',
    requiredAltitude: 180000,
    requiredPayload: 'payload_weather_satellite',
    minReliability: 92,
    rewardFunds: 1200,
    rewardScience: 75,
    badge: '🛰️'
  },
  {
    id: 'mission_high_orbit_relay',
    title: 'Astra-Com · Deep Space Telemetry Array',
    category: 'High Orbit',
    desc: 'Deliver a high-gain radio telemetry payload past 350,000 meters to establish interplanetary comms.',
    requiredAltitude: 350000,
    requiredPayload: 'payload_weather_satellite',
    minReliability: 94,
    rewardFunds: 2100,
    rewardScience: 120,
    badge: '📡'
  },
  {
    id: 'mission_deep_space_probe',
    title: 'Voyager Pioneer · Heliospheric Recon',
    category: 'Deep Space',
    desc: 'Hurl the nuclear-powered Voyager Pioneer probe beyond 800,000 meters into deep interplanetary space.',
    requiredAltitude: 800000,
    requiredPayload: 'payload_deep_space_probe',
    minReliability: 95,
    rewardFunds: 3800,
    rewardScience: 240,
    badge: '🪐'
  }
];

export function getMissionById(id) {
  return MISSIONS.find(m => m.id === id) || MISSIONS[0];
}

export function checkMissionFeasibility(mission, rocketStats) {
  const issues = [];
  
  if (rocketStats.payload.key !== mission.requiredPayload) {
    issues.push(`Incorrect payload equipped (Requires: ${mission.requiredPayload})`);
  }

  if (rocketStats.launchReliability < mission.minReliability) {
    issues.push(`Reliability ${rocketStats.launchReliability}% is below mission threshold of ${mission.minReliability}%`);
  }

  // Check if rocket can reach the required altitude roughly based on TWR and fuel
  const estMaxAltitude = estimateRocketMaxAltitude(rocketStats);
  if (estMaxAltitude < mission.requiredAltitude * 0.75) {
    issues.push(`Rocket delta-V might be insufficient for ${mission.requiredAltitude.toLocaleString()}m`);
  }

  return {
    feasible: issues.length === 0,
    issues,
    estimatedMaxAltitude: estMaxAltitude
  };
}

export function estimateRocketMaxAltitude(stats) {
  // Analytical approximation based on burn time, TWR, mass fraction, and drag
  const s1Dv = Math.log(stats.totalMass / stats.stage1.dryMass) * 2800;
  const s2Dv = Math.log(stats.stage2.dryMass / (stats.stage2.dryMass - stats.stage2.fuel * 0.8)) * 3400;
  const totalDv = s1Dv + s2Dv;
  const estAlt = Math.round(Math.max(1000, Math.pow(totalDv * 0.22, 1.85) * (stats.twr > 1.2 ? 1.0 : 0.6)));
  return estAlt;
}
