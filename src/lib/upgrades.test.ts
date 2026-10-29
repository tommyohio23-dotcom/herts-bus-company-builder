import { describe, expect, it } from 'vitest';
import { upgradeCost, upgradeUpkeep } from './upgrades';
import { managementDay } from './management';
describe('paid additional features', () => {
  it('charges 1200 for USB installation', () => expect(upgradeCost(['USB charging ports'])).toBe(1200));
  it('charges more for leather seats', () => expect(upgradeCost(['Leather seats'])).toBe(6000));
  it('does not reinstall or double-charge an existing extra', () => expect(upgradeCost(['CCTV', 'CCTV'], ['CCTV'])).toBe(0));
  it('charges daily USB and leather upkeep', () => expect(upgradeUpkeep(['USB charging ports', 'Leather seats'])).toBe(7));
  it('includes extra upkeep in saved operating costs', () => expect(managementDay([], [{status:'Spare',route_id:null,features:['USB charging ports'],condition:85}],[],[],1).costs).toBe(2));
});