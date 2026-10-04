// High-fidelity 2D Stylized Rocket Renderer
// Fixed stage separation so Stage 1 cleanly detaches and drops completely out of view

export class RocketRenderer {
  constructor() {
    this.particles = [];
  }

  draw(ctx, x, y, scale = 1.0, angle = 0, options = {}) {
    const {
      rocketConfig,
      stats,
      stage = 1,
      throttle = 0,
      isBoosting = false,
      gimbal = 0,
      isSeparating = false,
      jettisonProgress = 0,
      showPlume = false
    } = options;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    const hasUpperStage = rocketConfig.upperStageId && rocketConfig.upperStageId !== 'stage_none';

    // Only draw falling stage 1 WHILE active separation animation is running (< 1.0)
    if (isSeparating && jettisonProgress < 1.0 && stage === 2 && hasUpperStage) {
      this.drawFallingStage1(ctx, rocketConfig, stats, jettisonProgress);
      this.drawStagingEffects(ctx, 0, 20, jettisonProgress);
    }

    if (stage === 1 || !hasUpperStage) {
      // Stage 1 (Core Stack)
      this.drawStage1Base(ctx, rocketConfig, stats, gimbal, throttle, isBoosting, showPlume);

      if (hasUpperStage) {
        this.drawInterstage(ctx, 0, -85);
        this.drawStage2Core(ctx, rocketConfig, stats, 0, -120);
        this.drawFairingAndPayload(ctx, rocketConfig, stats, 0, -185);
      } else {
        // Single stage mini-rocket
        this.drawFairingAndPayload(ctx, rocketConfig, stats, 0, -135, true);
      }
    } else {
      // Stage 2 active (Upper Stage only - cleanly separated, zero stage 1 remnants)
      this.drawStage2Engine(ctx, 0, 0, gimbal, throttle, isBoosting, showPlume);
      this.drawStage2Core(ctx, rocketConfig, stats, 0, -35);
      this.drawFairingAndPayload(ctx, rocketConfig, stats, 0, -100);
    }

    ctx.restore();
  }

  drawFallingStage1(ctx, rocketConfig, stats, progress) {
    ctx.save();
    // Drop fast downwards out of screen - starts strictly BELOW stage 2 engine bell (y=25)
    const dropY = 120 + Math.pow(progress, 1.3) * 650;
    const spreadX = progress * 80;
    const tumbleAngle = progress * 0.95;

    ctx.translate(spreadX, dropY);
    ctx.rotate(tumbleAngle);
    ctx.globalAlpha = Math.max(0, 1 - progress * 1.3);

    this.drawStage1Base(ctx, rocketConfig, stats, 0, 0, false, false);
    ctx.restore();
  }

  drawStagingEffects(ctx, x, y, progress) {
    if (progress > 0.6) return;
    ctx.save();
    ctx.translate(x, y);

    // Explosive separation burst ring
    const radius = 10 + progress * 55;
    const alpha = Math.max(0, 1 - progress * 2.2);

    ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 10, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Hot decoupling sparks
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + progress * 4;
      const dist = radius * (0.8 + Math.random() * 0.4);
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * dist * 0.6 + 10;
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#f97316';
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // --- STAGE 1 CORE ---
  drawStage1Base(ctx, rocketConfig, stats, gimbal, throttle, isBoosting, showPlume) {
    const isMini = rocketConfig.mainTankId === 'tank_mini_core';
    const tankWidth = isMini ? 32 : 44;
    const tankHeight = isMini ? 100 : 145;
    const topY = -85;

    // 1. Side Boosters
    this.drawSideBoosters(ctx, rocketConfig, stats, topY, tankHeight, tankWidth);

    // 2. Tank Body
    const tankGrad = ctx.createLinearGradient(-tankWidth / 2, 0, tankWidth / 2, 0);
    tankGrad.addColorStop(0, '#1e293b');
    tankGrad.addColorStop(0.25, '#f8fafc');
    tankGrad.addColorStop(0.65, '#cbd5e1');
    tankGrad.addColorStop(0.9, '#64748b');
    tankGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = tankGrad;
    ctx.fillRect(-tankWidth / 2, topY, tankWidth, tankHeight);

    // Panel lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    for (let py = topY + 20; py < topY + tankHeight; py += 28) {
      ctx.beginPath();
      ctx.moveTo(-tankWidth / 2, py);
      ctx.lineTo(tankWidth / 2, py);
      ctx.stroke();
    }

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(-tankWidth / 2, topY + (isMini ? 35 : 55), tankWidth, isMini ? 8 : 14);

    // 3. Base Fins / Wings
    this.drawFins(ctx, rocketConfig, topY + tankHeight - 5, tankWidth);

    // 4. Main Engine
    this.drawMainEngine(ctx, topY + tankHeight, gimbal, throttle, isBoosting, showPlume, isMini);
  }

