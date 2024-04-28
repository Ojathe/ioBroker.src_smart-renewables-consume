import { XidBool, XidNumber } from '../values/xid';
import { AdapterInstance } from '@iobroker/adapter-core';
import { createObjectBool, createObjectNum } from '../util/create-objects-helper';

export const EXTERNAL_STATE_LANDINGZONE = {
	PV_GENERATION: 'ingoing.pv-generation',
	TOTAL_LOAD: 'ingoing.total-load',
	BAT_SOC: 'ingoing.bat-soc',
	SOLAR_RADIATION: 'ingoing.solar-radiation',
	IS_GRID_BUYING: 'ingoing.is-grid-buying',
	GRID_LOAD: 'ingoing.grid-load',
	BAT_LOAD: 'ingoing.bat-load',
};

export interface LandingZoneRepository {
	pvGeneration: XidNumber,
	totalLoad: XidNumber,
	gridLoad: XidNumber,
	batLoad: XidNumber,
	batterySoC: XidNumber,
	solarRadiation: XidNumber,
	isGridBuying: XidBool,
}

export class LandingZoneRepoImpl implements LandingZoneRepository {
	private constructor() {
	}

	private _gridLoad: XidNumber | undefined;

	get gridLoad(): XidNumber {
		return this._gridLoad!;
	}

	private _batLoad: XidNumber | undefined;

	get batLoad(): XidNumber {
		return this._batLoad!;
	}

	private _batterySoC: XidNumber | undefined;

	get batterySoC(): XidNumber {
		return this._batterySoC!;
	}

	private _solarRadiation: XidNumber | undefined;

	get solarRadiation(): XidNumber {
		return this._solarRadiation!;
	}

	private _isGridBuying: XidBool | undefined;

	get isGridBuying(): XidBool {
		return this._isGridBuying!;
	}

	private _totalLoad: XidNumber | undefined;

	public get totalLoad(): XidNumber {
		return this._totalLoad!;
	}

	private _pvGeneration: XidNumber | undefined;

	public get pvGeneration(): XidNumber {
		return this._pvGeneration!;
	}

	static async create(adapter: AdapterInstance): Promise<LandingZoneRepository> {

		const repo = new LandingZoneRepoImpl();
		await repo.createObjects(adapter);

		repo._pvGeneration = await XidNumber.asReadable(adapter, EXTERNAL_STATE_LANDINGZONE.PV_GENERATION);
		repo._totalLoad = await XidNumber.asReadable(adapter, EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD);
		repo._gridLoad = await XidNumber.asReadable(adapter, EXTERNAL_STATE_LANDINGZONE.GRID_LOAD);
		repo._batLoad = await XidNumber.asReadable(adapter, EXTERNAL_STATE_LANDINGZONE.BAT_LOAD);
		repo._batterySoC = await XidNumber.asReadable(adapter, EXTERNAL_STATE_LANDINGZONE.BAT_SOC);
		repo._solarRadiation = await XidNumber.asReadable(adapter, EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION);
		repo._isGridBuying = await XidBool.asReadable(adapter, EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING);

		return repo;
	}

	createObjects = async (adapter: AdapterInstance): Promise<void> => {
		await createObjectNum(adapter, EXTERNAL_STATE_LANDINGZONE.PV_GENERATION, 0, {
			desc: 'The amount of power currently generated',
			unit: 'kWh',
		});

		await createObjectNum(adapter, EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD, 0, {
			desc: 'The overall amount of currently consumend power',
			unit: 'kWh',
		});

		await createObjectNum(adapter, EXTERNAL_STATE_LANDINGZONE.BAT_SOC, 0, {
			desc: 'The battery stand of charge',
			unit: '%',
		});

		await createObjectNum(adapter, EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION, 0, {
			desc: 'The Solar Radiation',
			unit: 'w\\m²',
		});

		await createObjectNum(adapter, EXTERNAL_STATE_LANDINGZONE.GRID_LOAD, 0, {
			desc: 'The grids load',
			unit: 'kWh',
		});

		await createObjectNum(adapter, EXTERNAL_STATE_LANDINGZONE.BAT_LOAD, 0, {
			desc: 'The battery load',
			unit: 'kWh',
		});

		await createObjectBool(adapter, EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING, false, {
			desc: 'True, if the System is buying energy from grid (external)',
		});
	};
}