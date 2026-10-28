import arriva from "@/assets/buses/arriva-shires.jpg";
import uno from "@/assets/buses/uno.jpg";
import centrebus from "@/assets/buses/centrebus.jpg";
import trustybus from "@/assets/buses/trustybus.jpg";
import carousel from "@/assets/buses/carousel.jpg";
import redRose from "@/assets/buses/red-rose.jpg";
import redEagle from "@/assets/buses/red-eagle.jpg";
import redline from "@/assets/buses/redline.jpg";
import sullivan from "@/assets/buses/sullivan.jpg";
import gDouble from "@/assets/buses/generic-double.jpg";
import gSingle from "@/assets/buses/generic-single.jpg";
import gMini from "@/assets/buses/generic-mini.jpg";
import gElectric from "@/assets/buses/generic-electric.jpg";
import real from "./bus-photos-real.json";
import { modelKind, PRESETS, type PhotoKind } from "./herts";

const OPERATOR: Record<string, string> = {
  "arriva-shires": arriva, uno, centrebus, trustybus, carousel,
  "red-rose": redRose, "red-eagle": redEagle, redline, sullivan,
};
const GENERIC: Record<PhotoKind, string> = { double: gDouble, single: gSingle, mini: gMini, electric: gElectric };

/** Operator-liveried photo when the bus type matches the operator's photo, otherwise a plain photo of that bus type. */
export function busPhoto(presetKey: string | null, model: string) {
  const kind = modelKind(model);
  const preset = PRESETS.find((p) => p.key === presetKey);
  if (preset && preset.photoKind === kind && OPERATOR[preset.key]) return OPERATOR[preset.key]!;
  return GENERIC[kind];
}
export const operatorPhoto = (key: string) => OPERATOR[key] ?? gSingle;

export type PhotoCredit = { url: string; page: string; author: string; license: string };
const MODELS = real.models as Record<string, PhotoCredit>;
const OPS = real.operators as Record<string, PhotoCredit>;
/** Real Wikimedia Commons photo of the exact model, if we have one. */
export const realModelPhoto = (model: string): PhotoCredit | undefined => MODELS[model];
export const realOperatorPhoto = (key: string): PhotoCredit | undefined => OPS[key];
