import React from 'react';
import { Facility, WasteLot } from '../types';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, TrendingUp, Leaf, Factory } from 'lucide-react';

interface AnalyticsViewProps {
  wasteLots: WasteLot[];
  facilities: Facility[];
}

const pathwayDistData = [
  { name: 'Biochar', value: 45, color: '#16794A' },
  { name: 'Biogas', value: 35, color: '#25A866' },
  { name: 'Composting', value: 15, color: '#D99422' },
  { name: 'Synthetics', value: 5, color: '#3B82F6' },
];

const wasteTypeDistData = [
  { type: 'Agri Residue', volume: 5400 },
  { type: 'Food Waste', volume: 3800 },
  { type: 'Animal Manure', volume: 2100 },
  { type: 'Biomass Wood', volume: 1540 },
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ wasteLots, facilities }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-carbon-primary tracking-tight">Network Analytics & Data Insights</h1>
          <p className="text-xs text-carbon-secondary">Macro-level intelligence on waste flows, pathway distribution, and facility throughput.</p>
        </div>
      </div>

      {/* 2x2 Grid of Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Pathway Distribution */}
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
          <h2 className="font-bold text-sm text-carbon-primary">Diversion by Conversion Pathway</h2>
          <p className="text-xs text-carbon-secondary">Percentage split across Biochar, Biogas, Composting and Synthetics</p>

          <div className="h-60 w-full">
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
          </div>
        </div>

        {/* Chart 2: Waste Type Volume */}
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
          <h2 className="font-bold text-sm text-carbon-primary">Volume by Feedstock Classification</h2>
          <p className="text-xs text-carbon-secondary">Total tonnes diverted per waste category (September 2026)</p>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteTypeDistData}>
                <XAxis dataKey="type" stroke="#89928C" fontSize={11} tickLine={false} />
                <YAxis stroke="#89928C" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3E7E3', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="volume" name="Volume (Tonnes)" fill="#16794A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Facility Throughput Table */}
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

    </div>
  );
};
