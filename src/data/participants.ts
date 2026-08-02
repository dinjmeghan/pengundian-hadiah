export type Participant = {
  id: number;
  name: string;
  ticket: string;
};

const FIRST = [
  "Andi",
  "Siti",
  "Budi",
  "Dewi",
  "Rizky",
  "Putri",
  "Agus",
  "Nadia",
  "Fajar",
  "Intan",
  "Bayu",
  "Rina",
  "Hendra",
  "Maya",
  "Yoga",
  "Lestari",
  "Dimas",
  "Anisa",
  "Wahyu",
  "Sari",
];

const LAST = [
  "Rudianto",
  "Nurjanah",
  "Santoso",
  "Prasetyo",
  "Wijaya",
  "Hidayat",
  "Kusuma",
  "Maulana",
  "Ramadhan",
  "Setiawan",
  "Halim",
  "Pertiwi",
  "Saputra",
  "Anggraini",
  "Firmansyah",
  "Handayani",
];

export const PRIZES = [
  "Smart TV 55 Inch",
  "Sepeda Motor Listrik",
  "Kulkas 2 Pintu",
  "Laptop 14 Inch",
  "Mesin Cuci Front Loading",
  "Smartphone 5G",
  "Emas 5 Gram",
  "Voucher Belanja 5 Juta",
];

export const PARTICIPANTS: Participant[] = Array.from({ length: 1250 }, (_, i) => {
  const first = FIRST[(i * 7) % FIRST.length];
  const last = LAST[(i * 11) % LAST.length];
  return {
    id: i + 1,
    name: `${first} ${last}`.toUpperCase(),
    ticket: `JP-2026-${String(i + 1).padStart(6, "0")}`,
  };
});
