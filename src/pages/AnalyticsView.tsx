import React from 'react';
import { Facility, WasteLot } from '../types';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, TrendingUp, Leaf, Factory, Scale, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WASTE_TYPE_LABELS } from '../data/constants';

interface AnalyticsViewProps {
  wasteLots: WasteLot[];
  facilities: Facility[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ wasteLots, facilities }) => {
  const { user } = useAuth();
  const isFacilityOperator = user?.role === 'facility_operator';

  const isDemoFacilityUser = user?.email?.toLowerCase() === 'facility@carboncycle.io';

  // Identify operator's facility
  const myFacility = isFacilityOperator
    ? facilities.find((f) => user?.email && f.contactEmail?.toLowerCase() === user.email.toLowerCase()) ||
      facilities.find((f) => (user?.id || (user as any)?._id) && (f.operatorId === user?.id || f.operatorId === (user as any)?._id)) ||
      facilities.find((f) => user?.organizationName && (f.name.toLowerCase().includes(user.organizationName.toLowerCase().trim()) || user.organizationName.toLowerCase().includes(f.name.toLowerCase().trim()))) ||
      (isDemoFacilityUser ? (facilities.find((f) => f.name.toLowerCase().includes('ecochar')) || facilities[0]) : null) ||
      {
        id: (user as any)?.facilityId || `FAC-${String(user?.id || user?.email || 'NEW').slice(-4).toUpperCase()}`,
        name: user?.organizationName || `${user?.name || 'Operator'}'s Conversion Center`,
        type: 'BIOCHAR' as const,
        acceptedWasteTypes: ['AGRICULTURAL_RESIDUE', 'BIOMASS_WOOD'] as any[],
        maxCapacityTonnes: 50.0,
        availableCapacityTonnes: 50.0,
        location: {
          name: user?.organizationName || 'Regional Conversion Center',
          address: user?.location || 'Gandhinagar Bio-Industrial Zone, Gujarat',
          lat: 23.2156,
          lng: 72.6369,
        },
        processingCostPerTon: 950,
        carbonFactorPerTon: 0.45,
        rating: 5.0,
        contactEmail: user?.email,
        operatorId: user?.id || (user as any)?._id,
        activeBatchesCount: 0,
        status: 'ACTIVE' as const,
      }
    : null;

  // Filter lots if facility operator
  const scopedLots = isFacilityOperator && myFacility
    ? wasteLots.filter((l) => {
        if (l.matchedFacilityId === myFacility.id) return true;
        if (l.status === 'MATCH_REQUESTED') {
          if (l.requestedFacilityId === myFacility.id) return true;
          if (l.requestedFacilities && l.requestedFacilities.some((r) => r.facilityId === myFacility.id && r.status === 'PENDING')) return true;
        }
        return false;
      })
    : wasteLots;

  // Dynamic pathway distribution from live scoped lots
  const pathwayCounts: Record<string, number> = {};
  scopedLots.forEach((l) => {
    const pw = l.selectedPathway || l.matchedFacilityType || 'BIOCHAR';
    pathwayCounts[pw] = (pathwayCounts[pw] || 0) + (l.fingerprint.quantityTonnes || 1);
  });
  const totalPathwayTonnes = Object.values(pathwayCounts).reduce((a, b) => a + b, 0) || 1;
  const pathwayColors: Record<string, string> = {
    BIOCHAR: '#16794A',
    BIOGAS: '#25A866',
    COMPOSTING: '#D99422',
    SYNTHETICS: '#3B82F6',
  };
  const pathwayDistData = Object.entries(pathwayCounts).map(([name, tonnes]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(),
    value: Math.max(1, Math.round((tonnes / totalPathwayTonnes) * 100)),
    color: pathwayColors[name] || '#16794A',
  }));

  // Dynamic waste type volume distribution from live scoped lots
  const wasteTypeCounts: Record<string, number> = {};
  scopedLots.forEach((l) => {
    const wt = l.fingerprint.wasteType;
    const label = WASTE_TYPE_LABELS[wt]?.label || wt;
    wasteTypeCounts[label] = (wasteTypeCounts[label] || 0) + (l.fingerprint.quantityTonnes || 0);
  });
  const wasteTypeDistData = Object.entries(wasteTypeCounts).map(([type, volume]) => ({
    type: type.length > 14 ? type.slice(0, 12) + '..' : type,
    volume: Math.round(volume * 10) / 10,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-carbon-primary tracking-tight">
            {isFacilityOperator ? `${myFacility?.name || 'Facility'} Analytics & Throughput` : 'Network Analytics & Data Insights'}
          </h1>
          <p className="text-xs text-carbon-secondary">
            {isFacilityOperator
              ? `Operational metrics, feedstock composition, and throughput calculated exclusively for ${myFacility?.name || 'your facility'}.`
              : 'Macro-level intelligence on waste flows, pathway distribution, and regional facility throughput.'}
          </p>
        </div>
      </div>

      {/* 2x2 Grid of Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Pathway Distribution */}
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
          <h2 className="font-bold text-sm text-carbon-primary">Diversion by Conversion Pathway</h2>
          <p className="text-xs text-carbon-secondary">
            {isFacilityOperator ? 'Pathway allocation for facility feedstock' : 'Percentage split across Biochar, Biogas, Composting and Synthetics'}
          </p>

          <div className="h-60 w-full flex items-center justify-center">
            {scopedLots.length === 0 ? (
              <div className="text-center text-xs text-carbon-muted p-4">
                No batches registered yet. Pathway breakdown will appear once waste is logged.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pathwayDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pathwayDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3E7E3', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend formatter={(value) => <span className="text-xs text-carbon-primary font-medium">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Waste Type Volume */}
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
          <h2 className="font-bold text-sm text-carbon-primary">Volume by Feedstock Classification</h2>
          <p className="text-xs text-carbon-secondary">
            {isFacilityOperator ? 'Feedstock volume processed by category (tonnes)' : 'Total tonnes diverted per waste category across network'}
          </p>

          <div className="h-60 w-full pt-2 flex items-center justify-center">
            {scopedLots.length === 0 ? (
              <div className="text-center text-xs text-carbon-muted p-4">
                No feedstock volume recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wasteTypeDistData}>
                  <XAxis dataKey="type" stroke="#89928C" fontSize={11} tickLine={false} />
                  <YAxis stroke="#89928C" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3E7E3', borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="volume" name="Volume (Tonnes)" fill="#16794A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Throughput Table - Facility scoped for operator, Network scoped for others */}
      {isFacilityOperator ? (
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-carbon-primary">{myFacility?.name} Batch Intake Register</h2>
              <p className="text-xs text-carbon-secondary">Feedstock batches routed to this facility and their conversion performance</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
              {scopedLots.length} Active Batches
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-surface-muted/80 text-[10px] font-bold text-carbon-secondary uppercase border-b border-border">
                <tr>
                  <th className="p-3">Batch ID</th>
                  <th className="p-3">Feedstock Type</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3">Generator</th>
                  <th className="p-3 text-right">Moisture</th>
                  <th className="p-3 text-right">Net Climate Benefit</th>
                  <th className="p-3 text-right">Conversion State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scopedLots.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-carbon-secondary">
                      No feedstock batches routed to this facility yet. Intake records will appear when batches are accepted.
                    </td>
                  </tr>
                ) : (
                  scopedLots.map((lot) => {
                    const label = WASTE_TYPE_LABELS[lot.fingerprint.wasteType]?.label || lot.fingerprint.wasteType;
                    const netImpact = lot.impactMetrics?.netClimateImpactCO2e || 0;

                    return (
                      <tr key={lot.id} className="hover:bg-surface-muted/50 transition">
                        <td className="p-3 font-bold text-carbon-primary">{lot.id}</td>
                        <td className="p-3 text-carbon-secondary">{label}</td>
                        <td className="p-3 text-right font-extrabold text-carbon-primary">{lot.fingerprint.quantityTonnes} t</td>
                        <td className="p-3 text-carbon-primary">{lot.generatorName}</td>
                        <td className="p-3 text-right text-carbon-secondary">{lot.fingerprint.moisturePercent}%</td>
                        <td className="p-3 text-right font-bold text-emerald-700">+{netImpact} tCO₂e</td>
                        <td className="p-3 text-right font-semibold">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-brand-soft text-brand-dark">
                            {lot.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
          <h2 className="font-bold text-sm text-carbon-primary">Facility Intake & Capacity Performance</h2>
          <p className="text-xs text-carbon-secondary">Operational load monitoring across regional facilities</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-surface-muted/80 text-[10px] font-bold text-carbon-secondary uppercase border-b border-border">
                <tr>
                  <th className="p-3">Facility Name</th>
                  <th className="p-3">Pathway</th>
                  <th className="p-3 text-right">Available Cap</th>
                  <th className="p-3 text-right">Max Capacity</th>
                  <th className="p-3 text-right">Utilization %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {facilities.map((fac) => {
                  const util = Math.round(((fac.maxCapacityTonnes - fac.availableCapacityTonnes) / fac.maxCapacityTonnes) * 100);

                  return (
                    <tr key={fac.id} className="hover:bg-surface-muted/50 transition">
                      <td className="p-3 font-bold text-carbon-primary">{fac.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-soft text-brand-dark">
                          {fac.type}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-brand-primary">{fac.availableCapacityTonnes} t</td>
                      <td className="p-3 text-right text-carbon-secondary">{fac.maxCapacityTonnes} t</td>
                      <td className="p-3 text-right font-extrabold text-carbon-primary">{util}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
