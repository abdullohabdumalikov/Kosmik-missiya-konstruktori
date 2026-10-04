import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const DB_DIR = path.resolve('data');
const DB_FILE = path.join(DB_DIR, 'agency_db.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

interface UserProfile {
  id: string;
  username: string;
  agencyName: string;
  avatar: string;
  level: number;
  funds: number; // in thousands (K)
  science: number;
  tier: number;
  createdAt: number;
  settings: {
    language: 'en' | 'ru' | 'uz';
    soundVolume: number;
    musicVolume: number;
    graphicsQuality: 'high' | 'medium' | 'low';
  };
}

interface SavedRocket {
  name: string;
  noseId: string;
  upperStageId: string;
  mainTankId: string;
  engineId: string;
  boosterId: string;
  supplementaryBooster: 'none' | 'srb_2x' | 'srb_4x';
  wingsId: string;
  payloadId: string;
  upgradeId?: string;
}

interface InventoryItem {
  id: string;
  partKey: string;
  category: string;
  level: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity: number;
}

interface UserRecord {
  highestAltitude: number;
  longestFlight: number;
  highestSpeed: number;
  totalLaunches: number;
  successfulLaunches: number;
  failedLaunches: number;
  totalDistance: number;
  mostCoinsEarned: number;
  bestRocketName: string;
}

interface UserAccount {
  id: string;
  username: string;
  salt: string;
  hash: string;
  token: string;
  profile: UserProfile;
  inventory: InventoryItem[];
  rocket: SavedRocket;
  records: UserRecord;
  completedMissions: string[];
  activeMissionId: string;
  shopStock: Array<{
    partKey: string;
    category: string;
    level: number;
    cost: number;
    rarity: string;
  }>;
}

interface DatabaseSchema {
  users: Record<string, UserAccount>;
  sessions: Record<string, string>;
}

// Starter Mini-Rocket Inventory (Balanced starting program)
function getStarterInventory(): InventoryItem[] {
  return [
    { id: 'item_s_1', partKey: 'nose_mini_point', category: 'nose', level: 1, rarity: 'common', quantity: 2 },
    { id: 'item_s_2', partKey: 'tank_mini_core', category: 'mainTank', level: 1, rarity: 'common', quantity: 2 },
    { id: 'item_s_3', partKey: 'engine_spark_mini', category: 'engine', level: 1, rarity: 'common', quantity: 2 },
    { id: 'item_s_4', partKey: 'fins_small', category: 'wings', level: 1, rarity: 'common', quantity: 3 },
    { id: 'item_s_5', partKey: 'payload_mini_beeper', category: 'payload', level: 1, rarity: 'common', quantity: 2 },
    { id: 'item_s_6', partKey: 'booster_micro_strap', category: 'booster', level: 1, rarity: 'common', quantity: 1 },
    { id: 'item_s_7', partKey: 'stage_upper_light', category: 'upperStage', level: 1, rarity: 'common', quantity: 1 },
    { id: 'item_s_8', partKey: 'upgrade_rcs', category: 'upgrade', level: 1, rarity: 'common', quantity: 1 },
    { id: 'item_s_9', partKey: 'upgrade_magnet', category: 'upgrade', level: 1, rarity: 'uncommon', quantity: 1 }
  ];
}

function getDefaultRocket(): SavedRocket {
  return {
    name: 'Aero-Scout I',
    noseId: 'nose_mini_point',
    upperStageId: 'stage_none',
    mainTankId: 'tank_mini_core',
    engineId: 'engine_spark_mini',
    boosterId: 'booster_none',
    supplementaryBooster: 'none',
    wingsId: 'fins_small',
    payloadId: 'payload_mini_beeper',
    upgradeId: 'upgrade_rcs'
  };
}

function getDefaultRecords(): UserRecord {
  return {
    highestAltitude: 0,
    longestFlight: 0,
    highestSpeed: 0,
    totalLaunches: 0,
    successfulLaunches: 0,
    failedLaunches: 0,
    totalDistance: 0,
    mostCoinsEarned: 0,
    bestRocketName: 'Aero-Scout I'
  };
}

function generateRandomShopStock() {
  const catalog = [
    { partKey: 'nose_aerodynamic', category: 'nose', baseCost: 90 },
    { partKey: 'nose_heatshield', category: 'nose', baseCost: 220 },
    { partKey: 'stage_upper_light', category: 'upperStage', baseCost: 280 },
    { partKey: 'stage_centaur', category: 'upperStage', baseCost: 550 },
    { partKey: 'tank_cryo_medium', category: 'mainTank', baseCost: 240 },
    { partKey: 'tank_hypergolic', category: 'mainTank', baseCost: 580 },
    { partKey: 'engine_vector', category: 'engine', baseCost: 290 },
    { partKey: 'engine_aerospike', category: 'engine', baseCost: 650 },
    { partKey: 'booster_micro_strap', category: 'booster', baseCost: 110 },
    { partKey: 'booster_solid_heavy', category: 'booster', baseCost: 380 },
    { partKey: 'fins_delta', category: 'wings', baseCost: 65 },
    { partKey: 'payload_suborbital_sensor', category: 'payload', baseCost: 80 },
    { partKey: 'payload_weather_satellite', category: 'payload', baseCost: 240 },
    { partKey: 'upgrade_rcs', category: 'upgrade', baseCost: 85 },
    { partKey: 'upgrade_magnet', category: 'upgrade', baseCost: 110 },
    { partKey: 'upgrade_shield', category: 'upgrade', baseCost: 140 },
    { partKey: 'upgrade_turbo', category: 'upgrade', baseCost: 160 },
    { partKey: 'upgrade_titanium', category: 'upgrade', baseCost: 175 }
  ];

  // Pick 4 unique random parts
  const shuffled = [...catalog].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4).map(item => {
    const levelRoll = Math.random();
    const level = levelRoll < 0.75 ? 1 : levelRoll < 0.95 ? 2 : 3;
    const cost = Math.round(item.baseCost * (1 + (level - 1) * 0.5));
    const rarity = level === 1 ? 'common' : level === 2 ? 'uncommon' : 'rare';
    return {
      partKey: item.partKey,
      category: item.category,
      level,
      cost,
      rarity
    };
  });
}

