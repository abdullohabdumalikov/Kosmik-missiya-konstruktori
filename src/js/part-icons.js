// High-quality SVG Vector Graphics Generator for Rocket Parts
// Professional space-agency engineering illustrations (Anti-AI slop, Zero generic emojis)

export function getPartSvg(category, partKey = '', size = 56) {
  const s = size;
  
  // Categorical detailed SVG blueprints
  switch (category) {
    case 'nose':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="noseGrad_${partKey}" x1="16" y1="32" x2="48" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#334155" />
              <stop offset="25%" stop-color="#f8fafc" />
              <stop offset="70%" stop-color="#cbd5e1" />
              <stop offset="100%" stop-color="#475569" />
            </linearGradient>
          </defs>
          <!-- Fairing Ogive Body -->
          <path d="M20 54 C20 32, 26 14, 32 8 C38 14, 44 32, 44 54 Z" fill="url(#noseGrad_${partKey})" stroke="#1e293b" stroke-width="1.5" />
          <!-- Thermal Nose Tip -->
          <path d="M29 14 C30.5 10, 33.5 10, 35 14 Z" fill="#0284c7" />
          <!-- Center Separation Seam -->
          <line x1="32" y1="8" x2="32" y2="54" stroke="#475569" stroke-width="1" stroke-dasharray="2 2" />
          <!-- Fastener Rings -->
          <line x1="20.5" y1="46" x2="43.5" y2="46" stroke="#475569" stroke-width="1" />
          <circle cx="32" cy="38" r="2.5" fill="#0f172a" stroke="#38bdf8" stroke-width="0.8" />
        </svg>
      `;

    case 'mainTank':
    case 'tank':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="tankGrad_${partKey}" x1="18" y1="32" x2="46" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#1e293b" />
              <stop offset="25%" stop-color="#e2e8f0" />
              <stop offset="65%" stop-color="#94a3b8" />
              <stop offset="100%" stop-color="#0f172a" />
            </linearGradient>
          </defs>
          <!-- Tank Cylinder -->
          <rect x="19" y="10" width="26" height="44" rx="2" fill="url(#tankGrad_${partKey})" stroke="#0f172a" stroke-width="1.5" />
          <!-- Ribbing rings -->
          <line x1="19" y1="20" x2="45" y2="20" stroke="#334155" stroke-width="1.2" />
          <line x1="19" y1="34" x2="45" y2="34" stroke="#334155" stroke-width="1.2" />
          <line x1="19" y1="46" x2="45" y2="46" stroke="#334155" stroke-width="1.2" />
          <!-- External Cryo Feed Pipe -->
          <line x1="22" y1="12" x2="22" y2="52" stroke="#38bdf8" stroke-width="1.8" />
          <!-- Roll Marker Stripe -->
          <rect x="36" y="22" width="7" height="10" fill="#0284c7" opacity="0.85" />
        </svg>
      `;

    case 'upperStage':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="upperGrad_${partKey}" x1="20" y1="32" x2="44" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#334155" />
              <stop offset="30%" stop-color="#f8fafc" />
              <stop offset="70%" stop-color="#cbd5e1" />
              <stop offset="100%" stop-color="#1e293b" />
            </linearGradient>
          </defs>
          <!-- Core Housing -->
          <rect x="21" y="14" width="22" height="30" rx="1.5" fill="url(#upperGrad_${partKey})" stroke="#1e293b" stroke-width="1.5" />
          <!-- RCS Thruster Pods -->
          <rect x="18" y="22" width="3" height="5" fill="#0f172a" rx="0.5" />
          <rect x="43" y="22" width="3" height="5" fill="#0f172a" rx="0.5" />
          <!-- Vacuum Expansion Bell -->
          <path d="M26 44 L23 54 L41 54 L38 44 Z" fill="#1e293b" stroke="#f97316" stroke-width="1" />
          <!-- Checkerboard Pattern -->
          <rect x="21" y="14" width="5" height="4" fill="#0f172a" />
          <rect x="31" y="14" width="5" height="4" fill="#0f172a" />
        </svg>
      `;

    case 'engine':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bellGrad_${partKey}" x1="16" y1="36" x2="48" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#090d16" />
              <stop offset="35%" stop-color="#64748b" />
              <stop offset="70%" stop-color="#334155" />
              <stop offset="100%" stop-color="#020617" />
            </linearGradient>
          </defs>
          <!-- Powerhead / Gimbal Ring -->
          <rect x="23" y="12" width="18" height="7" rx="1" fill="#475569" stroke="#1e293b" stroke-width="1.2" />
          <!-- Turbopump Manifold -->
          <ellipse cx="28" cy="19" rx="3" ry="2" fill="#0284c7" />
          <ellipse cx="36" cy="19" rx="3" ry="2" fill="#d97706" />
          <!-- Expansion Nozzle Bell -->
          <path d="M27 21 C27 28, 18 42, 16 50 L48 50 C46 42, 37 28, 37 21 Z" fill="url(#bellGrad_${partKey})" stroke="#0f172a" stroke-width="1.5" />
          <!-- Glowing Throat Ring -->
          <ellipse cx="32" cy="21" rx="5" ry="1.5" fill="#f97316" />
          <!-- Regenerative Cooling Stiffener Rings -->
          <path d="M19 44 C24 46, 40 46, 45 44" stroke="#f97316" stroke-width="1.2" fill="none" opacity="0.8" />
        </svg>
      `;

    case 'booster':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="boostGrad_${partKey}" x1="22" y1="32" x2="42" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#1e293b" />
              <stop offset="30%" stop-color="#ffffff" />
              <stop offset="70%" stop-color="#cbd5e1" />
              <stop offset="100%" stop-color="#334155" />
            </linearGradient>
          </defs>
          <!-- Booster Nose -->
          <path d="M24 18 L32 8 L40 18 Z" fill="#94a3b8" stroke="#1e293b" stroke-width="1.2" />
          <!-- Booster Solid Casing -->
          <rect x="24" y="18" width="16" height="34" fill="url(#boostGrad_${partKey})" stroke="#1e293b" stroke-width="1.2" />
          <!-- Segment Joints -->
          <line x1="24" y1="29" x2="40" y2="29" stroke="#334155" stroke-width="1.2" />
          <line x1="24" y1="41" x2="40" y2="41" stroke="#334155" stroke-width="1.2" />
          <!-- Booster Canted Nozzle -->
          <path d="M27 52 L24 57 L40 57 L37 52 Z" fill="#0f172a" stroke="#d97706" stroke-width="1" />
        </svg>
      `;

    case 'wings':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Left Delta Fin -->
          <path d="M26 18 L10 52 L26 46 Z" fill="#2563eb" stroke="#1d4ed8" stroke-width="1.5" />
          <!-- Right Delta Fin -->
          <path d="M38 18 L54 52 L38 46 Z" fill="#2563eb" stroke="#1d4ed8" stroke-width="1.5" />
          <!-- Center Structural Mounting Ring -->
          <rect x="26" y="24" width="12" height="24" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2" />
          <line x1="32" y1="26" x2="32" y2="46" stroke="#60a5fa" stroke-width="1" stroke-dasharray="2 2" />
        </svg>
      `;

    case 'payload':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Satellite Bus -->
          <rect x="25" y="22" width="14" height="20" rx="1.5" fill="#f8fafc" stroke="#0f172a" stroke-width="1.2" />
          <!-- High Gain Parabolic Antenna Dish -->
          <path d="M32 12 Q32 18 32 22 M25 14 Q32 19 39 14" stroke="#d97706" stroke-width="1.5" fill="none" />
          <!-- Left Solar Array Wing -->
          <rect x="8" y="26" width="15" height="12" rx="1" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1" />
          <line x1="15.5" y1="26" x2="15.5" y2="38" stroke="#38bdf8" stroke-width="0.8" />
          <!-- Right Solar Array Wing -->
          <rect x="41" y="26" width="15" height="12" rx="1" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1" />
          <line x1="48.5" y1="26" x2="48.5" y2="38" stroke="#38bdf8" stroke-width="0.8" />
        </svg>
      `;

    case 'upgrade':
      if (partKey.includes('magnet')) {
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 16 C18 36, 46 36, 46 16 L38 16 C38 28, 26 28, 26 16 Z" fill="#ef4444" stroke="#991b1b" stroke-width="1.5" />
            <rect x="18" y="14" width="8" height="6" fill="#f8fafc" />
            <rect x="38" y="14" width="8" height="6" fill="#f8fafc" />
            <circle cx="32" cy="46" r="3" fill="#38bdf8" />
            <path d="M22 46 C26 52, 38 52, 42 46" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2 2" fill="none" />
          </svg>
        `;
      } else if (partKey.includes('shield')) {
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 10 L48 18 C48 34, 32 52, 32 52 C32 52, 16 34, 16 18 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
            <path d="M32 16 L42 22 C42 33, 32 44, 32 44 C32 44, 22 33, 22 22 Z" fill="#0369a1" />
            <path d="M32 20 L32 38" stroke="#f8fafc" stroke-width="1.5" />
          </svg>
        `;
      } else if (partKey.includes('turbo')) {
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="18" fill="#1e293b" stroke="#f97316" stroke-width="2" />
            <path d="M32 18 L36 28 L46 32 L36 36 L32 46 L28 36 L18 32 L28 28 Z" fill="#fb923c" />
            <circle cx="32" cy="32" r="5" fill="#fef08a" />
          </svg>
        `;
      } else if (partKey.includes('titanium')) {
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="32,12 50,22 50,42 32,52 14,42 14,22" fill="#334155" stroke="#94a3b8" stroke-width="2" />
            <polygon points="32,18 44,25 44,39 32,46 20,39 20,25" fill="#1e293b" stroke="#38bdf8" stroke-width="1" />
            <circle cx="32" cy="32" r="4" fill="#38bdf8" />
          </svg>
        `;
      } else {
        // RCS Thrusters
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="10" fill="#334155" stroke="#64748b" stroke-width="1.5" />
            <!-- 4 cold-gas nozzle jets -->
            <path d="M32 22 L29 14 L35 14 Z" fill="#38bdf8" />
            <path d="M32 42 L29 50 L35 50 Z" fill="#38bdf8" />
            <path d="M22 32 L14 29 L14 35 Z" fill="#38bdf8" />
            <path d="M42 32 L50 29 L50 35 Z" fill="#38bdf8" />
            <circle cx="32" cy="32" r="4" fill="#0284c7" />
          </svg>
        `;
      }

    default:
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="18" stroke="#64748b" stroke-width="2" />
          <circle cx="32" cy="32" r="6" fill="#38bdf8" />
        </svg>
      `;
  }
}
