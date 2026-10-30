import { describe, it, expect } from "vitest";
import { simulateDay, BUS_DAILY_COST } from "./sim";

describe("simulateDay", () => {
  it("earns nothing from routes with no buses", () => {
    const r = simulateDay([{ id: "a", frequency_mins: 30, fare: 2 }], [], []);
    expect(r.revenue).toBe(0);
    expect(r.costs).toBe(0);
  });
  it("only counts buses that are In service", () => {
    const r = simulateDay(
      [{ id: "a", frequency_mins: 120, fare: 2 }],
      [{ route_id: "a", status: "Workshop" }, { route_id: "a", status: "In service" }],
      [{wage:140,role:"Driver",route_id:"a"}],
    );
    expect(r.activeBuses).toBe(1);
    expect(r.costs).toBe(BUS_DAILY_COST + 140);
  });
});