class AgencyDB {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database, creating new one', err);
      }
    }
    const initial: DatabaseSchema = { users: {}, sessions: {} };
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(data: DatabaseSchema) {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public save() {
    this.saveDirect(this.data);
  }

  public findUser(username: string): UserAccount | undefined {
    return this.data.users[username.toLowerCase().trim()];
  }

  public findUserByToken(token: string): UserAccount | undefined {
    const username = this.data.sessions[token];
    if (!username) return undefined;
    return this.findUser(username);
  }

  public createUser(username: string, passHash: string, salt: string): UserAccount {
    const cleanUser = username.toLowerCase().trim();
    const token = crypto.randomBytes(32).toString('hex');
    const user: UserAccount = {
      id: 'usr_' + crypto.randomUUID().slice(0, 8),
      username: username.trim(),
      salt,
      hash: passHash,
      token,
      profile: {
        id: 'prof_' + crypto.randomUUID().slice(0, 8),
        username: username.trim(),
        agencyName: `${username.trim()} Aerospace Corp`,
        avatar: 'avatar_astronaut',
        level: 1,
        funds: 2500, // Balanced starting capital (2,500K)
        science: 25,
        tier: 1,
        createdAt: Date.now(),
        settings: {
          language: 'en',
          soundVolume: 80,
          musicVolume: 60,
          graphicsQuality: 'high'
        }
      },
      inventory: getStarterInventory(),
      rocket: getDefaultRocket(),
      records: getDefaultRecords(),
      completedMissions: [],
      activeMissionId: 'mission_suborbital_sounding',
      shopStock: generateRandomShopStock()
    };
    this.data.users[cleanUser] = user;
    this.data.sessions[token] = cleanUser;
    this.save();
    return user;
  }

  public setSession(token: string, username: string) {
    this.data.sessions[token] = username.toLowerCase().trim();
    this.save();
  }

  public getAllUsers(): UserAccount[] {
    return Object.values(this.data.users);
  }
}

