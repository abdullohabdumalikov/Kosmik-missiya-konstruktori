// Random Space Events Engine
// Generates rare, exciting in-flight events that demand player reaction or award bonuses

export class SpaceEventManager {
  constructor() {
    this.activeEvent = null;
    this.eventCooldown = 15; // seconds minimum between checks
    this.timeSinceLastEvent = 0;
    this.hasTriggeredThisFlight = false;
  }

  reset() {
    this.activeEvent = null;
    this.timeSinceLastEvent = 0;
    this.hasTriggeredThisFlight = false;
  }

  update(dt, flightState) {
    this.timeSinceLastEvent += dt;

    // Check if an event is currently active
    if (this.activeEvent) {
      this.activeEvent.duration -= dt;
      if (this.activeEvent.duration <= 0) {
        const finished = this.activeEvent;
        this.activeEvent = null;
        return { type: 'event_ended', event: finished };
      }
      return { type: 'event_active', event: this.activeEvent };
    }

    // Only 1 event per launch max, and only with ~30% probability after reaching 6,000m
    if (this.hasTriggeredThisFlight) return null;
    if (flightState.altitude < 6000 || this.timeSinceLastEvent < this.eventCooldown) return null;

    // Roll low probability check every few seconds
    const roll = Math.random();
    if (roll < 0.08) { // 8% chance per check tick after 6,000m
      this.hasTriggeredThisFlight = true;
      this.activeEvent = this.selectEventForAltitude(flightState.altitude);
      return { type: 'event_started', event: this.activeEvent };
    }

    return null;
  }

  selectEventForAltitude(alt) {
    if (alt < 35000) {
      // Atmospheric events
      const atmosphericEvents = [
        {
          id: 'jet_stream_shear',
          name: 'Jet Stream Wind Shear',
          type: 'warning',
          desc: 'Violent high-altitude crosswinds! Counter-steer with A / D to maintain trajectory!',
          duration: 5.5,
          effect: 'wind_shear',
          direction: Math.random() > 0.5 ? 1 : -1
        },
        {
          id: 'engine_resonance',
          name: 'Acoustic Combustion Spike',
          type: 'info',
          desc: 'Transient oxidizer resonance detected. Minor vibration, auto-stabilized.',
          duration: 4.0,
          effect: 'vibration'
        }
      ];
      return atmosphericEvents[Math.floor(Math.random() * atmosphericEvents.length)];
    } else {
      // Space & Orbital events
      const spaceEvents = [
        {
          id: 'solar_flare_boost',
          name: 'Solar Ion Tailwind',
          type: 'bonus',
          desc: 'Energized coronal plasma surge detected! Ionizing thrust increased by 30%!',
          duration: 6.0,
          effect: 'boost_surge'
        },
        {
          id: 'space_debris_warning',
          name: 'Orbital Debris Fragment',
          type: 'danger',
          desc: 'Defunct satellite fragment crossing flight path! Steer clear of center!',
          duration: 5.0,
          effect: 'debris_dodge'
        },
        {
          id: 'science_telemetry',
          name: 'Anomalous Magnetosphere Telemetry',
          type: 'bonus',
          desc: 'Sensors captured pristine radiation belt data packet! +35 Science & +150K Funds!',
          duration: 5.0,
          effect: 'telemetry_bounty'
        }
      ];
      return spaceEvents[Math.floor(Math.random() * spaceEvents.length)];
    }
  }
}

export const spaceEvents = new SpaceEventManager();
