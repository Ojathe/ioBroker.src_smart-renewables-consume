import { MockAdapter, utils } from '@iobroker/testing';
import { LandingZoneRepoImpl } from '../repositories/landing-zone-repository';
import { AdapterInstance } from '@iobroker/adapter-core';
import { EegRepositoryImpl } from '../repositories/eeg-repository';
import { HeatingRepository } from '../repositories/heating-repository';
import { DeviceAction, EnergyFlowManager } from './energy-flow-manager';
import { PowerRepository } from '../repositories/power-repository';
import { AutomatedDevice, Status } from '../devices/device';
import { expect } from 'chai';
import sinon from 'sinon';
import { MockedAutomatedDevice } from './test-utils/mocked-automated-device';


const { adapter, database } = utils.unit.createMocks({});

describe('EnergyFlowManager', () => {
	const sandbox = sinon.createSandbox();
	afterEach(() => {
		// The mocks keep track of all method invocations - reset them after each single test
		adapter.resetMockHistory();
		// We want to start each test with a fresh database
		database.clear();
		sandbox.restore();
	});

	const setup = async (adapter: MockAdapter, automatedDevices: Array<AutomatedDevice> = []) => {
		const landingZoneRepo = await LandingZoneRepoImpl.create(adapter as unknown as AdapterInstance);
		const powerRepo = await PowerRepository.create(adapter as unknown as AdapterInstance);
		const eegRepo = await EegRepositoryImpl.create(adapter as unknown as AdapterInstance);
		const heatingRepository = await HeatingRepository.create(adapter as unknown as AdapterInstance, {});

		const efm = new EnergyFlowManager(powerRepo, landingZoneRepo, eegRepo, heatingRepository, automatedDevices);

		return { efm, powerRepo, landingZoneRepo, eegRepo, heatingRepository };
	};

	describe('run', () => {

		it('operation mode is disabled _ returns false', async () => {
			const { eegRepo, efm } = await setup(adapter);

			await adapter.setStateAsync(eegRepo.operating.xid, false);
			await adapter.setStateAsync(eegRepo.loss.xid, true);
			await adapter.setStateAsync(eegRepo.bonus.xid, true);

			const result = await efm.run();

			expect(result).to.be.empty;

		});

		it('neither loss nor bonus _ returns false', async () => {
			const { eegRepo, efm } = await setup(adapter);

			await adapter.setStateAsync(eegRepo.operating.xid, true);
			await adapter.setStateAsync(eegRepo.loss.xid, false);
			await adapter.setStateAsync(eegRepo.bonus.xid, false);

			const result = await efm.run();

			expect(result).to.be.empty;

		});

		describe('loss is detected', () => {
			it('_  no automated devices exists _  returns empty array', async () => {
				const { eegRepo, efm, powerRepo } = await setup(adapter);

				await adapter.setStateAsync(eegRepo.operating.xid, true);
				await adapter.setStateAsync(eegRepo.loss.xid, true);
				await adapter.setStateAsync(eegRepo.bonus.xid, false);

				await adapter.setStateAsync(powerRepo.powerBalanceInternal.xid, -0.5);

				const result = await efm.run();

				expect(result).to.be.empty;
			});

			it('_  single devices exists _ returns EnergyFlowManagerAdjustment for this device', async () => {
				const aMockedDevice = new MockedAutomatedDevice(sandbox, {
					key: 'aAutomatedDevice',
					status: Status.STARTED,
				});

				const {
					eegRepo,
					efm,
					powerRepo,
				} = await setup(adapter, []);

				await adapter.setStateAsync(eegRepo.operating.xid, true);
				await adapter.setStateAsync(eegRepo.loss.xid, true);
				await adapter.setStateAsync(eegRepo.bonus.xid, false);

				await adapter.setStateAsync(powerRepo.powerBalanceInternal.xid, -0.5);

				const result = await efm.run();

				expect(result).to.eq([{ automatedDevice: aMockedDevice, action: DeviceAction.STOPPED }]);
			});
		});
	});
});