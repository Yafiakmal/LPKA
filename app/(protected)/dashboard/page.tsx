import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowRight, Check, Clock, LogOut } from "lucide-react";
import ActivityChart from "./_components/ActivityChart";
import StatusChart from "./_components/StatusChart";
import { getDashboardSummary } from "@/server/services/dashboard.service";

// ---- Types ----
interface AktivitasBulanan {
  bulan: string;
  dipinjam: number;
  dikembalikan: number;
  diambil: number;
}

interface PeminjamanAktif {
  id: number;
  nama_barang: string;
  unit: string;
  jumlah: number;
  nama_peminjam: string;
  tanggal_pinjam: string;
  keterangan: string;
}

interface PengambilanTerbaru {
  id: number;
  nama_barang: string;
  unit: string;
  jumlah: number;
  nama_pengambil: string;
  tanggal_ambil: string;
  keterangan: string;
}

interface DashboardData {
  total_produk: number;
  total_dipinjam: number;
  dikembalikan_bulan_ini: number;
  belum_kembali_lebih_sebulan: number;
  pengambilan_bulan_ini: number;
  distribusi_status: {
    tersedia: number;
    dipinjam: number;
  };
  aktivitas_bulanan: AktivitasBulanan[];
  peminjaman_aktif_terbaru: PeminjamanAktif[];
  pengambilan_terbaru: PengambilanTerbaru[];
}

// ---- Fetch ----

// ---- Helpers ----
function formatTanggal(iso: string | Date): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ---- Stat Card ----
interface StatCardProps {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  variant?: "default" | "warning" | "success" | "danger" | "info";
}

const variantStyles = {
  default: {
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    valueColor: "text-foreground",
  },
  warning: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    valueColor: "text-amber-700",
  },
  success: {
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    valueColor: "text-green-700",
  },
  danger: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    valueColor: "text-red-700",
  },
  info: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    valueColor: "text-blue-700",
  },
};

function StatCard({
  label,
  value,
  sub,
  icon,
  variant = "default",
}: StatCardProps) {
  const s = variantStyles[variant];
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.iconBg} ${s.iconColor}`}
          >
            {icon}
          </div>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className={`text-3xl font-medium ${s.valueColor}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}

// ---- Page ----
export default async function DashboardPage() {
  const data = await getDashboardSummary();
  // ...

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-medium">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ringkasan inventori LPKA Kelas 1 Martapura
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <StatCard
          label="Total jenis barang"
          value={data.total_produk}
          sub="jenis item terdaftar"
          icon={<Package size={16} />}
          variant="info"
        />
        <StatCard
          label="Sedang dipinjam"
          value={data.total_dipinjam}
          sub="unit aktif dipinjam"
          icon={<ArrowRight size={16} />}
          variant="warning"
        />
        <StatCard
          label="Dikembalikan bulan ini"
          value={data.dikembalikan_bulan_ini}
          sub="unit kembali bulan ini"
          icon={<Check size={16} />}
          variant="success"
        />
        <StatCard
          label="Perlu perhatian"
          value={data.belum_kembali_lebih_sebulan}
          sub="dipinjam lebih 30 hari"
          icon={<Clock size={16} />}
          variant={data.belum_kembali_lebih_sebulan > 0 ? "danger" : "default"}
        />
        <StatCard
          label="Pengambilan bulan ini"
          value={data.pengambilan_bulan_ini}
          sub="unit diambil permanen"
          icon={<LogOut size={16} />}
          variant="default"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Card className="xl:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Aktivitas bulanan
            </CardTitle>
            <p className="text-xs text-muted-foreground">6 bulan terakhir</p>
          </CardHeader>
          <CardContent>
            <ActivityChart data={data.aktivitas_bulanan} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status barang</CardTitle>
            <p className="text-xs text-muted-foreground">Distribusi saat ini</p>
          </CardHeader>
          <CardContent>
            <StatusChart data={data.distribusi_status} />
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Peminjaman Aktif */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Peminjaman aktif terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.peminjaman_aktif_terbaru.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Tidak ada peminjaman aktif
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead>Peminjam</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.peminjaman_aktif_terbaru.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {item.nama_barang}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.jumlah} {item.unit}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.nama_peminjam}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTanggal(item.tanggal_pinjam)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pengambilan Terbaru */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pengambilan permanen terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.pengambilan_terbaru.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Tidak ada data pengambilan
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.pengambilan_terbaru.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {item.nama_barang}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.jumlah} {item.unit}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.keterangan}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTanggal(item.tanggal_ambil)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
