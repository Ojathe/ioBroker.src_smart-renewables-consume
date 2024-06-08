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

interface SetupProps {
	operating?: boolean,
	loss?: boolean,
	bonus?: boolean,
	powerBalanceAvg?: number,
	powerBalanceCurrent?: number,
}

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

	const setup = async (adapter: MockAdapter, props: SetupProps, automatedDevices: Array<AutomatedDevice> = []) => {
		const landingZoneRepo = await LandingZoneRepoImpl.create(adapter as unknown as AdapterInstance);
		const powerRepo = await PowerRepository.create(adapter as unknown as AdapterInstance);
		const eegRepo = await EegRepositoryImpl.create(adapter as unknown as AdapterInstance);
		const heatingRepository = await HeatingRepository.create(adapter as unknown as AdapterInstance, {});

		await adapter.setStateAsync(eegRepo.operating.xid, props.operating ?? true);
		await adapter.setStateAsync(eegRepo.loss.xid, props.loss ?? false);
		await adapter.setStateAsync(eegRepo.bonus.xid, props.bonus ?? false);

		await adapter.setStateAsync(powerRepo.members.powerBalance.avg.xid, props.powerBalanceAvg ?? 0);
		await adapter.setStateAsync(powerRepo.members.powerBalance.current.xid, props.powerBalanceCurrent ?? 0);


		const efm = new EnergyFlowManager(powerRepo, landingZoneRepo, eegRepo, heatingRepository, automatedDevices);

		return { efm, powerRepo, landingZoneRepo, eegRepo, heatingRepository };
	};

	describe('run', () => {

		it('operation mode is disabled _ returns false', async () => {
			const props = { operating: false };
			const { efm } = await setup(adapter, props);

			const result = await efm.run();

			expect(result).to.be.empty;

		});

		it('neither loss nor bonus _ returns false', async () => {
			const props = { loss: false, bonus: false };

			const { efm } = await setup(adapter, props);

			const result = await efm.run();

			expect(result).to.be.empty;

		});

		describe('loss is detected', () => {
			const props: SetupProps = { loss: true, bonus: false, powerBalanceCurrent: -0.5 };

			it('_  no automated devices exists _  returns empty array', async () => {
				const { efm } = await setup(adapter, props);


				const result = await efm.run();

				expect(result).to.be.empty;
			});

			it('_  single devices exists _ returns EnergyFlowManagerAdjustment for this device', async () => {
				const aMockedDevice = new MockedAutomatedDevice(sandbox, {
					key: 'aAutomatedDevice',
					status: Status.STARTED,
					estimatedConsumption: 0.5,
				});

				const { efm } = await setup(adapter, props, [aMockedDevice]);

				const result = await efm.run();

				expect(result).to.eql([{ automatedDevice: aMockedDevice, action: DeviceAction.STOPPED }]);
				expect(aMockedDevice.stop).to.have.been.called;
			});

			for (const status of [Status.STOPPED, Status.MANUAL, Status.FORCED, Status.LOCKED]) {
				it(`_  ${status} and running devices exists _ ignore the ${status} device`, async () => {
					const aMockedDeviceRunning = new MockedAutomatedDevice(sandbox, {
						key: 'aAutomatedDevice',
						status: Status.STARTED,
						estimatedConsumption: 0.1,
					});

					const aMockedDeviceToIgnore = new MockedAutomatedDevice(sandbox, {
						key: 'anotherAutomatedDevice',
						status,
						estimatedConsumption: 0.1,
					});

					const { efm } = await setup(
						adapter,
						props,
						[aMockedDeviceToIgnore, aMockedDeviceRunning],
					);

					const result = await efm.run();

					expect(aMockedDeviceToIgnore.stop).not.to.have.been.called;
					expect(result).to.eql([{ automatedDevice: aMockedDeviceRunning, action: DeviceAction.STOPPED }]);
					expect(aMockedDeviceRunning.stop).to.have.been.called;
				});
			}


			it('_  stop devices due to its priority ', async () => {
				const aMockedDeviceHighPrio = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceHighPrio',
					status: Status.STARTED,
					priority: 1,
					estimatedConsumption: 0.5,
				});

				const aMockedDeviceHighPrioLowPrio = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceHighPrioLowPrio',
					status: Status.STARTED,
					priority: 3,
					estimatedConsumption: 0.5,
				});

				const { efm } = await setup(
					adapter, props, [aMockedDeviceHighPrio, aMockedDeviceHighPrioLowPrio]);


				const result = await efm.run();

				expect(aMockedDeviceHighPrio.stop).not.to.have.been.called;
				expect(result).to.eql([{ automatedDevice: aMockedDeviceHighPrioLowPrio, action: DeviceAction.STOPPED }]);
				expect(aMockedDeviceHighPrioLowPrio.stop).to.have.been.called;
			});

			it('_  stop as much devices as possible & necessary to reduce the unbalance', async () => {
				const aMockedDeviceHighPrio = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceHighPrio',
					status: Status.STARTED,
					priority: 1,
					estimatedConsumption: 0.6,
				});

				const aMockedDeviceLowPrio1 = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceLowPrio1',
					status: Status.STARTED,
					priority: 2,
					estimatedConsumption: 0.2,
				});

				const aMockedDeviceLowPrio2 = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceLowPrio2',
					status: Status.STARTED,
					priority: 2,
					estimatedConsumption: 0.3,
				});

				const {
					efm,
				} = await setup(adapter, props, [aMockedDeviceHighPrio, aMockedDeviceLowPrio1, aMockedDeviceLowPrio2]);

				const result = await efm.run();

				expect(aMockedDeviceHighPrio.stop).not.to.have.been.called;
				expect(result).to.eql([
					{ automatedDevice: aMockedDeviceLowPrio1, action: DeviceAction.STOPPED },
					{ automatedDevice: aMockedDeviceLowPrio2, action: DeviceAction.STOPPED },
				]);
				expect(aMockedDeviceLowPrio1.stop).to.have.been.called;
				expect(aMockedDeviceLowPrio2.stop).to.have.been.called;

			});

			it('_ dont stop devices which are allowed to consume battery when consume is in range', async () => {
				const aMockedDevice = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDevice',
					status: Status.STARTED,
					priority: 2,
					estimatedConsumption: 0.2,
					allowedBatteryConsumption: 10,
				});

				const {
					efm,
					eegRepo,
					landingZoneRepo,
				} = await setup(adapter, props, [aMockedDevice]);

				await adapter.setStateAsync(eegRepo.socLastBonus.xid, 80);
				await adapter.setStateAsync(landingZoneRepo.batterySoC.xid, 70);

				const result = await efm.run();

				expect(aMockedDevice.stop).not.to.be.called;
				expect(result).to.be.empty;
			});

			it('_ stop devices which are allowed to consume battery but are out of range', async () => {
				const aMockedDevice = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDevice',
					status: Status.STARTED,
					priority: 2,
					estimatedConsumption: 0.2,
					allowedBatteryConsumption: 10,
				});

				const {
					efm,
					eegRepo,
					landingZoneRepo,
				} = await setup(adapter, props, [aMockedDevice]);

				await adapter.setStateAsync(eegRepo.socLastBonus.xid, 80);
				await adapter.setStateAsync(landingZoneRepo.batterySoC.xid, 69);

				const result = await efm.run();

				expect(aMockedDevice.stop).to.be.called;
				expect(result).to.eql([{ automatedDevice: aMockedDevice, action: DeviceAction.STOPPED }]);
			});
		});

		describe('bonus is detected', () => {
			const props: SetupProps = { loss: false, bonus: true, powerBalanceAvg: 0.5 };

			it('_  no automated devices exists _  returns empty array', async () => {
				const { efm } = await setup(adapter, props);

				const result = await efm.run();

				expect(result).to.be.empty;
			});

			it('_  single devices exists _ returns EnergyFlowManagerAdjustment for this device', async () => {
				const aMockedDevice = new MockedAutomatedDevice(sandbox, {
					key: 'aAutomatedDevice',
					status: Status.STOPPED,
					estimatedConsumption: 0.5,
				});

				const {
					efm,
				} = await setup(adapter, props, [aMockedDevice]);


				const result = await efm.run();

				expect(result).to.eql([{ automatedDevice: aMockedDevice, action: DeviceAction.STARTED }]);
				expect(aMockedDevice.start).to.have.been.called;
			});

			for (const status of [Status.STARTED, Status.MANUAL, Status.FORCED, Status.LOCKED]) {
				it(`_  ${status} and running devices exists _ ignore the ${status} device`, async () => {
					const aMockedDeviceStopped = new MockedAutomatedDevice(sandbox, {
						key: 'aAutomatedDevice',
						status: Status.STOPPED,
						estimatedConsumption: 0.1,
					});

					const aMockedDeviceToIgnore = new MockedAutomatedDevice(sandbox, {
						key: 'anotherAutomatedDevice',
						status,
						estimatedConsumption: 0.1,
					});

					const {
						efm,
					} = await setup(adapter, props, [aMockedDeviceToIgnore, aMockedDeviceStopped]);


					const result = await efm.run();

					expect(aMockedDeviceToIgnore.start).not.to.have.been.called;
					expect(result).to.eql([{ automatedDevice: aMockedDeviceStopped, action: DeviceAction.STARTED }]);
					expect(aMockedDeviceStopped.start).to.have.been.called;
				});
			}

			it('_  start devices due to its priority ', async () => {
				const aMockedDeviceHighPrio = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceHighPrio',
					status: Status.STOPPED,
					priority: 1,
					estimatedConsumption: 0.5,
				});

				const aMockedDeviceLowPrio = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceLowPrio',
					status: Status.STOPPED,
					priority: 3,
					estimatedConsumption: 0.5,
				});

				const {
					efm,
				} = await setup(adapter, props, [aMockedDeviceLowPrio, aMockedDeviceHighPrio]);

				const result = await efm.run();

				expect(aMockedDeviceLowPrio.start).not.to.have.been.called;
				expect(result).to.eql([{ automatedDevice: aMockedDeviceHighPrio, action: DeviceAction.STARTED }]);
				expect(aMockedDeviceHighPrio.start).to.have.been.called;
			});

			it('_  start as much devices as possible & necessary to reduce the unbalance', async () => {
				const aMockedDeviceHighPrio = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceHighPrio',
					status: Status.STOPPED,
					priority: 1,
					estimatedConsumption: 0.2,
				});

				const aMockedDeviceLowPrio1 = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceLowPrio1',
					status: Status.STOPPED,
					priority: 1,
					estimatedConsumption: 0.2,
				});

				const aMockedDeviceLowPrio2 = new MockedAutomatedDevice(sandbox, {
					key: 'aMockedDeviceLowPrio2',
					status: Status.STOPPED,
					priority: 2,
					estimatedConsumption: 0.3,
				});

				const {
					efm,
				} = await setup(adapter, props, [aMockedDeviceLowPrio2, aMockedDeviceHighPrio, aMockedDeviceLowPrio1]);

				const result = await efm.run();

				expect(aMockedDeviceLowPrio2.start).not.to.have.been.called;
				expect(result).to.eql([
					{ automatedDevice: aMockedDeviceLowPrio1, action: DeviceAction.STARTED },
					{ automatedDevice: aMockedDeviceHighPrio, action: DeviceAction.STARTED },
				]);
				expect(aMockedDeviceLowPrio1.start).to.have.been.called;
				expect(aMockedDeviceHighPrio.start).to.have.been.called;

			});
		});

	});
});