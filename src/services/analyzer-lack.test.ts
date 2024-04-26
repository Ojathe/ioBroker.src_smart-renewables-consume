import { AdapterInstance } from '@iobroker/adapter-core';
import { utils } from '@iobroker/testing';
import { expect } from 'chai';
import sinon from 'sinon';
import { AnalyzerLack } from './analyzer-lack';
import { AverageValueGroup } from '../values/average-value-group';
import { EXTERNAL_STATE_LANDINGZONE, INTERNAL_STATE_EEG } from '../handler/dp-handler';
import { createMockedLandingZone } from '../values/average-value-group.test';

const { adapter, database } = utils.unit.createMocks({});

describe('analyzer-lack', () => {
	const sandbox = sinon.createSandbox();

	afterEach(() => {
		// The mocks keep track of all method invocations - reset them after each single test
		adapter.resetMockHistory();
		// We want to start each test with a fresh database
		database.clear();
		// clear mocks
		sandbox.restore();
	});
	describe('run()', () => {
		const defaultProps = {
			powerDifAvg5: 0,
			powerGridAvg5: 0,
			batSoc: 0,
		};

		const init = async (
			props: {
				powerDifAvg5: number;
				powerGridAvg5: number;
				batSoc: number;
			} = defaultProps,
		) => {
			await createMockedLandingZone(adapter);
			const handler = await AverageValueGroup.build(adapter as unknown as AdapterInstance);
			const analyzer = new AnalyzerLack(adapter as unknown as AdapterInstance, handler);

			adapter.setState(handler.powerDif.avg5.xid, props.powerDifAvg5);
			adapter.setState(handler.powerGrid.avg5.xid, props.powerGridAvg5);
			adapter.setState(EXTERNAL_STATE_LANDINGZONE.BAT_SOC, props.batSoc);
			return { handler, analyzer };
		};

		[EXTERNAL_STATE_LANDINGZONE.BAT_SOC, INTERNAL_STATE_EEG.LOSS].forEach((testCase) => {
			it(`_ fetches ${testCase}`, async () => {
				// arrange
				const { analyzer } = await init();
				// act
				await analyzer.run();
				// assert
				expect(adapter.getStateAsync).to.be.calledWith(testCase);
			});
		});

		describe('detects no lack', () => {
			[
				{
					name: 'neutral power balance',
					props: { ...defaultProps },
				},
				{
					name: 'grid buying under threshold',
					props: { ...defaultProps, powerGridAvg5: AnalyzerLack.gridBuyingThreshold + 0.1 },
				},
				{
					name: 'power dif (>= -3kW) and battery 100%',
					props: { ...defaultProps, powerDifAvg5: -3, batSoc: 100 },
				},
				{
					name: 'power dif (>= -1,9kW) and battery at least 95%',
					props: { ...defaultProps, powerDifAvg5: -1.9, batSoc: 95 },
				},
				{
					name: 'power dif (>= -0,9kW) and battery  at least 60%',
					props: { ...defaultProps, powerDifAvg5: -0.9, batSoc: 60 },
				},
				{
					name: 'power dif (>= -0,5kW) and battery at least 30%',
					props: { ...defaultProps, powerDifAvg5: -0.5, batSoc: 30 },
				},
				{
					name: 'power dif (> 0kW) and battery at least 10%',
					props: { ...defaultProps, powerDifAvg5: 0, batSoc: 10 },
				},
			].forEach((testCase) => {
				it(`when  '${testCase.name}' setting: ${testCase.props.powerDifAvg5}kW avg5, ${testCase.props.powerGridAvg5}kW grid avg5, ${testCase.props.batSoc}% bat`, async () => {
					const asserts = utils.unit.createAsserts(database, adapter);

					// arrange
					const { analyzer } = await init(testCase.props);

					// act
					await analyzer.run();

					// assert
					expect(adapter.setStateAsync).to.be.calledWith(INTERNAL_STATE_EEG.LOSS, false);
					asserts.assertStateHasValue(INTERNAL_STATE_EEG.LOSS, false);
				});
			});
		});

		describe('detects lack', () => {
			[
				{
					name: 'grid buying above threshold',
					props: { ...defaultProps, powerGridAvg5: AnalyzerLack.gridBuyingThreshold },
				},
				{
					name: 'power dif (< -1,9kW) and battery <95%',
					props: { ...defaultProps, powerDifAvg5: -1.95, batSoc: 94 },
				},
				{
					name: 'power dif (< -0,9kW) and battery <60%',
					props: { ...defaultProps, powerDifAvg5: -0.95, batSoc: 59 },
				},
				{
					name: 'power dif (< -0,5kW) and battery <30%',
					props: { ...defaultProps, powerDifAvg5: -0.55, batSoc: 29 },
				},
				{
					name: 'power dif (< 0kW) and battery <10%',
					props: { ...defaultProps, powerDifAvg5: -0.1, batSoc: 9 },
				},
			].forEach((testCase) => {
				it(`when  '${testCase.name}' setting: ${testCase.props.powerDifAvg5}kW avg5, ${testCase.props.powerGridAvg5}kW grid avg5, ${testCase.props.batSoc}% bat`, async () => {
					const asserts = utils.unit.createAsserts(database, adapter);

					// arrange
					const { analyzer } = await init(testCase.props);

					// act
					await analyzer.run();

					// assert
					expect(adapter.setStateAsync).to.be.calledWith(INTERNAL_STATE_EEG.LOSS, true);
					asserts.assertStateHasValue(INTERNAL_STATE_EEG.LOSS, true);
				});
			});
		});
	});
});