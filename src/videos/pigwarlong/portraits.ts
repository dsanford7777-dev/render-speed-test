// Archive portraits for the name cards, downloaded from Wikimedia Commons by the fetch-files workflow. US public domain
// only (published before 1931, or no known restrictions); each entry notes its Commons file. A name card without an
// entry draws a stand-in figure. pos = focus point, zoom = crop in on the face.
export type Portrait = { file: string; pos?: string; zoom?: number; src: string };
export const PORTRAITS: Record<string, Portrait> = {
  pickett: { file: "pigwarlong/portraits/pickett.jpg", pos: "50% 30%", zoom: 1.15, src: "GeorgePickettearlyphoto.jpg (PD, 19th c.)" },
  scott: { file: "pigwarlong/portraits/scott.jpg", pos: "50% 25%", src: "Winfield_Scott_by_Fredricks,_1862_crop.jpg (PD, 1862)" },
  harney: { file: "pigwarlong/portraits/harney.jpg", pos: "50% 30%", zoom: 1.45, src: "Portrait_of_William_Selby_Harney.jpg (PD-1923, c. 1830-35)" },
  douglas: { file: "pigwarlong/portraits/douglas.jpg", pos: "50% 30%", src: "Sir_James_Douglas-1876.jpg (PD, 1876)" },
  kaiser: { file: "pigwarlong/portraits/kaiser.jpg", pos: "50% 14%", zoom: 2.0, src: "Wilhelm_I_German_Emperor_circa_1870.jpg (PD-1923)" },
  buchanan: { file: "pigwarlong/portraits/buchanan.jpg", pos: "50% 25%", src: "James_Buchanan.jpg (PD, Brady)" },
  bancroft: { file: "pigwarlong/portraits/bancroft.jpg", pos: "40% 20%", zoom: 2.2, src: "George_Bancroft_United_States_Secretary_of_Navy_c._1860.jpg (Brady-Handy, no known restrictions)" },
  hornby: { file: "pigwarlong/portraits/hornby.jpg", pos: "50% 30%", zoom: 1.1, src: "Geoffrey_Phipps_Hornby.jpg (Clowes 1903, PD)" },
};
