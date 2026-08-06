export type PhotoTag =
  | "TRAVEL"
  | "STREET"
  | "PORTRAITS"
  | "LANDSCAPE"
  | "ARCHITECTURE"
  | "EVERYDAY"
  | "FILM";

export type Photo = {
  no: string;
  title: string;
  place: string;
  year: string;
  cam: string;
  exif: string;
  tag: PhotoTag;
  file: string;
  w: number;
  h: number;
};

export const photos = [
  {
    no: "01",
    title: "Nets, low tide",
    place: "Fort Kochi",
    year: "2023",
    cam: "Pentax K1000",
    exif: "f/8 · 1/1000 · ISO 100",
    tag: "TRAVEL",
    file: "01-nets-low-tide.jpg",
    w: 3000,
    h: 2000,
  },
  {
    no: "02",
    title: "Blue wall",
    place: "Mattancherry",
    year: "2023",
    cam: "Ricoh GR III",
    exif: "f/5.6 · 1/400 · ISO 200",
    tag: "ARCHITECTURE",
    file: "02-blue-wall.jpg",
    w: 2000,
    h: 3000,
  },
  {
    no: "03",
    title: "Fruit seller",
    place: "Shivajinagar",
    year: "2024",
    cam: "Ricoh GR III",
    exif: "f/2.8 · 1/125 · ISO 400",
    tag: "PORTRAITS",
    file: "03-fruit-seller.jpg",
    w: 2400,
    h: 3000,
  },
  {
    no: "04",
    title: "Last bus",
    place: "MG Road",
    year: "2025",
    cam: "Ricoh GR III",
    exif: "f/2 · 1/60 · ISO 1600",
    tag: "STREET",
    file: "04-last-bus.jpg",
    w: 2400,
    h: 2400,
  },
  {
    no: "05",
    title: "Repainting the hull",
    place: "Alleppey",
    year: "2023",
    cam: "Pentax K1000",
    exif: "f/11 · 1/250 · ISO 100",
    tag: "FILM",
    file: "05-repainting-the-hull.jpg",
    w: 2250,
    h: 3000,
  },
  {
    no: "06",
    title: "After the rain",
    place: "Cubbon Park",
    year: "2022",
    cam: "Ricoh GR III",
    exif: "f/4 · 1/200 · ISO 320",
    tag: "EVERYDAY",
    file: "06-after-the-rain.jpg",
    w: 3200,
    h: 1800,
  },
  {
    no: "07",
    title: "Stairwell, godown",
    place: "Mattancherry",
    year: "2023",
    cam: "Ricoh GR III",
    exif: "f/2.8 · 1/60 · ISO 800",
    tag: "ARCHITECTURE",
    file: "07-stairwell-godown.jpg",
    w: 2000,
    h: 3000,
  },
  {
    no: "08",
    title: "Nandi at 6am",
    place: "Nandi Hills",
    year: "2026",
    cam: "Pentax K1000",
    exif: "f/16 · 1/125 · ISO 100",
    tag: "LANDSCAPE",
    file: "08-nandi-at-6am.jpg",
    w: 3000,
    h: 2400,
  },
  {
    no: "09",
    title: "Two men talking",
    place: "Russell Market",
    year: "2024",
    cam: "Ricoh GR III",
    exif: "f/5.6 · 1/500 · ISO 200",
    tag: "STREET",
    file: "09-two-men-talking.jpg",
    w: 2250,
    h: 3000,
  },
  {
    no: "10",
    title: "Bar window",
    place: "Church Street",
    year: "2025",
    cam: "Ricoh GR III",
    exif: "f/1.8 · 1/40 · ISO 3200",
    tag: "STREET",
    file: "10-bar-window.jpg",
    w: 2400,
    h: 2400,
  },
  {
    no: "11",
    title: "Tea, second cup",
    place: "Home",
    year: "2021",
    cam: "Ricoh GR III",
    exif: "f/2.8 · 1/80 · ISO 800",
    tag: "EVERYDAY",
    file: "11-tea-second-cup.jpg",
    w: 2400,
    h: 3000,
  },
  {
    no: "12",
    title: "Backwater bend",
    place: "Alleppey",
    year: "2023",
    cam: "Pentax K1000",
    exif: "f/11 · 1/250 · ISO 100",
    tag: "LANDSCAPE",
    file: "12-backwater-bend.jpg",
    w: 2000,
    h: 3000,
  },
  {
    no: "13",
    title: "Ammi, kitchen light",
    place: "Home",
    year: "2022",
    cam: "Pentax K1000",
    exif: "f/2 · 1/30 · ISO 800",
    tag: "PORTRAITS",
    file: "13-ammi-kitchen-light.jpg",
    w: 3000,
    h: 2000,
  },
  {
    no: "14",
    title: "Empty junction",
    place: "Koramangala",
    year: "2025",
    cam: "Ricoh GR III",
    exif: "f/1.8 · 1/25 · ISO 6400",
    tag: "STREET",
    file: "14-empty-junction.jpg",
    w: 1688,
    h: 3000,
  },
  {
    no: "15",
    title: "Ferry, back deck",
    place: "Fort Kochi",
    year: "2023",
    cam: "Ricoh GR III",
    exif: "f/8 · 1/500 · ISO 200",
    tag: "TRAVEL",
    file: "15-ferry-back-deck.jpg",
    w: 3000,
    h: 2400,
  },
  {
    no: "16",
    title: "Wet road, neon",
    place: "Indiranagar",
    year: "2025",
    cam: "Ricoh GR III",
    exif: "f/1.8 · 1/30 · ISO 3200",
    tag: "STREET",
    file: "16-wet-road-neon.jpg",
    w: 3360,
    h: 1440,
  },
] as const satisfies readonly Photo[];

export const hiddenPhotoFile = "17-the-one-that-nearly-wasnt.jpg";

export function photoMeta(photo: Photo): string {
  return `${photo.place} · ${photo.cam} · ${photo.exif}`;
}

export function stepPhotoIndex(index: number, delta: number): number {
  return (index + delta + photos.length) % photos.length;
}

export function formatFrameCount(count: number, compact: boolean): string {
  return compact ? `${count} SHOT` : `${count} FRAMES SHOT`;
}
