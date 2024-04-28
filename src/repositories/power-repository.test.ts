import { AdapterInstance } from '@iobroker/adapter-core';
import { MockAdapter, utils } from '@iobroker/testing';
import { expect } from 'chai';
import sinon from 'sinon';
import { AverageValue } from '../values/average-value';
import { AverageValueGroupMembers, PowerRepository } from './power-repository';
import { EXTERNAL_STATE_LANDINGZONE } from '../handler/dp-handler';
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

describe('power-repository', () => {
	const currentTestCaseSolutions: Array<CurrentTestSolution<any>> = [
		createCurrentTestCase({
			function: 'powerBalance',
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
			function: 'solarRadiation',
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
		return await PowerRepository.build(adapter as unknown as AdapterInstance);
	};

	const stateMap: Map<AggregatFunction, [string, object | undefined]> = new Map([
		[
			'solarRadiation',
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
			'powerBattery',
			[
				'bat-load',
				{
					desc: 'The Battery load (-) consuming / (+) charging',
					xidSource: EXTERNAL_STATE_LANDINGZONE.BAT_LOAD,
					unit: 'kW',
				},
			],
		],
		['powerBalance', ['power-dif', undefined]],
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
				for (const currentCase of testSolution.testCases) {
					const stateDescription = currentCase.states.map((state) => `${state.xid}=${state.value}`).join(', ');
					it(`Statesituation '${stateDescription}' udaptes 'current' to ${currentCase.expectation}`, async () => {
						const handler = await initHandler();
						for (const state of currentCase.states) {
							await adapter.setStateAsync(state.xid, state.value);
						}
						await handler.calculate();
						expect(await handler.members[testSolution.function].current.getValue()).to.eq(currentCase.expectation);
					});
				}
			});
		});
	}
});

type AggregatFunction = keyof AverageValueGroupMembers;

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
