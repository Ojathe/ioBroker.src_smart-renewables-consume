import { AdapterInstance } from '@iobroker/adapter-core';
import { AverageValue } from './average-value';
import { getStateAsBoolean, getStateAsNumber } from './util/state-util';
import { EXTERNAL_STATE_LANDINGZONE } from './dp-handler';
import { round } from '../util/math';

export class AverageValueGroup {
	private constructor(private adapter: AdapterInstance) {
	}

	private _solar: AverageValue | undefined;

	public get solar(): AverageValue {
		return this._solar!;
	}

	private _powerPv: AverageValue | undefined;

	public get powerPv(): AverageValue {
		return this._powerPv!;
	}

	private _powerDif: AverageValue | undefined;

	public get powerDif(): AverageValue {
		return this._powerDif!;
	}

	private _powerGrid: AverageValue | undefined;

	public get powerGrid(): AverageValue {
		return this._powerGrid!;
	}

	private _batLoad: AverageValue | undefined;

	public get batLoad(): AverageValue {
		return this._batLoad!;
	}

	static async build(adapter: AdapterInstance): Promise<AverageValueGroup> {
		const val = new AverageValueGroup(adapter);

		val._solar = await AverageValue.build(adapter, 'solar-radiation', {
			desc: 'Average solar radiation',
			xidSource: EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION,
			unit: 'wm²',
		});

		val._powerPv = await AverageValue.build(adapter, 'power-pv', {
			desc: 'PV generation',
			xidSource: EXTERNAL_STATE_LANDINGZONE.PV_GENERATION,
			unit: 'kW',
		});

		val._batLoad = await AverageValue.build(adapter, 'bat-load', {
			desc: 'The Battery load (-) consuming / (+) charging',
			xidSource: EXTERNAL_STATE_LANDINGZONE.BAT_LOAD,
			unit: 'kW',
		});

		val._powerDif = await AverageValue.build(adapter, 'power-dif', {
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

		val._powerGrid = await AverageValue.build(adapter, 'power-grid', {
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
		await this.powerDif.calculate();
		await this.powerGrid.calculate();
		await this.powerPv.calculate();
		await this.solar.calculate();
	}

}


