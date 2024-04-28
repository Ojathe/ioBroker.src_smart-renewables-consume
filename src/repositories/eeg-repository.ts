import { XidBool, XidNumber } from '../values/xid';
import { AdapterInstance } from '@iobroker/adapter-core';

export const INTERNAL_STATE_EEG = {
	BONUS: 'eeg-state.bonus',
	LOSS: 'eeg-state.loss',
	SOC_LAST_BONUS: 'eeg-state.soc-last-bonus',
	OPERATION: 'eeg-state.operation',
};

export interface EegRepository {
	bonus: XidBool,
	loss: XidBool,
	socLastBonus: XidNumber,
	operating: XidBool
}

export class EegRepositoryImpl implements EegRepository {
	private constructor() {
	}

	private _bonus: XidBool | undefined;

	get bonus(): XidBool {
		return this._bonus!;
	}

	private _loss: XidBool | undefined;

	get loss(): XidBool {
		return this._loss!;
	}

	private _operating: XidBool | undefined;

	get operating(): XidBool {
		return this._operating!;
	}

	private _socLastBonus: XidNumber | undefined;

	get socLastBonus(): XidNumber {
		return this._socLastBonus!;
	}

	static async create(adapter: AdapterInstance): Promise<EegRepository> {

		const repo = new EegRepositoryImpl();

		repo._bonus = await XidBool.asManaged(adapter, INTERNAL_STATE_EEG.BONUS, false, { desc: 'True, if there is more Power then used' });
		repo._loss = await XidBool.asManaged(adapter, INTERNAL_STATE_EEG.LOSS, false, { desc: 'True, if there is less Power then used' });
		repo._operating = await XidBool.asManaged(adapter, INTERNAL_STATE_EEG.OPERATION, false, { desc: 'True, if the system should be managed' });


		repo._socLastBonus = await XidNumber.asManaged(adapter, INTERNAL_STATE_EEG.SOC_LAST_BONUS, 0, {
			desc: 'Batteries SoC when the last Bonus was detected',
			unit: '%',
		});

		return repo;
	}
}