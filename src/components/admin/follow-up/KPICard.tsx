type KPIColorVariant = "blue" | "yellow" | "red" | "green" | "purple";

interface KPICardProps {
  title: string;
  value: number | string;
  variant?: KPIColorVariant;
  subtitle?: string;
}

const variantClasses: Record<KPIColorVariant, string> = {
  blue: "bg-blue-400/10 text-blue-300 border-blue-400/30",
  yellow: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  red: "bg-red-400/10 text-red-300 border-red-400/30",
  green: "bg-green-400/10 text-green-300 border-green-400/30",
  purple: "bg-purple-400/10 text-purple-300 border-purple-400/30",
};

export function KPICard({ title, value, variant = "blue", subtitle }: KPICardProps) {
  return (
    <div className={`rounded-card border p-4 backdrop-blur-xl ${variantClasses[variant]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
    </div>
  );
}
