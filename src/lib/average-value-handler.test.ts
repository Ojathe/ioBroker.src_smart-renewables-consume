import { AdapterInstance } from '@iobroker/adapter-core';
import { MockAdapter, utils } from '@iobroker/testing';
import { expect } from 'chai';
import sinon from 'sinon';
import { AverageValue } from './average-value';
import { AverageValueHandler, calculateAverageValue } from './average-value-handler';
import { EXTERNAL_STATE_LANDINGZONE } from './dp-handler';
import { createObjectBool, createObjectNum } from '../util/create-objects-helper';

const { adapter, database } = utils.unit.createMocks({});

export async function createMockedLandingZone(adapter: MockAdapter) {
	await createObjectNum(adapter as unknown as AdapterInstance, EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION, 0);
	await createObjectNum(adapter as unknown as AdapterInstance, EXTERNAL_STATE_LANDINGZONE.PV_GENERATION, 0);
	await createObjectNum(adapter as unknown as AdapterInstance, EXTERNAL_STATE_LANDINGZONE.BAT_LOAD, 0);
	await createObjectNum(adapter as unknown as AdapterInstance, EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD, 0);
	await createObjectNum(adapter as unknown as AdapterInstance, EXTERNAL_STATE_LANDINGZONE.PV_GENERATION, 0);
	await createObjectNum(adapter as unknown as AdapterInstance, EXTERNAL_STATE_LANDINGZONE.GRID_LOAD, 0);
	await createObjectBool(adapter as unknown as AdapterInstance, EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING, false);
}

