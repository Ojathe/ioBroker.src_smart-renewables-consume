import { AdapterInstance } from '@iobroker/adapter-core';
import { EXTERNAL_STATE_LANDINGZONE } from '../repositories/landing-zone-repository';

export class ExternalStateConnector {

	private constructor(private readonly adapter: AdapterInstance, private readonly config: ioBroker.AdapterConfig) {
	}

	static async create(adapter: AdapterInstance, config: ioBroker.AdapterConfig): Promise<ExternalStateConnector> {

		const connector = new ExternalStateConnector(adapter, config);
		await connector.initialize();
		connector.addSubscriptions();

		return connector;
	}

	public onSubscribedStateChanged(externalId: string, value: any): void {
		const xidtoUpdate = this.getInnerStateXid(externalId);
		if (xidtoUpdate) {
			this.adapter.setState(xidtoUpdate, { val: value, ack: true });
			console.debug(`Updating ingoing-value '${xidtoUpdate}' from '${externalId}' with '${value}'`);
		}
	}

	private async initialize(): Promise<void> {
		// TODO Work in progress
		const configToMap = [
			this.config.optionSourcePvGeneration,
			this.config.optionSourceBatterySoc,
			this.config.optionSourceIsGridBuying,
			this.config.optionSourceIsGridLoad,
			this.config.optionSourceSolarRadiation,
			this.config.optionSourceTotalLoad,
			this.config.optionSourceBatteryLoad,
		];

		for (const externalId of configToMap) {
			const state = await this.adapter.getForeignStateAsync(externalId);
			this.onSubscribedStateChanged(externalId, state?.val);
		}
	}

	private getInnerStateXid(externalId: string): string | undefined {
		let xidtoUpdate;
		switch (externalId) {
			case this.config.optionSourcePvGeneration:
				xidtoUpdate = EXTERNAL_STATE_LANDINGZONE.PV_GENERATION;
				break;
			case this.config.optionSourceBatterySoc:
				xidtoUpdate = EXTERNAL_STATE_LANDINGZONE.BAT_SOC;
				break;
			case this.config.optionSourceIsGridBuying:
				xidtoUpdate = EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING;
				break;
			case this.config.optionSourceIsGridLoad:
				xidtoUpdate = EXTERNAL_STATE_LANDINGZONE.GRID_LOAD;
				break;
			case this.config.optionSourceSolarRadiation:
				xidtoUpdate = EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION;
				break;
			case this.config.optionSourceTotalLoad:
				xidtoUpdate = EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD;
				break;
			case this.config.optionSourceBatteryLoad:
				xidtoUpdate = EXTERNAL_STATE_LANDINGZONE.BAT_LOAD;
				break;
		}

		return xidtoUpdate;
	}

	private addSubscriptions(): void {
		this.adapter.subscribeForeignStates(this.config.optionSourcePvGeneration);
		this.adapter.subscribeForeignStates(this.config.optionSourceTotalLoad);
		this.adapter.subscribeForeignStates(this.config.optionSourceBatterySoc);
		this.adapter.subscribeForeignStates(this.config.optionSourceSolarRadiation);
		this.adapter.subscribeForeignStates(this.config.optionSourceIsGridBuying);
		this.adapter.subscribeForeignStates(this.config.optionSourceIsGridLoad);
		this.adapter.subscribeForeignStates(this.config.optionSourceBatteryLoad);
	}
}