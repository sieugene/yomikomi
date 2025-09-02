import { StatCard } from "../../types";

export const StatsCard: React.FC<StatCard> = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white p-4 rounded-lg shadow border">
    <div className="flex items-center">
      <Icon className={`w-8 h-8 ${color} mr-3`} />
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  </div>
);