  drawInterstage(ctx, x, y) {
    const w = 38;
    const h = 24;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - w / 2, y, w, h);

    const rows = 2;
    const cols = 6;
    const cw = w / cols;
    const ch = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x - w / 2 + c * cw, y + r * ch, cw, ch);
        }
      }
    }
  }

  drawStage2Core(ctx, rocketConfig, stats, x, y) {
    const w = 36;
    const h = 65;

    const grad = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    grad.addColorStop(0, '#475569');
    grad.addColorStop(0.3, '#f1f5f9');
    grad.addColorStop(0.7, '#cbd5e1');
    grad.addColorStop(1, '#334155');

    ctx.fillStyle = grad;
    ctx.fillRect(x - w / 2, y, w, h);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - w / 2, y, w, h);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + w / 2 - 3, y + 8, 2, h - 16);
    ctx.fillRect(x - w / 2 + 1, y + 8, 2, h - 16);
  }

  drawStage2Engine(ctx, x, y, gimbal, throttle, isBoosting, showPlume) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(gimbal * 0.4);

    const bellGrad = ctx.createLinearGradient(-12, 0, 12, 0);
    bellGrad.addColorStop(0, '#0f172a');
    bellGrad.addColorStop(0.4, '#64748b');
    bellGrad.addColorStop(0.7, '#334155');
    bellGrad.addColorStop(1, '#020617');

    ctx.fillStyle = bellGrad;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-13, 20);
    ctx.lineTo(13, 20);
    ctx.lineTo(6, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-13, 20);
    ctx.lineTo(13, 20);
    ctx.stroke();

    if (showPlume && throttle > 0.05) {
      this.drawExhaustFlame(ctx, 0, 20, throttle, isBoosting, 0.85);
    }
    ctx.restore();
  }

  drawFairingAndPayload(ctx, rocketConfig, stats, x, y, isDirectMount = false) {
    const isMini = rocketConfig.noseId === 'nose_mini_point';
    const w = isMini ? 30 : 38;
    const h = isMini ? 50 : 65;

    const fairingGrad = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    fairingGrad.addColorStop(0, '#64748b');
    fairingGrad.addColorStop(0.25, '#ffffff');
    fairingGrad.addColorStop(0.65, '#f1f5f9');
    fairingGrad.addColorStop(0.9, '#cbd5e1');
    fairingGrad.addColorStop(1, '#475569');

    ctx.fillStyle = fairingGrad;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y + h);
    ctx.bezierCurveTo(x - w / 2, y + h * 0.35, x - w * 0.2, y, x, y);
    ctx.bezierCurveTo(x + w * 0.2, y, x + w / 2, y + h * 0.35, x + w / 2, y + h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.stroke();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(x, y + 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSideBoosters(ctx, rocketConfig, stats, topY, mainHeight, mainWidth) {
    const hasBooster = rocketConfig.boosterId && rocketConfig.boosterId !== 'booster_none';
    if (!hasBooster) return;

    const isHeavy = rocketConfig.boosterId === 'booster_solid_heavy';
    const bWidth = isHeavy ? 16 : 12;
    const bHeight = isHeavy ? mainHeight * 0.9 : mainHeight * 0.7;
    const bY = topY + (mainHeight - bHeight);
    const offsets = [-mainWidth / 2 - bWidth / 2 - 2, mainWidth / 2 + bWidth / 2 + 2];

    offsets.forEach(bx => {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx > 0 ? mainWidth / 2 : -mainWidth / 2, bY + 25);
      ctx.lineTo(bx, bY + 25);
      ctx.moveTo(bx > 0 ? mainWidth / 2 : -mainWidth / 2, bY + bHeight - 15);
      ctx.lineTo(bx, bY + bHeight - 15);
      ctx.stroke();

      const bGrad = ctx.createLinearGradient(bx - bWidth / 2, 0, bx + bWidth / 2, 0);
      bGrad.addColorStop(0, '#475569');
      bGrad.addColorStop(0.3, '#ffffff');
      bGrad.addColorStop(0.7, '#cbd5e1');
      bGrad.addColorStop(1, '#334155');

      ctx.fillStyle = bGrad;
      ctx.fillRect(bx - bWidth / 2, bY + 14, bWidth, bHeight - 14);

      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(bx - bWidth / 2, bY + 14);
      ctx.lineTo(bx, bY);
      ctx.lineTo(bx + bWidth / 2, bY + 14);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bx - 4, bY + bHeight, 8, 5);
    });
  }

  drawFins(ctx, rocketConfig, baseY, tankWidth) {
    const isSmall = rocketConfig.wingsId === 'fins_small';
    const span = isSmall ? 16 : 24;
    const finHeight = isSmall ? 24 : 36;

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(-tankWidth / 2, baseY - finHeight);
    ctx.lineTo(-tankWidth / 2 - span, baseY);
    ctx.lineTo(-tankWidth / 2, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tankWidth / 2, baseY - finHeight);
    ctx.lineTo(tankWidth / 2 + span, baseY);
    ctx.lineTo(tankWidth / 2, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawMainEngine(ctx, baseY, gimbal, throttle, isBoosting, showPlume, isMini = false) {
    ctx.save();
    ctx.translate(0, baseY);
    ctx.rotate(gimbal * 0.35);

    const bellWidth = isMini ? 10 : 16;
    const bellHeight = isMini ? 15 : 24;

    ctx.fillStyle = '#334155';
    ctx.fillRect(-bellWidth / 2, 0, bellWidth, 4);

    const nGrad = ctx.createLinearGradient(-bellWidth, 0, bellWidth, 0);
    nGrad.addColorStop(0, '#0f172a');
    nGrad.addColorStop(0.3, '#64748b');
    nGrad.addColorStop(0.7, '#334155');
    nGrad.addColorStop(1, '#020617');

    ctx.fillStyle = nGrad;
    ctx.beginPath();
    ctx.moveTo(-bellWidth * 0.5, 4);
    ctx.lineTo(-bellWidth, 4 + bellHeight);
    ctx.lineTo(bellWidth, 4 + bellHeight);
    ctx.lineTo(bellWidth * 0.5, 4);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-bellWidth, 4 + bellHeight);
    ctx.lineTo(bellWidth, 4 + bellHeight);
    ctx.stroke();

    if (showPlume && throttle > 0.05) {
      this.drawExhaustFlame(ctx, 0, 4 + bellHeight, throttle, isBoosting, isMini ? 0.7 : 1.0);
    }
    ctx.restore();
  }

  drawExhaustFlame(ctx, x, y, throttle, isBoosting, scaleFactor = 1.0) {
    const flameLen = (60 + throttle * 90 + (isBoosting ? 50 : 0)) * scaleFactor;
    const flameWidth = (18 + (isBoosting ? 8 : 0)) * scaleFactor;
    const jitter = (Math.random() - 0.5) * 3;

    const outerGrad = ctx.createLinearGradient(x, y, x, y + flameLen);
    outerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    outerGrad.addColorStop(0.15, 'rgba(251, 191, 36, 0.9)');
    outerGrad.addColorStop(0.45, 'rgba(249, 115, 22, 0.75)');
    outerGrad.addColorStop(0.85, 'rgba(239, 68, 68, 0.3)');
    outerGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.moveTo(x - flameWidth / 2, y);
    ctx.quadraticCurveTo(x - flameWidth * 0.6, y + flameLen * 0.4, x + jitter, y + flameLen);
    ctx.quadraticCurveTo(x + flameWidth * 0.6, y + flameLen * 0.4, x + flameWidth / 2, y);
    ctx.closePath();
    ctx.fill();

    const innerGrad = ctx.createLinearGradient(x, y, x, y + flameLen * 0.45);
    innerGrad.addColorStop(0, '#ffffff');
    innerGrad.addColorStop(0.4, '#67e8f9');
    innerGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.moveTo(x - flameWidth * 0.3, y);
    ctx.lineTo(x, y + flameLen * 0.45);
    ctx.lineTo(x + flameWidth * 0.3, y);
    ctx.closePath();
    ctx.fill();
  }
}

export const rocketRenderer = new RocketRenderer();
