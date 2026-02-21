export interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color?: string; // Optional color for different stat types
  trend?: 'up' | 'down' | 'neutral'; // Optional trend indicator
}
