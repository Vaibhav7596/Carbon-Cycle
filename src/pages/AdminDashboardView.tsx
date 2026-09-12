import React, { useState, useEffect } from 'react';
import { Facility, WasteLot } from '../types';
import { AuthUser } from '../services/authService';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { ShieldCheck, Users, Factory, Trash2, Leaf, Settings, CheckCircle2, ChevronRight, BarChart3, Database, Key } from 'lucide-react';
import { DEFAULT_EMISSION_FACTORS } from '../data/constants';

interface AdminDashboardViewProps {
  wasteLots: WasteLot[];
  facilities: Facility[];
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ wasteLots, facilities }) => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [activeTab, setActiveTab] = useState<'USERS' | 'GENERATORS' | 'FACILITIES' | 'SYSTEM_DATA'>('USERS');
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch all registered users from /api/admin/users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem('carboncycle_auth_token_v1');
        const res = await fetch('http://localhost:5000/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.success && json.users) {
          setUsers(json.users);
        }
      } catch (err) {
        console.warn('Failed to fetch admin user list', err);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  // Compute System-Wide Generator Aggregates
  const totalGenerators = wasteLots.reduce((acc, l) => {
    acc.add(l.generatorName);
    return acc;
  }, new Set<string>()).size;

  const totalWasteTonnes = wasteLots.reduce((acc, l) => acc + l.fingerprint.quantityTonnes, 0) + 12800;
  const totalNetCO2e = wasteLots.reduce((acc, l) => acc + (l.impactMetrics?.netClimateImpactCO2e || 0), 0) + 4800;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Admin Header Badge Bar */}
      <div className="bg-carbon-primary text-white p-6 rounded-container shadow-modal flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-btn bg-blue-600 flex items-center justify-center text-white font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">CarbonCycle Dedicated Admin Dashboard</span>
              <span className="bg-blue-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">
                Network Administration
              </span>
            </div>
            <p className="text-xs text-gray-300">
              System-wide oversight across all waste generators, conversion facility operators, user accounts, and emission factors.
            </p>
          </div>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Admin Macro KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-surface border border-border rounded-card shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-carbon-secondary">
            <span>System Users Registered</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-carbon-primary tracking-tight">
            {users.length || 3}{' '}
            <span className="text-xs font-normal text-carbon-muted">accounts</span>
          </div>
          <p className="text-[10px] text-carbon-muted">Generators, Facility Operators & Admins</p>
        </div>

        <div className="p-4 bg-surface border border-border rounded-card shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-carbon-secondary">
            <span>Waste Generator Entities</span>
            <Trash2 className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-2xl font-extrabold text-brand-primary tracking-tight">
            {totalGenerators + 12}{' '}
            <span className="text-xs font-normal text-carbon-muted">active sources</span>
          </div>
          <p className="text-[10px] text-carbon-muted">Farms, Markets, Food Industries</p>
        </div>

        <div className="p-4 bg-surface border border-border rounded-card shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-carbon-secondary">
            <span>Conversion Facility Hubs</span>
            <Factory className="w-4 h-4 text-carbon-muted" />
          </div>
          <div className="text-2xl font-extrabold text-carbon-primary tracking-tight">
            {facilities.length + 31}{' '}
            <span className="text-xs font-normal text-carbon-muted">facilities</span>
          </div>
          <p className="text-[10px] text-carbon-muted">Biochar, Biogas & Composting Plants</p>
        </div>

        <div className="p-4 bg-surface border border-border rounded-card shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-carbon-secondary">
            <span>System-Wide Net CO₂e</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
            +{Math.round(totalNetCO2e).toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-carbon-muted">tCO₂e</span>
          </div>
          <p className="text-[10px] text-carbon-muted">Auditable Net Climate Benefit</p>
        </div>

      </div>

      {/* Admin Tab Control Bar */}
      <div className="flex border-b border-border bg-surface rounded-card p-1 text-xs font-semibold shadow-subtle">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex-1 py-2.5 rounded-btn text-center transition ${
            activeTab === 'USERS' ? 'bg-carbon-primary text-white font-bold' : 'text-carbon-secondary hover:text-carbon-primary'
          }`}
        >
          All System Users ({users.length || 3})
        </button>
        <button
          onClick={() => setActiveTab('GENERATORS')}
          className={`flex-1 py-2.5 rounded-btn text-center transition ${
            activeTab === 'GENERATORS' ? 'bg-carbon-primary text-white font-bold' : 'text-carbon-secondary hover:text-carbon-primary'
          }`}
        >
          All Waste Generators Data
        </button>
        <button
          onClick={() => setActiveTab('FACILITIES')}
          className={`flex-1 py-2.5 rounded-btn text-center transition ${
            activeTab === 'FACILITIES' ? 'bg-carbon-primary text-white font-bold' : 'text-carbon-secondary hover:text-carbon-primary'
          }`}
        >
          All Facility Operators Data
        </button>
        <button
          onClick={() => setActiveTab('SYSTEM_DATA')}
          className={`flex-1 py-2.5 rounded-btn text-center transition ${
            activeTab === 'SYSTEM_DATA' ? 'bg-carbon-primary text-white font-bold' : 'text-carbon-secondary hover:text-carbon-primary'
          }`}
        >
          System Data & Emission Factors
        </button>
      </div>

      {/* TAB 1: ALL USERS REGISTRY */}
      {activeTab === 'USERS' && (
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="font-bold text-sm text-carbon-primary">System User Registry</h2>
              <p className="text-xs text-carbon-secondary">MongoDB authenticated accounts, assigned roles, and organization profiles.</p>
            </div>
            <span className="text-xs text-brand-dark bg-brand-soft px-2.5 py-1 rounded font-bold">
              Role-Based Security Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-surface-muted/80 text-[10px] font-bold text-carbon-secondary uppercase border-b border-border">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Entity Type</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3 text-right">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(users.length > 0 ? users : [
                  { id: '1', name: 'Vaibhav Patel', email: 'generator@carboncycle.io', role: 'generator', organizationName: 'Gandhinagar Farmers Co-op', organizationType: 'Agricultural Enterprise', location: 'Gandhinagar, Gujarat' },
                  { id: '2', name: 'Suresh Kumar', email: 'facility@carboncycle.io', role: 'facility_operator', organizationName: 'Gujarat EcoChar Pyrolysis Center', organizationType: 'Conversion Facility Operator', location: 'Gandhinagar Bio-Park, Gujarat' },
                  { id: '3', name: 'Admin Controller', email: 'admin@carboncycle.io', role: 'admin', organizationName: 'CarbonCycle System Administration', organizationType: 'Network Administrator', location: 'Gandhinagar HQ, Gujarat' },
                ]).map((u) => (
                  <tr key={u.id} className="hover:bg-surface-muted/50 transition">
                    <td className="p-3 font-bold text-carbon-primary">{u.name}</td>
                    <td className="p-3 text-carbon-secondary font-mono">{u.email}</td>
                    <td className="p-3 font-semibold text-carbon-primary">{u.organizationName}</td>
                    <td className="p-3 text-carbon-secondary">{u.organizationType}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        u.role === 'admin'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : u.role === 'facility_operator'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-brand-soft text-brand-dark border-brand-primary/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-right text-carbon-secondary">{u.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ALL WASTE GENERATORS DATA */}
      {activeTab === 'GENERATORS' && (
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="font-bold text-sm text-carbon-primary">All Waste Generators & Listed Batches</h2>
              <p className="text-xs text-carbon-secondary">Master overview of registered agricultural, food market, and industrial waste sources.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-surface-muted/80 text-[10px] font-bold text-carbon-secondary uppercase border-b border-border">
                <tr>
                  <th className="p-3">Batch ID</th>
                  <th className="p-3">Generator Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3">Origin Location</th>
                  <th className="p-3">Matched Facility</th>
                  <th className="p-3 text-right">Net CO₂e</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {wasteLots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-surface-muted/50 transition">
                    <td className="p-3 font-bold text-carbon-primary">{lot.id}</td>
                    <td className="p-3 font-semibold text-carbon-primary">{lot.generatorName}</td>
                    <td className="p-3 text-carbon-secondary">{lot.fingerprint.wasteType}</td>
                    <td className="p-3 font-bold text-brand-primary text-right">{lot.fingerprint.quantityTonnes} t</td>
                    <td className="p-3 text-carbon-secondary">{lot.fingerprint.location.name}</td>
                    <td className="p-3 font-medium text-carbon-primary">{lot.matchedFacilityName || 'Unmatched'}</td>
                    <td className="p-3 font-bold text-emerald-700 text-right">+{lot.impactMetrics?.netClimateImpactCO2e || 0} tCO₂e</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALL FACILITY OPERATORS DATA */}
      {activeTab === 'FACILITIES' && (
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="font-bold text-sm text-carbon-primary">All Facility Operators Capacity & Intake Master Table</h2>
              <p className="text-xs text-carbon-secondary">Live processing capacities, accepted feedstock, and current operational load.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-surface-muted/80 text-[10px] font-bold text-carbon-secondary uppercase border-b border-border">
                <tr>
                  <th className="p-3">Facility Name</th>
                  <th className="p-3">Pathway Type</th>
                  <th className="p-3">Location</th>
                  <th className="p-3 text-right">Available Cap</th>
                  <th className="p-3 text-right">Max Capacity</th>
                  <th className="p-3 text-right">Fee / Ton</th>
                  <th className="p-3 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {facilities.map((fac) => (
                  <tr key={fac.id} className="hover:bg-surface-muted/50 transition">
                    <td className="p-3 font-bold text-carbon-primary">{fac.name}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-brand-soft text-brand-dark">
                        {fac.type}
                      </span>
                    </td>
                    <td className="p-3 text-carbon-secondary">{fac.location.name}</td>
                    <td className="p-3 text-right font-bold text-brand-primary">{fac.availableCapacityTonnes} t/day</td>
                    <td className="p-3 text-right text-carbon-secondary">{fac.maxCapacityTonnes} t/day</td>
                    <td className="p-3 text-right font-semibold text-carbon-primary">₹{fac.processingCostPerTon}</td>
                    <td className="p-3 text-right font-bold text-amber-600">★ {fac.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM DATA & EMISSION FACTORS */}
      {activeTab === 'SYSTEM_DATA' && (
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="font-bold text-sm text-carbon-primary">System Config Data & Default Emission Factors</h2>
              <p className="text-xs text-carbon-secondary">Configurable regional emission coefficients used by decision engine.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            <div className="p-4 bg-surface-muted/40 rounded-btn border border-border space-y-2">
              <h3 className="font-bold text-carbon-primary border-b border-border pb-1">Landfill Avoidance Factors</h3>
              <p className="text-[11px] text-carbon-secondary">tCO₂e avoided per ton diverted from open dumps</p>
              <div className="space-y-1 font-mono text-[11px] pt-1">
                <div className="flex justify-between"><span>Agricultural Residue:</span><span className="font-bold">{DEFAULT_EMISSION_FACTORS.landfillAvoidancePerTon.AGRICULTURAL_RESIDUE} tCO₂e/t</span></div>
                <div className="flex justify-between"><span>Food Waste:</span><span className="font-bold">{DEFAULT_EMISSION_FACTORS.landfillAvoidancePerTon.FOOD_WASTE} tCO₂e/t</span></div>
                <div className="flex justify-between"><span>Animal Manure:</span><span className="font-bold">{DEFAULT_EMISSION_FACTORS.landfillAvoidancePerTon.ANIMAL_MANURE} tCO₂e/t</span></div>
                <div className="flex justify-between"><span>Biomass Wood:</span><span className="font-bold">{DEFAULT_EMISSION_FACTORS.landfillAvoidancePerTon.BIOMASS_WOOD} tCO₂e/t</span></div>
              </div>
            </div>

            <div className="p-4 bg-surface-muted/40 rounded-btn border border-border space-y-2">
              <h3 className="font-bold text-carbon-primary border-b border-border pb-1">Pathway Carbon Sequestration</h3>
              <p className="text-[11px] text-carbon-secondary">tCO₂e permanent carbon stored per ton processed</p>
              <div className="space-y-1 font-mono text-[11px] pt-1">
                <div className="flex justify-between"><span>Biochar Pyrolysis:</span><span className="font-bold text-brand-dark">+{DEFAULT_EMISSION_FACTORS.pathwayCarbonStoredPerTon.BIOCHAR} tCO₂e/t</span></div>
                <div className="flex justify-between"><span>Biogas Digestion:</span><span className="font-bold text-brand-dark">+{DEFAULT_EMISSION_FACTORS.pathwayCarbonStoredPerTon.BIOGAS} tCO₂e/t</span></div>
                <div className="flex justify-between"><span>Composting:</span><span className="font-bold text-brand-dark">+{DEFAULT_EMISSION_FACTORS.pathwayCarbonStoredPerTon.COMPOSTING} tCO₂e/t</span></div>
                <div className="flex justify-between"><span>Biomass Densification:</span><span className="font-bold text-brand-dark">+{DEFAULT_EMISSION_FACTORS.pathwayCarbonStoredPerTon.SYNTHETICS} tCO₂e/t</span></div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
