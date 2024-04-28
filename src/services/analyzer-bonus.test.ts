import { AdapterInstance } from '@iobroker/adapter-core';
import { utils } from '@iobroker/testing';
import { expect } from 'chai';
import sinon from 'sinon';
import { AnalyzerBonus } from './analyzer-bonus';
import { PowerRepository } from '../repositories/power-repository';
import { createMockedLandingZone } from '../repositories/power-repository.test';
import { EXTERNAL_STATE_LANDINGZONE, LandingZoneRepoImpl } from '../repositories/landing-zone-repository';
import { EegRepositoryImpl, INTERNAL_STATE_EEG } from '../repositories/eeg-repository';

const { adapter, database } = utils.unit.createMocks({});

describe('analyzer-bonus', () => {
	const sandbox = sinon.createSandbox();
	afterEach(() => {
		// The mocks keep track of all method invocations - reset them after each single test
		adapter.resetMockHistory();
		// We want to start each test with a fresh database
		database.clear();
		// clear mocks
		sandbox.restore();
	});
	describe('run()', async () => {
		const defaultProps = {
			powerDifCurrent: 0,
			powerDifAvg: 0,
			powerGridAvg: 0,
		};

		const init = async (
			props: { powerDifCurrent: number; powerDifAvg: number; powerGridAvg: number } = defaultProps,
		) => {
			await createMockedLandingZone(adapter);
			const powerRepo = await PowerRepository.create(adapter as unknown as AdapterInstance);
			const landingZoneRepo = await LandingZoneRepoImpl.create(adapter as unknown as AdapterInstance);
			const eegRepo = await EegRepositoryImpl.create(adapter as unknown as AdapterInstance);

			const analyzer = new AnalyzerBonus(powerRepo, landingZoneRepo, eegRepo);

			adapter.setState(powerRepo.members.powerBalance.current.xid, props.powerDifCurrent);
			adapter.setState(powerRepo.members.powerBalance.avg.xid, props.powerDifAvg);
			adapter.setState(powerRepo.members.powerGrid.avg.xid, props.powerGridAvg);
			return { powerRepo, analyzer };
		};

		[EXTERNAL_STATE_LANDINGZONE.BAT_SOC, INTERNAL_STATE_EEG.BONUS].forEach((testCase) => {
			it(`_ fetches ${testCase}`, async () => {
				// arrange
				const { analyzer } = await init();
				// act
				await analyzer.run();
				// assert
				expect(adapter.getStateAsync).to.be.calledWith(testCase);
			});
		});

		describe('_ detects no bonus', () => {
			[
				{
					name: 'neutral power balance',
					props: { ...defaultProps },
					bat: 30,
				},
				{
					name: 'negative current power',
					props: { ...defaultProps, powerDifCurrent: -2 },
					bat: 30,
				},
				{
					name: 'negative current power and positive avg',
					props: { ...defaultProps, powerDifCurrent: -2, powerDifAvg: 2 },
					bat: 30,
				},
				{
					name: 'negative avg power',
					props: { ...defaultProps, powerDifAvg: -2 },
					bat: 0,
				},
				{
					name: 'negative avg power and positive current',
					props: { ...defaultProps, powerDifAvg: -2, powerDifCurrent: 2 },
					bat: 30,
				},
				{
					name: 'grid selling but low battery',
					props: { powerDifCurrent: 1, powerDifAvg: 1, powerGridAvg: 2 },
					bat: AnalyzerBonus.batChargeMinimum,
				},
				{
					name: 'grid selling but not enough for threshold',
					props: { ...defaultProps, powerGridAvg: AnalyzerBonus.sellingThreshold },
					bat: 30,
				},
			].forEach((testCase) => {
				it(`when  '${testCase.name}' setting: ${testCase.props.powerDifCurrent}kW cur,${testCase.props.powerDifAvg}kW avg,${testCase.props.powerGridAvg}kW grid, ${testCase.bat}% bat`, async () => {
					const asserts = utils.unit.createAsserts(database, adapter);

					// arrange
					const { analyzer } = await init(testCase.props);
					adapter.setState(EXTERNAL_STATE_LANDINGZONE.BAT_SOC, testCase.bat, true);
					adapter.setState(INTERNAL_STATE_EEG.SOC_LAST_BONUS, -1, true);
					asserts.assertStateHasValue(INTERNAL_STATE_EEG.SOC_LAST_BONUS, -1);

					// act
					await analyzer.run();

					// assert
					// update bonus itself
					expect(adapter.setStateAsync).to.be.calledWith(INTERNAL_STATE_EEG.BONUS, false);
					asserts.assertStateHasValue(INTERNAL_STATE_EEG.BONUS, false);

					// do not update last bonus battery charge
					asserts.assertStateHasValue(INTERNAL_STATE_EEG.SOC_LAST_BONUS, -1);
				});
			});
		});

		describe('detects bonus ', () => {
			[
				{
					name: 'when positive powerDif ',
					props: { ...defaultProps, powerDifCurrent: 1, powerDifAvg: 1 },
					bat: 30,
				},
				{
					name: 'when positive powerGrid ',
					props: { ...defaultProps, powerDifCurrent: 1, powerGridAvg: 1 },
					bat: 30,
				},
			].forEach((testCase) => {
				it(`when  '${testCase.name}' setting: ${testCase.props.powerDifCurrent}kW cur,${testCase.props.powerDifAvg}kW avg,${testCase.props.powerGridAvg}kW grid, ${testCase.bat}% bat`, async () => {
					const asserts = utils.unit.createAsserts(database, adapter);

					// arrange
					const { analyzer } = await init(testCase.props);
					adapter.setState(EXTERNAL_STATE_LANDINGZONE.BAT_SOC, testCase.bat);

					// act
					await analyzer.run();

					// assert
					// update bonus state itself
					expect(adapter.setStateAsync).to.be.calledWith(INTERNAL_STATE_EEG.BONUS, true);
					asserts.assertStateHasValue(INTERNAL_STATE_EEG.BONUS, true);

					// update battery stand of charge
					expect(adapter.setStateAsync).to.be.calledWith(INTERNAL_STATE_EEG.SOC_LAST_BONUS, testCase.bat);
					asserts.assertStateHasValue(INTERNAL_STATE_EEG.SOC_LAST_BONUS, testCase.bat);
				});
			});
		});
	});
});
