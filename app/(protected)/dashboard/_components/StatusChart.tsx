'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface DistribusiStatus {
    tersedia: number
    dipinjam: number
}

const COLORS = [
    { key: 'Tersedia', color: '#639922' },
    { key: 'Dipinjam', color: '#EF9F27' },
]

export default function StatusChart({ data }: { data: DistribusiStatus }) {
    const chartData = [
        { name: 'Tersedia', value: data.tersedia },
        { name: 'Dipinjam', value: data.dipinjam },
    ]

    const total = chartData.reduce((s, d) => s + d.value, 0)

    return (
        <div>
            <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                    >
                        {chartData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index].color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        formatter={(val) => [`${val ?? 0} produk`, '']}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-col gap-2 mt-2">
                {chartData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <span
                                className="w-2.5 h-2.5 rounded-sm inline-block"
                                style={{ background: COLORS[i].color }}
                            />
                            {d.name}
                        </span>
                        <span className="font-medium">
                            {d.value}{' '}
                            <span className="text-muted-foreground font-normal text-xs">
                                ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