describe('AverageValueHandler', () => {
	const currentTestCaseSolutions: Array<CurrentTestSolution<any>> = [
		createCurrentTestCase({
			function: 'powerDif',
			testCases: [
				{
					expectation: 1,
					states: [
						[EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD, 2],
						[EXTERNAL_STATE_LANDINGZONE.PV_GENERATION, 3],
					],
				},
				{
					expectation: 0,
					states: [
						[EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD, 2],
						[EXTERNAL_STATE_LANDINGZONE.PV_GENERATION, 2],
					],
				},
				{
					expectation: -1,
					states: [
						[EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD, 3],
						[EXTERNAL_STATE_LANDINGZONE.PV_GENERATION, 2],
					],
				},
			],
		}),
		createCurrentTestCase({
			function: 'powerGrid',
			testCases: [
				{
					expectation: 2,
					states: [
						[EXTERNAL_STATE_LANDINGZONE.GRID_LOAD, 2],
						[EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING, false],
					],
				},
				{
					expectation: 0,
					states: [
						[EXTERNAL_STATE_LANDINGZONE.GRID_LOAD, 0],
						[EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING, false],
					],
				},
				{
					expectation: 0,
					states: [
						[EXTERNAL_STATE_LANDINGZONE.GRID_LOAD, 0],
						[EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING, true],
					],
				},
				{
					expectation: -2,
					states: [
						[EXTERNAL_STATE_LANDINGZONE.GRID_LOAD, 2],
						[EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING, true],
					],
				},
			],
		}),
		createCurrentTestCase({
			function: 'powerPv',
			testCases: [
				{
					expectation: 2,
					states: [[EXTERNAL_STATE_LANDINGZONE.PV_GENERATION, 2]],
				},
			],
		}),
		createCurrentTestCase({
			function: 'solar',
			testCases: [
				{
					expectation: 0,
					states: [[EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION, 0]],
				},
				{
					expectation: 200,
					states: [[EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION, 200]],
				},
			],
		}),
	];

	const sandbox = sinon.createSandbox();
	afterEach(() => {
		// The mocks keep track of all method invocations - reset them after each single test
		adapter.resetMockHistory();
		// We want to start each test with a fresh database
		database.clear();
		// clear mocks
		sandbox.restore();
	});

	const initHandler = async () => {
		await createMockedLandingZone(adapter);
		return await AverageValueHandler.build(adapter as unknown as AdapterInstance);
	};

	const stateMap: Map<AggregatFunction, [string, object | undefined]> = new Map([
		[
			'solar',
			[
				'solar-radiation',
				{
					desc: 'Average solar radiation',
					xidSource: EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION,
					unit: 'wm²',
				},
			],
		],
		[
			'powerPv',
			[
				'power-pv',
				{
					desc: 'PV generation',
					xidSource: EXTERNAL_STATE_LANDINGZONE.PV_GENERATION,
					unit: 'kW',
				},
			],
		],
		[
			'batLoad',
			[
				'bat-load',
				{
					desc: 'The Battery load (-) consuming / (+) charging',
					xidSource: EXTERNAL_STATE_LANDINGZONE.BAT_LOAD,
					unit: 'kW',
				},
			],
		],
		['powerDif', ['power-dif', undefined]],
		['powerGrid', ['power-grid', undefined]],
	]);
	for (const testSolution of currentTestCaseSolutions) {
		describe(testSolution.function, () => {
			it('build() creates avg-value state', async () => {
				// Arrange & Act
				const avgValueStub = sandbox.stub(AverageValue, 'build').returns('mock' as unknown as Promise<AverageValue>);

				const handler = await initHandler();

				//Assert
				const stateCreationExpectation = stateMap.get(testSolution.function);
				expect(handler).not.to.be.undefined;

				if (stateCreationExpectation![1] !== undefined) {
					expect(avgValueStub).to.be.calledWith(adapter, stateCreationExpectation![0], stateCreationExpectation![1]);
				} else {
					expect(avgValueStub).to.be.calledWith(adapter, stateCreationExpectation![0]);
				}
			});

			describe('calculate()', () => {
				it(`History is accessed`, async () => {
					//Arrange
					const handler = await initHandler();

					//Act
					await handler.calculate();

					//Assert
					expect(adapter.sendTo).to.be.calledWithMatch('history.0', 'getHistory', {
						id: `${adapter.name}.${adapter.instance}.${handler[testSolution.function].current.xid}`,
					});
				});

				for (const currentCase of testSolution.testCases) {
					const stateDescription = currentCase.states.map((state) => `${state.xid}=${state.value}`).join(', ');
					it(`Statesituation '${stateDescription}' udaptes 'current' to ${currentCase.expectation}`, async () => {
						const handler = await initHandler();
						for (const state of currentCase.states) {
							await adapter.setStateAsync(state.xid, state.value);
						}
						await handler.calculate();
						expect(await handler[testSolution.function].current.getValue()).to.eq(currentCase.expectation);
					});
				}

				const mockedHistory = [
					{ ts: Date.now(), val: 20 },
					{ ts: Date.now() - 4 * 1000 * 60, val: 10 },
					{ ts: Date.now() - 8 * 1000 * 60, val: 5 },
				];

				it(`updates all 3 values (current, 5min & 10min)`, async () => {
					//Arrange
					const handler = await initHandler();
					const avgVal = handler[testSolution.function];
					adapter.sendToAsync.resolves({ result: mockedHistory });

					//Act
					await handler.calculate();

					//Assert
					expect(adapter.setStateAsync).to.be.calledWith(avgVal.current.xid, { val: 0, ack: true });
					expect(adapter.setStateAsync).to.be.calledWith(avgVal.avg.xid, {
						val: Math.round(((20 + 10 + 5) / 3) * 100) / 100,
						ack: true,
					});
					expect(adapter.setStateAsync).to.be.calledWith(avgVal.avg5.xid, {
						val: Math.round(((20 + 10) / 2) * 100) / 100,
						ack: true,
					});
				});
			});
		});
	}

	describe('calculateAverageValue()', () => {
		it('should return 0 for empty list', () => {
			const result = calculateAverageValue([]);

			expect(result).not.to.be.undefined;
			expect(result.sum).to.eq(0);
			expect(result.count).to.eq(0);
			expect(result.avg).to.eq(0);
		});

		it('should calculate correctly', () => {
			const result = calculateAverageValue([
				{ ts: 1234, val: 2 },
				{ ts: 12345, val: 4 },
				{ ts: 12345, val: 6 },
			]);

			expect(result).not.to.be.undefined;
			expect(result.sum).to.eq(12);
			expect(result.count).to.eq(3);
			expect(result.avg).to.eq(4);
		});
	});
});

type AggregatFunction = keyof AverageValueHandler & ('powerDif' | 'powerGrid' | 'powerPv' | 'solar' | 'batLoad');

type CurrentTestSolutionTemplate<T> = {
	function: AggregatFunction;
	testCases: Array<{ states: Array<[string, T | unknown]>; expectation: T }>;
};

type CurrentTestSolution<T> = {
	function: AggregatFunction;
	testCases: Array<CurrentTestCase<T>>;
};

type CurrentTestCase<T> = {
	states: Array<{ xid: string; value: T | unknown }>;
	expectation: T;
};

function createCurrentTestCase<T>(template: CurrentTestSolutionTemplate<T>) {
	return {
		function: template.function,
		testCases: template.testCases.map((templateCase) => ({
			expectation: templateCase.expectation,
			states: templateCase.states.map((templateStates) => ({ xid: templateStates[0], value: templateStates[1] })),
		})),
	};
}
