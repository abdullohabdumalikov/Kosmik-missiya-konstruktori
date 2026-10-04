// Records, Milestones, and Agency Hall of Fame
import { api } from './api.js';
import { MILESTONE_FLAGS } from './physics.js';

export class RecordsManager {
  constructor(app) {
    this.app = app;
  }

  async renderRecordsView() {
    const container = document.getElementById('records-container');
    if (!container) return;

    const records = this.app.userData.records || {};
    const profile = this.app.userData.profile || {};

    const successRate = records.totalLaunches > 0
      ? Math.round((records.successfulLaunches / records.totalLaunches) * 100)
      : 0;

    let leaderboardData = [];
    try {
      const res = await api.getLeaderboard();
      leaderboardData = res.leaderboard || [];
    } catch (_) {}

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-8">
        
        <!-- Header Highlight -->
        <div class="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-950 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">All-Time Peak Record</span>
            <div class="text-4xl font-extrabold text-white mt-1 font-mono tracking-tight flex items-baseline gap-3">
              ${(records.highestAltitude || 0).toLocaleString()} <span class="text-lg font-normal text-slate-400">METERS</span>
            </div>
            <p class="text-xs text-slate-400 mt-2">Achieved by flagship craft: <span class="text-cyan-300 font-bold">${records.bestRocketName || 'Delta Horizon I'}</span></p>
          </div>
          <div class="flex items-center gap-6 text-center border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-8">
            <div>
              <div class="text-2xl font-bold font-mono text-emerald-400">${successRate}%</div>
              <div class="text-[11px] uppercase tracking-wider text-slate-500 mt-0.5">Success Rate</div>
            </div>
            <div>
              <div class="text-2xl font-bold font-mono text-cyan-400">${records.totalLaunches || 0}</div>
              <div class="text-[11px] uppercase tracking-wider text-slate-500 mt-0.5">Total Launches</div>
            </div>
            <div>
              <div class="text-2xl font-bold font-mono text-amber-400">${(records.highestSpeed || 0).toLocaleString()} <span class="text-xs font-normal">m/s</span></div>
              <div class="text-[11px] uppercase tracking-wider text-slate-500 mt-0.5">Top Speed</div>
            </div>
          </div>
        </div>

        <!-- Detailed Stat Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="text-xs text-slate-400">Longest Flight Duration</div>
            <div class="text-xl font-bold font-mono text-white mt-1">${records.longestFlight || 0}s</div>
          </div>
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="text-xs text-slate-400">Successful Orbit Flights</div>
            <div class="text-xl font-bold font-mono text-emerald-400 mt-1">${records.successfulLaunches || 0}</div>
          </div>
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="text-xs text-slate-400">Suborbital Aborts / Crashes</div>
            <div class="text-xl font-bold font-mono text-rose-400 mt-1">${records.failedLaunches || 0}</div>
          </div>
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="text-xs text-slate-400">Most Bounty in One Launch</div>
            <div class="text-xl font-bold font-mono text-amber-300 mt-1">${(records.mostCoinsEarned || 0).toLocaleString()}K</div>
          </div>
        </div>

        <!-- Milestones Achieved Map -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h3 class="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span>🚩</span> Altitude Milestone Flags
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            ${MILESTONE_FLAGS.map(flag => {
              const reached = (records.highestAltitude || 0) >= flag.altitude;
              return `
                <div class="p-3 rounded-lg border flex items-center justify-between ${
                  reached
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-white'
                    : 'border-slate-800 bg-slate-950/40 text-slate-500'
                }">
                  <div>
                    <div class="text-xs font-bold ${reached ? 'text-emerald-300' : 'text-slate-400'}">${flag.label}</div>
                    <div class="text-[11px] ${reached ? 'text-slate-300' : 'text-slate-600'}">${flag.name}</div>
                  </div>
                  <span class="text-sm">${reached ? '✅' : '🔒'}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Global Agency Leaderboard -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h3 class="text-base font-bold text-white mb-4 flex items-center justify-between">
            <span class="flex items-center gap-2"><span>🏆</span> Agency Directors Leaderboard</span>
            <span class="text-xs text-slate-500 font-normal">Ranked by Highest Altitude</span>
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-slate-500 border-b border-slate-800 uppercase font-mono text-[10px]">
                <tr>
                  <th class="py-2.5 px-3">Rank</th>
                  <th class="py-2.5 px-3">Director</th>
                  <th class="py-2.5 px-3">Agency</th>
                  <th class="py-2.5 px-3">Highest Altitude</th>
                  <th class="py-2.5 px-3">Success Rate</th>
                  <th class="py-2.5 px-3">Flagship Craft</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-mono text-slate-300">
                ${leaderboardData.map((entry, idx) => `
                  <tr class="${entry.username === profile.username ? 'bg-blue-950/40 text-blue-300 font-bold' : ''}">
                    <td class="py-3 px-3 text-slate-400">#${idx + 1}</td>
                    <td class="py-3 px-3 font-sans font-bold text-white flex items-center gap-2">
                      <span>🧑‍🚀</span> ${entry.username}
                    </td>
                    <td class="py-3 px-3 text-slate-400">${entry.agencyName}</td>
                    <td class="py-3 px-3 text-amber-400 font-bold">${entry.highestAltitude.toLocaleString()} m</td>
                    <td class="py-3 px-3 text-emerald-400">${entry.successRate}%</td>
                    <td class="py-3 px-3 text-slate-400">${entry.bestRocket || 'Standard'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }
}
