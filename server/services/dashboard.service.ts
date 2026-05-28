import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

// ---- Return Types ----

export interface AktivitasBulanan {
  bulan: string;
  dipinjam: number;
  dikembalikan: number;
  diambil: number;
}

export interface PeminjamanAktif {
  id: number;
  nama_barang: string;
  unit: string;
  jumlah: number;
  nama_peminjam: string;
  tanggal_pinjam: Date;
  keterangan: string;
}

export interface PengambilanTerbaru {
  id: number;
  nama_barang: string;
  unit: string;
  jumlah: number;
  nama_pengambil: string;
  tanggal_ambil: Date;
  keterangan: string;
}

export interface DashboardSummary {
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

// ---- Prisma Select Types ----

const rawBorrowingSelect = {
  created_at: true,
  updated_at: true,
  returned: true,
} satisfies Prisma.borrowingSelect;

const rawTakingSelect = {
  created_at: true,
} satisfies Prisma.takingSelect;

const peminjamanSelect = {
  id: true,
  amount: true,
  created_at: true,
  description: true,
  user: { select: { username: true } },
  products: {
    select: {
      name: true,
      unit: { select: { name: true } },
    },
  },
} satisfies Prisma.borrowingSelect;

const pengambilanSelect = {
  id: true,
  amount: true,
  created_at: true,
  description: true,
  user: { select: { username: true } },
  products: {
    select: {
      name: true,
      unit: { select: { name: true } },
    },
  },
} satisfies Prisma.takingSelect;

// Infer tipe dari select agar sinkron otomatis dengan schema Prisma
type RawBorrowing = Prisma.borrowingGetPayload<{
  select: typeof rawBorrowingSelect;
}>;
type RawTaking = Prisma.takingGetPayload<{ select: typeof rawTakingSelect }>;
type PeminjamanRow = Prisma.borrowingGetPayload<{
  select: typeof peminjamanSelect;
}>;
type PengambilanRow = Prisma.takingGetPayload<{
  select: typeof pengambilanSelect;
}>;

// ---- Helpers ----

// Date → "YYYY-MM"
function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildAktivitasBulanan(
  rawBorrowings: RawBorrowing[],
  rawTakings: RawTaking[],
  now: Date,
): AktivitasBulanan[] {
  const map: Record<string, AktivitasBulanan> = {};

  // Inisialisasi 6 bulan terakhir
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = toMonthKey(d);
    map[key] = { bulan: key, dipinjam: 0, dikembalikan: 0, diambil: 0 };
  }

  for (const b of rawBorrowings) {
    const createdKey = toMonthKey(b.created_at);
    if (map[createdKey]) map[createdKey].dipinjam += 1;

    if (b.returned) {
      const returnedKey = toMonthKey(b.updated_at);
      if (map[returnedKey]) map[returnedKey].dikembalikan += 1;
    }
  }

  for (const t of rawTakings) {
    const key = toMonthKey(t.created_at);
    if (map[key]) map[key].diambil += 1;
  }

  return Object.values(map);
}

function mapPeminjaman(rows: PeminjamanRow[]): PeminjamanAktif[] {
  return rows.map((b) => ({
    id: Number(b.id), // BigInt → number (aman karena ID tidak melebihi Number.MAX_SAFE_INTEGER)
    nama_barang: b.products.name,
    unit: b.products.unit.name,
    jumlah: b.amount,
    nama_peminjam: b.user.username,
    tanggal_pinjam: b.created_at,
    keterangan: b.description ?? "-",
  }));
}

function mapPengambilan(rows: PengambilanRow[]): PengambilanTerbaru[] {
  return rows.map((t) => ({
    id: t.id,
    nama_barang: t.products.name,
    unit: t.products.unit.name,
    jumlah: t.amount,
    nama_pengambil: t.user.username,
    tanggal_ambil: t.created_at,
    keterangan: t.description ?? "-",
  }));
}

// ---- Main Service ----

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    totalDipinjam,
    dikembalikanBulanIni,
    belumKembaliLebihSebulan,
    pengambilanBulanIni,
    rawBorrowings,
    rawTakings,
    distribusiTersedia,
    distribusiDipinjam,
    peminjamanAktifTerbaru,
    pengambilanTerbaru,
  ] = await Promise.all([
    prisma.products.count({ where: { deleted_at: null } }),

    prisma.borrowing.aggregate({
      _sum: { amount: true },
      where: { returned: false, deleted_at: null },
    }),

    prisma.borrowing.aggregate({
      _sum: { amount: true },
      where: {
        returned: true,
        updated_at: { gte: startOfMonth },
        deleted_at: null,
      },
    }),

    prisma.borrowing.count({
      where: {
        returned: false,
        created_at: { lt: thirtyDaysAgo },
        deleted_at: null,
      },
    }),

    prisma.taking.aggregate({
      _sum: { amount: true },
      where: { created_at: { gte: startOfMonth }, deleted_at: null },
    }),

    prisma.borrowing.findMany({
      where: { created_at: { gte: sixMonthsAgo }, deleted_at: null },
      select: rawBorrowingSelect,
    }),

    prisma.taking.findMany({
      where: { created_at: { gte: sixMonthsAgo }, deleted_at: null },
      select: rawTakingSelect,
    }),

    prisma.products.count({ where: { deleted_at: null, borrowed: false } }),

    prisma.products.count({ where: { deleted_at: null, borrowed: true } }),

    prisma.borrowing.findMany({
      where: { returned: false, deleted_at: null },
      orderBy: { created_at: "desc" },
      take: 10,
      select: peminjamanSelect,
    }),

    prisma.taking.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: "desc" },
      take: 5,
      select: pengambilanSelect,
    }),
  ]);

  return {
    total_produk: totalProducts,
    total_dipinjam: totalDipinjam._sum.amount ?? 0,
    dikembalikan_bulan_ini: dikembalikanBulanIni._sum.amount ?? 0,
    belum_kembali_lebih_sebulan: belumKembaliLebihSebulan,
    pengambilan_bulan_ini: pengambilanBulanIni._sum.amount ?? 0,
    distribusi_status: {
      tersedia: distribusiTersedia,
      dipinjam: distribusiDipinjam,
    },
    aktivitas_bulanan: buildAktivitasBulanan(rawBorrowings, rawTakings, now),
    peminjaman_aktif_terbaru: mapPeminjaman(peminjamanAktifTerbaru),
    pengambilan_terbaru: mapPengambilan(pengambilanTerbaru),
  };
}
