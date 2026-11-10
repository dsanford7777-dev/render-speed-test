// Archive portraits for the name cards. US public domain only (published before 1931, or US government work);
// each entry notes its source. A name card without an entry draws a stand-in figure.
export type Portrait = { file: string; pos?: string; src: string };
export const PORTRAITS: Record<string, Portrait> = {};
