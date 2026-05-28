'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'

interface AktivitasBulanan {
    bulan: string
    dipinjam: number
    dikembalikan: number
    diambil: number
}

function formatBulan(key: string): string {
    const [year, month] = key.split('-')
    const date = new Date(Number(year), Number(month) - 1, 1)
    return date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
}

export default function ActivityChart({ data }: { data: AktivitasBulanan[] }) {
    const chartData = data.map((d) => ({
        ...d,
        bulanLabel: formatBulan(d.bulan),
    }))

    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="30%" barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" vertical={false} />
                <XAxis dataKey="bulanLabel" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    cursor={{ fill: 'rgba(128,128,128,0.06)' }}
                />
                <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="dipinjam" name="Dipinjam" fill="#378ADD" radius={[3, 3, 0, 0]} />
                <Bar dataKey="dikembalikan" name="Dikembalikan" fill="#639922" radius={[3, 3, 0, 0]} />
                <Bar dataKey="diambil" name="Diambil permanen" fill="#888780" radius={[3, 3, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
