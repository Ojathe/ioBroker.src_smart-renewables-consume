import { AdapterInstance } from '@iobroker/adapter-core';
import { MockAdapter, utils } from '@iobroker/testing';
import { expect } from 'chai';
import { AverageValue } from './average-value';
import { createObjectNum } from '../util/create-objects-helper';

const { adapter, database } = utils.unit.createMocks({});

describe('AverageValue', () => {
	afterEach(() => {
		// The mocks keep track of all method invocations - reset them after each single test
		adapter.resetMockHistory();
		// We want to start each test with a fresh database
		database.clear();
	});

	describe('build() ', () => {
		const mockedSource = 'sourceUnderTest';
		const mockedName = 'AverageValueUnderTest';
		const mockedDesc = 'descUnderTest';
		const mockedUnit = 'unitUnderTest';

		const mockedCurrent = 'avg.AverageValueUnderTest.current';
		const mockedAvg = 'avg.AverageValueUnderTest.last-10-min';
		const mockedAvg5 = 'avg.AverageValueUnderTest.last-5-min';

		const setup = async (adapter: MockAdapter) => {
			await createObjectNum(adapter as unknown as AdapterInstance, mockedSource, 0);
		};

		it('should initialize correctly', async () => {
			const asserts = utils.unit.createAsserts(database, adapter);
			await setup(adapter);

			const mutation = async (num: number) => {
				return num;
			};

			const avgValToTest = await AverageValue.build(adapter as unknown as AdapterInstance, mockedName, {
				xidSource: mockedSource,
				desc: mockedDesc,
				unit: mockedUnit,
				mutation,
			});

			expect(avgValToTest).not.to.be.undefined;

			expect(avgValToTest.source?.xid).to.eq(mockedSource);
			expect(avgValToTest.propertyName).to.eq(mockedName);
			expect(avgValToTest.desc).to.eq(mockedDesc);
			expect(avgValToTest.current.xid).to.eq(mockedCurrent);

			expect(avgValToTest.avg.xid).to.eq(mockedAvg);
			expect(avgValToTest.avg5.xid).to.eq(mockedAvg5);
			expect(avgValToTest.mutation).to.eq(mutation);

			asserts.assertStateHasValue(avgValToTest.current.xid, 0);
			asserts.assertStateHasValue(avgValToTest.avg.xid, 0);
			asserts.assertStateHasValue(avgValToTest.avg5.xid, 0);
		});

		it('should throw expection when no mutation and source are defined', async () => {
			expect(AverageValue.build(adapter as unknown as AdapterInstance, mockedName)).to.be.rejectedWith(
				`${mockedName}: Es dürfen nicht xidSource UND Mutation undefniert sein!`,
			);
		});

		it('should be able to read and write values ', async () => {
			const asserts = utils.unit.createAsserts(database, adapter);
			await setup(adapter);

			const avgValToTest = await AverageValue.build(adapter as unknown as AdapterInstance, mockedName, {
				xidSource: mockedSource,
			});
			asserts.assertStateExists(avgValToTest.current.xid);
			await adapter.setStateAsync(avgValToTest.current.xid, 2);

			// assert
			asserts.assertStateHasValue(avgValToTest.current.xid, 2);
			expect(await avgValToTest.current.getValue()).to.eq(2);
		});
	});
});
