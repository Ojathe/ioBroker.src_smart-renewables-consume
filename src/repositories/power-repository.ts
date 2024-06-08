import { AdapterInstance } from '@iobroker/adapter-core';
import { AverageValue } from '../values/average-value';
import { getStateAsBoolean, getStateAsNumber } from '../util/state-util';
import { round } from '../util/math';
import { EXTERNAL_STATE_LANDINGZONE } from './landing-zone-repository';

export interface AverageValueGroupMembers {
	solarRadiation: AverageValue,
	powerPv: AverageValue,
	powerBalance: AverageValue,
	powerGrid: AverageValue,
	powerBattery: AverageValue
}

export type AverageValueGroupMemberValues = {
	[key in keyof AverageValueGroupMembers]: () => Promise<number>
}

export class PowerRepository {
	private solarRadiation: AverageValue | undefined;
	private powerBalance: AverageValue | undefined;
	private powerBattery: AverageValue | undefined;
	private powerPv: AverageValue | undefined;
	private powerGrid: AverageValue | undefined;

	private constructor() {
	}

	public get members(): AverageValueGroupMembers {

		if (!this.solarRadiation || !this.powerPv || !this.powerBalance || !this.powerGrid || !this.powerBattery) {
			throw new Error('make sure to build the value group before use its values');
		}

		return {
			solarRadiation: this.solarRadiation,
			powerPv: this.powerPv,
			powerBalance: this.powerBalance,
			powerGrid: this.powerGrid,
			powerBattery: this.powerBattery,
		};
	}

	public get avg(): AverageValueGroupMemberValues {
		return {
			solarRadiation: this.members.solarRadiation.avg.getValue,
			powerPv: this.members.powerPv.avg.getValue,
			powerBalance: this.members.powerBalance.avg.getValue,
			powerGrid: this.members.powerGrid.avg.getValue,
			powerBattery: this.members.powerBattery.avg.getValue,
		};
	}

	public get avg5(): AverageValueGroupMemberValues {
		return {
			solarRadiation: this.members.solarRadiation.avg5.getValue,
			powerPv: this.members.powerPv.avg5.getValue,
			powerBalance: this.members.powerBalance.avg5.getValue,
			powerGrid: this.members.powerGrid.avg5.getValue,
			powerBattery: this.members.powerBattery.avg5.getValue,
		};
	}

	public get current(): AverageValueGroupMemberValues {
		return {
			solarRadiation: this.members.solarRadiation.current.getValue,
			powerPv: this.members.powerPv.current.getValue,
			powerBalance: this.members.powerBalance.current.getValue,
			powerGrid: this.members.powerGrid.current.getValue,
			powerBattery: this.members.powerBattery.current.getValue,
		};
	}

	static async create(adapter: AdapterInstance): Promise<PowerRepository> {
		const val = new PowerRepository();

		val.solarRadiation = await AverageValue.build(adapter, 'solar-radiation', {
			desc: 'Average solar radiation',
			xidSource: EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION,
			unit: 'wm²',
		});

		val.powerPv = await AverageValue.build(adapter, 'power-pv', {
			desc: 'PV generation',
			xidSource: EXTERNAL_STATE_LANDINGZONE.PV_GENERATION,
			unit: 'kW',
		});

		val.powerBattery = await AverageValue.build(adapter, 'bat-load', {
			desc: 'The Battery load (-) consuming / (+) charging',
			xidSource: EXTERNAL_STATE_LANDINGZONE.BAT_LOAD,
			unit: 'kW',
		});

		val.powerBalance = await AverageValue.build(adapter, 'power-dif', {
			desc: 'difference of energy over generation (+) and loss consumption(-)',
			async mutation(_val: number) {
				const load = await getStateAsNumber(adapter, EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD);
				const pvPower = await getStateAsNumber(adapter, EXTERNAL_STATE_LANDINGZONE.PV_GENERATION);

				if (!load || !pvPower) {
					return Number.NEGATIVE_INFINITY;
				}

				console.debug(
					`Calculating PowerDif Load:${load} kWh, PV-Gen: ${pvPower} kWh => Dif of ${pvPower - load}`,
				);

				return round(pvPower - load);
			},
		});

		val.powerGrid = await AverageValue.build(adapter, 'power-grid', {
			desc: 'amount of generation(+) or buying(-) of energy',
			xidSource: EXTERNAL_STATE_LANDINGZONE.GRID_LOAD,
			async mutation(val: number) {
				const isGridBuying = (await getStateAsBoolean(adapter, EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING)) ?? true;
				return round(val * (isGridBuying ? -1 : 1));
			},
		});

		// TODO BatteryPower (lg-ess-home.0.user.essinfo.common.BATT.dc_power)

		return val;
	}

	public async calculate(): Promise<void> {
		for (const valueKey in this.members) {
			await this.members[valueKey as keyof AverageValueGroupMembers].calculate();
		}
	}

}


