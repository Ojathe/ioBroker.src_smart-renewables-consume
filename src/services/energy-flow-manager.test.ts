import {MockAdapter, utils} from '@iobroker/testing';
import {LandingZoneRepoImpl} from '../repositories/landing-zone-repository';
import {AdapterInstance} from '@iobroker/adapter-core';
import {EegRepositoryImpl} from '../repositories/eeg-repository';
import {HeatingRepository} from '../repositories/heating-repository';
import {DeviceAction, EnergyFlowManager} from './energy-flow-manager';
import {PowerRepository} from '../repositories/power-repository';
import {AutomatedDevice, Status} from '../devices/device';
import {expect} from 'chai';
import sinon from 'sinon';
import {MockedAutomatedDevice} from './test-utils/mocked-automated-device';

interface setupProps {
	operating?: boolean,
	loss?: boolean,
	bonus?: boolean
}

const {adapter, database} = utils.unit.createMocks({});

describe('EnergyFlowManager', () => {
	const sandbox = sinon.createSandbox();
	afterEach(() => {
		// The mocks keep track of all method invocations - reset them after each single test
		adapter.resetMockHistory();
		// We want to start each test with a fresh database
		database.clear();
		sandbox.restore();
	});

	const setup = async (adapter: MockAdapter, props: setupProps, automatedDevices: Array<AutomatedDevice> = []) => {
		const landingZoneRepo = await LandingZoneRepoImpl.create(adapter as unknown as AdapterInstance);
		const powerRepo = await PowerRepository.create(adapter as unknown as AdapterInstance);
		const eegRepo = await EegRepositoryImpl.create(adapter as unknown as AdapterInstance);
		const heatingRepository = await HeatingRepository.create(adapter as unknown as AdapterInstance, {});

		await adapter.setStateAsync(eegRepo.operating.xid, props.operating ?? true);
		await adapter.setStateAsync(eegRepo.loss.xid, props.loss ?? false);
		await adapter.setStateAsync(eegRepo.bonus.xid, props.bonus ?? false);

		const efm = new EnergyFlowManager(powerRepo, landingZoneRepo, eegRepo, heatingRepository, automatedDevices);

		return {efm, powerRepo, landingZoneRepo, eegRepo, heatingRepository};
	};

	describe('run', () => {

		it('operation mode is disabled _ returns false', async () => {
			const props = {operating: false};
			const {efm} = await setup(adapter, props);

			const result = await efm.run();

			expect(result).to.be.empty;

		});

		it('neither loss nor bonus _ returns false', async () => {
			const props = {loss: false, bonus: false};

			const {efm} = await setup(adapter, props);

			const result = await efm.run();

			expect(result).to.be.empty;

		});

		describe('loss is detected', () => {
			const props = {loss: true, bonus: false};

			it('_  no automated devices exists _  returns empty array', async () => {
				const {efm, powerRepo} = await setup(adapter, props);


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
					efm,
					powerRepo,
				} = await setup(adapter, props, [aMockedDevice]);

				await adapter.setStateAsync(powerRepo.powerBalanceInternal.xid, -0.5);

				const result = await efm.run();

				expect(result).to.eql([{automatedDevice: aMockedDevice, action: DeviceAction.STOPPED}]);
				expect(aMockedDevice.stop).to.have.been.called;
			});

			for (const status of [Status.STOPPED, Status.MANUAL, Status.FORCED, Status.LOCKED]) {
				it(`_  ${status} and running devices exists _ ignore the ${status} device`, async () => {
					const aMockedDeviceRunning = new MockedAutomatedDevice(sandbox, {
						key: 'aAutomatedDevice',
						status: Status.STARTED,
					});

					const aMockedDeviceToIgnore = new MockedAutomatedDevice(sandbox, {
						key: 'anotherAutomatedDevice',
						status,
					});

					const {
						efm,
						powerRepo,
					} = await setup(adapter, props, [aMockedDeviceToIgnore, aMockedDeviceRunning]);

					await adapter.setStateAsync(powerRepo.powerBalanceInternal.xid, -0.5);

					const result = await efm.run();

					expect(aMockedDeviceToIgnore.stop).not.to.have.been.called;
					expect(result).to.eql([{automatedDevice: aMockedDeviceRunning, action: DeviceAction.STOPPED}]);
					expect(aMockedDeviceRunning.stop).to.have.been.called;
				});
			}


			it('_  stop devices due to its priority ', async () => {
				const aMockedDeviceHighPrio = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceHighPrio',
					status: Status.STARTED,
					priority: 1
				});

				const aMockedDeviceHighPrioLowPrio = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceHighPrioLowPrio',
					status: Status.STARTED,
					priority: 3
				});

				const {
					efm,
					powerRepo,
				} = await setup(adapter, props, [aMockedDeviceHighPrio, aMockedDeviceHighPrioLowPrio]);

				await adapter.setStateAsync(powerRepo.powerBalanceInternal.xid, -0.5);

				const result = await efm.run();

				expect(aMockedDeviceHighPrio.stop).not.to.have.been.called;
				expect(result).to.eql([{automatedDevice: aMockedDeviceHighPrioLowPrio, action: DeviceAction.STOPPED}]);
				expect(aMockedDeviceHighPrioLowPrio.stop).to.have.been.called;
			});

			it('_  stop as much devices as possible & necessary to reduce the unbalance', async () => {
				const aMockedDeviceHighPrio = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceHighPrio',
					status: Status.STARTED,
					priority: 1,
					estimatedConsumption: 0.6
				});

				const aMockedDeviceLowPrio1 = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceLowPrio1',
					status: Status.STARTED,
					priority: 2,
					estimatedConsumption: 0.2
				});

				const aMockedDeviceLowPrio2 = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceLowPrio2',
					status: Status.STARTED,
					priority: 2,
					estimatedConsumption: 0.3
				});

				const {
					efm,
					powerRepo,
				} = await setup(adapter, props, [aMockedDeviceHighPrio, aMockedDeviceLowPrio1, aMockedDeviceLowPrio2]);

				await adapter.setStateAsync(powerRepo.powerBalanceInternal.xid, -0.5);

				const result = await efm.run();

				expect(aMockedDeviceHighPrio.stop).not.to.have.been.called;
				expect(result).to.eql([
					{automatedDevice: aMockedDeviceLowPrio1, action: DeviceAction.STOPPED},
					{automatedDevice: aMockedDeviceLowPrio2, action: DeviceAction.STOPPED}
				]);
				expect(aMockedDeviceLowPrio1.stop).to.have.been.called;
				expect(aMockedDeviceLowPrio2.stop).to.have.been.called;

			});
		});
	});
});