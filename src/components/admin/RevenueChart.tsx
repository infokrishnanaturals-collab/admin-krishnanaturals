"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
    data: { name: string; total: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400 font-medium">
                Not enough data to display.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--forest)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--forest)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--gray-500)", fontSize: 12 }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--gray-500)", fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                    contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        fontWeight: "bold",
                        color: "var(--forest-dark)"
                    }}
                    itemStyle={{ color: "var(--forest)" }}
                    formatter={(value: any) => [`₹${value}`, "Revenue"]}
                />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--forest)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 6, fill: "var(--gold)", stroke: "#fff", strokeWidth: 2 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
