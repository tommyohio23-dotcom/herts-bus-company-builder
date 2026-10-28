import real from "./bus-photos-real.json";

export type PhotoCredit = { url: string; page: string; author: string; license: string };
const MODELS = real.models as Record<string, PhotoCredit>;
const OPS = real.operators as Record<string, PhotoCredit>;
const FLEET = real.fleet as Record<string, PhotoCredit>;

/** Real Wikimedia Commons photo: that operator's own bus of that model first, then the model in general. */
export function realBusPhoto(presetKey: string | null, model: string): PhotoCredit | undefined {
  return (presetKey ? FLEET[`${presetKey}|${model}`] : undefined) ?? MODELS[model];
}
export const realOperatorPhoto = (key: string): PhotoCredit | undefined => OPS[key];