const db = new AgencyDB();

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const user = db.findUserByToken(token);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
      return;
    }
    (req as any).user = user;
    next();
  };

  // --- AUTH ROUTES ---
  app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || username.length < 3 || password.length < 4) {
      res.status(400).json({ error: 'Username (min 3 chars) and password (min 4 chars) are required' });
      return;
    }
    const existing = db.findUser(username);
    if (existing) {
      res.status(409).json({ error: 'Agency director username already exists' });
      return;
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    const user = db.createUser(username, hash, salt);
    res.json({
      success: true,
      token: user.token,
      profile: user.profile,
      inventory: user.inventory,
      rocket: user.rocket,
      records: user.records,
      shopStock: user.shopStock,
      activeMissionId: user.activeMissionId,
      completedMissions: user.completedMissions
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }
    const user = db.findUser(username);
    if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }
    const hash = hashPassword(password, user.salt);
    if (hash !== user.hash) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.token = token;
    db.setSession(token, user.username);
    res.json({
      success: true,
      token,
      profile: user.profile,
      inventory: user.inventory,
      rocket: user.rocket,
      records: user.records,
      shopStock: user.shopStock || generateRandomShopStock(),
      activeMissionId: user.activeMissionId,
      completedMissions: user.completedMissions
    });
  });

  app.post('/api/auth/guest', (_req, res) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const guestName = `Director_${randomSuffix}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword('guest_pass', salt);
    const user = db.createUser(guestName, hash, salt);
    res.json({
      success: true,
      token: user.token,
      isGuest: true,
      profile: user.profile,
      inventory: user.inventory,
      rocket: user.rocket,
      records: user.records,
      shopStock: user.shopStock,
      activeMissionId: user.activeMissionId,
      completedMissions: user.completedMissions
    });
  });

  app.get('/api/auth/me', authenticate, (req, res) => {
    const user: UserAccount = (req as any).user;
    if (!user.shopStock || user.shopStock.length === 0) {
      user.shopStock = generateRandomShopStock();
      db.save();
    }
    res.json({
      profile: user.profile,
      inventory: user.inventory,
      rocket: user.rocket,
      records: user.records,
      shopStock: user.shopStock,
      activeMissionId: user.activeMissionId,
      completedMissions: user.completedMissions
    });
  });

  // --- SHOP REROLL & BUY ---
  app.post('/api/shop/reroll', authenticate, (req, res) => {
    const user: UserAccount = (req as any).user;
    const REROLL_FEE = 25; // 25K funds (cheap & affordable)

    if (user.profile.funds < REROLL_FEE) {
      res.status(400).json({ error: `Insufficient funds! Reroll costs ${REROLL_FEE}K` });
      return;
    }

    user.profile.funds -= REROLL_FEE;
    user.shopStock = generateRandomShopStock();
    db.save();

    res.json({
      success: true,
      funds: user.profile.funds,
      shopStock: user.shopStock
    });
  });

  app.post('/api/shop/buy', authenticate, (req, res) => {
    const user: UserAccount = (req as any).user;
    const { partKey, level, cost } = req.body;

    if (user.profile.funds < cost) {
      res.status(400).json({ error: `Not enough funds to purchase this part!` });
      return;
    }

    user.profile.funds -= cost;

    let inInventory = user.inventory.find(i => i.partKey === partKey && i.level === level);
    if (inInventory) {
      inInventory.quantity += 1;
    } else {
      user.inventory.push({
        id: 'item_' + crypto.randomUUID().slice(0, 8),
        partKey,
        category: req.body.category || 'engine',
        level: level || 1,
        rarity: req.body.rarity || 'common',
        quantity: 1
      });
    }

    db.save();
    res.json({
      success: true,
      funds: user.profile.funds,
      inventory: user.inventory
    });
  });

  // --- PROFILE & SETTINGS ---
  app.post('/api/profile/update', authenticate, (req, res) => {
    const user: UserAccount = (req as any).user;
    const { agencyName, avatar, settings } = req.body;
    if (agencyName) user.profile.agencyName = String(agencyName).slice(0, 32);
    if (avatar) user.profile.avatar = String(avatar);
    if (settings) {
      user.profile.settings = {
        ...user.profile.settings,
        ...settings
      };
    }
    db.save();
    res.json({ success: true, profile: user.profile });
  });

  app.post('/api/profile/reset-settings', authenticate, (req, res) => {
    const user: UserAccount = (req as any).user;
    user.profile.settings = {
      language: 'en',
      soundVolume: 80,
      musicVolume: 60,
      graphicsQuality: 'high'
    };
    db.save();
    res.json({ success: true, profile: user.profile });
  });

  // --- ROCKET PERSISTENCE ---
  app.post('/api/rocket/save', authenticate, (req, res) => {
    const user: UserAccount = (req as any).user;
    const { rocket } = req.body;
    if (rocket && typeof rocket === 'object') {
      user.rocket = { ...user.rocket, ...rocket };
      db.save();
      res.json({ success: true, rocket: user.rocket });
    } else {
      res.status(400).json({ error: 'Invalid rocket configuration' });
    }
  });

  // --- 4-TO-1 CRAFTING SYSTEM ---
  app.post('/api/craft', authenticate, (req, res) => {
    const user: UserAccount = (req as any).user;
    const { partKey, level } = req.body;

    if (!partKey || !level || level < 1 || level >= 5) {
      res.status(400).json({ error: 'Cannot upgrade beyond Level 5 or invalid part parameters' });
      return;
    }

    const existing = user.inventory.find(item => item.partKey === partKey && item.level === level);
    if (!existing || existing.quantity < 4) {
      res.status(400).json({ error: `Not enough parts! Need 4 Level ${level} parts, you have ${existing ? existing.quantity : 0}` });
      return;
    }

    existing.quantity -= 4;
    if (existing.quantity <= 0) {
      user.inventory = user.inventory.filter(i => i.id !== existing.id);
    }

    const nextLevel = level + 1;
    const rarityScale: Array<'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'> = [
      'common', 'uncommon', 'rare', 'epic', 'legendary'
    ];
    const newRarity = rarityScale[Math.min(nextLevel - 1, 4)];

    let upgradedItem = user.inventory.find(item => item.partKey === partKey && item.level === nextLevel);
    if (upgradedItem) {
      upgradedItem.quantity += 1;
    } else {
      upgradedItem = {
        id: 'item_' + crypto.randomUUID().slice(0, 8),
        partKey,
        category: existing.category,
        level: nextLevel,
        rarity: newRarity,
        quantity: 1
      };
      user.inventory.push(upgradedItem);
    }

    user.profile.science += nextLevel * 10;
    db.save();

    res.json({
      success: true,
      craftedItem: upgradedItem,
      inventory: user.inventory,
      science: user.profile.science
    });
  });

  // --- MISSIONS ---
  app.post('/api/missions/select', authenticate, (req, res) => {
    const user: UserAccount = (req as any).user;
    const { missionId } = req.body;
    user.activeMissionId = missionId;
    db.save();
    res.json({ success: true, activeMissionId: user.activeMissionId });
  });

  // --- LAUNCH RESULTS & REWARDS ---
  app.post('/api/launch/complete', authenticate, (req, res) => {
    const user: UserAccount = (req as any).user;
    const {
      altitude,
      flightDuration,
      maxSpeed,
      missionCompleted,
      inFlightCoins
    } = req.body;

    const alt = Math.max(0, Math.floor(Number(altitude) || 0));
    const speed = Math.max(0, Math.floor(Number(maxSpeed) || 0));
    const duration = Math.max(0, Math.floor(Number(flightDuration) || 0));
    const bonusLoot = Math.max(0, Math.floor(Number(inFlightCoins) || 0));

    user.records.totalLaunches += 1;
    user.records.totalDistance += alt;
    if (duration > user.records.longestFlight) {
      user.records.longestFlight = duration;
    }
    if (speed > user.records.highestSpeed) {
      user.records.highestSpeed = speed;
    }

    const previousBest = user.records.highestAltitude;
    const isNewRecord = alt > previousBest;
    if (isNewRecord) {
      user.records.highestAltitude = alt;
      user.records.bestRocketName = user.rocket.name;
    }

    const wasSuccess = alt >= 800;
    if (wasSuccess) {
      user.records.successfulLaunches += 1;
    } else {
      user.records.failedLaunches += 1;
    }

    // Dynamic flight rewards earned purely after the flight
    let coinsEarned = Math.floor(40 + (alt / 100) * 1.8) + bonusLoot;
    if (isNewRecord && alt > 1500) {
      coinsEarned += Math.floor(alt * 0.05);
    }

    let scienceEarned = Math.floor(alt / 1000) * 3 + (isNewRecord ? 15 : 2);

    if (missionCompleted && user.activeMissionId && !user.completedMissions.includes(user.activeMissionId)) {
      user.completedMissions.push(user.activeMissionId);
      coinsEarned += 300;
      scienceEarned += 25;
    }

    user.profile.funds += coinsEarned;
    user.profile.science += scienceEarned;
    if (coinsEarned > user.records.mostCoinsEarned) {
      user.records.mostCoinsEarned = coinsEarned;
    }

    const calculatedLevel = Math.min(10, Math.max(1, 1 + Math.floor(user.records.highestAltitude / 25000)));
    user.profile.level = calculatedLevel;
    user.profile.tier = Math.min(10, Math.max(1, 1 + Math.floor(user.profile.science / 50)));

    let discovery: InventoryItem | null = null;
    const rollDiscovery = Math.random();
    if (rollDiscovery < 0.40 && alt > 400) {
      const rarityRoll = Math.random() * 100;
      let selectedRarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' = 'common';
      let selectedLevel = 1;

      if (alt < 20000) {
        if (rarityRoll < 75) selectedRarity = 'common';
        else if (rarityRoll < 95) { selectedRarity = 'uncommon'; selectedLevel = 2; }
        else { selectedRarity = 'rare'; selectedLevel = 3; }
      } else if (alt < 80000) {
        if (rarityRoll < 40) selectedRarity = 'common';
        else if (rarityRoll < 75) { selectedRarity = 'uncommon'; selectedLevel = 2; }
        else if (rarityRoll < 95) { selectedRarity = 'rare'; selectedLevel = 3; }
        else { selectedRarity = 'epic'; selectedLevel = 4; }
      } else {
        if (rarityRoll < 20) selectedRarity = 'common';
        else if (rarityRoll < 55) { selectedRarity = 'uncommon'; selectedLevel = 2; }
        else if (rarityRoll < 85) { selectedRarity = 'rare'; selectedLevel = 3; }
        else if (rarityRoll < 97) { selectedRarity = 'epic'; selectedLevel = 4; }
        else { selectedRarity = 'legendary'; selectedLevel = 5; }
      }

      const partPool = [
        { key: 'engine_vector', cat: 'engine' },
        { key: 'tank_cryo_medium', cat: 'mainTank' },
        { key: 'booster_micro_strap', cat: 'booster' },
        { key: 'stage_upper_light', cat: 'upperStage' },
        { key: 'nose_aerodynamic', cat: 'nose' },
        { key: 'fins_delta', cat: 'wings' },
        { key: 'payload_suborbital_sensor', cat: 'payload' }
      ];

      const chosen = partPool[Math.floor(Math.random() * partPool.length)];

      let inInventory = user.inventory.find(i => i.partKey === chosen.key && i.level === selectedLevel);
      if (inInventory) {
        inInventory.quantity += 1;
        discovery = inInventory;
      } else {
        discovery = {
          id: 'item_' + crypto.randomUUID().slice(0, 8),
          partKey: chosen.key,
          category: chosen.cat,
          level: selectedLevel,
          rarity: selectedRarity,
          quantity: 1
        };
        user.inventory.push(discovery);
      }
    }

    db.save();

    res.json({
      success: true,
      altitude: alt,
      coinsEarned,
      scienceEarned,
      isNewRecord,
      previousBest,
      currentBest: user.records.highestAltitude,
      records: user.records,
      profile: user.profile,
      inventory: user.inventory,
      discovery,
      completedMissions: user.completedMissions
    });
  });

  app.get('/api/records/all', (_req, res) => {
    const allUsers = db.getAllUsers();
    const leaderboard = allUsers
      .map(u => ({
        username: u.username,
        agencyName: u.profile.agencyName,
        highestAltitude: u.records.highestAltitude,
        totalLaunches: u.records.totalLaunches,
        successRate: u.records.totalLaunches > 0
          ? Math.round((u.records.successfulLaunches / u.records.totalLaunches) * 100)
          : 0,
        bestRocket: u.records.bestRocketName,
        level: u.profile.level,
        avatar: u.profile.avatar
      }))
      .sort((a, b) => b.highestAltitude - a.highestAltitude)
      .slice(0, 20);

    res.json({ leaderboard });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Astra Horizon Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server start error:', err);
  process.exit(1);
});
