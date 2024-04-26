import { AdapterInstance } from '@iobroker/adapter-core';
import { utils } from '@iobroker/testing';
import { expect } from 'chai';
import { CreateXIdProps, XidNumber, XidString } from './xid';
import { createObject, createObjectNum } from '../util/create-objects-helper';

const { adapter, database } = utils.unit.createMocks({});

const mockAdapter = adapter as unknown as AdapterInstance;

describe('XId', () => {
	afterEach(() => {
		// The mocks keep track of all method invocations - reset them after each single test
		adapter.resetMockHistory();
		// We want to start each test with a fresh database
		database.clear();
	});

	describe('asReadable', () => {
		describe('with valid params', () => {
			const setup = async () => {
				const asserts = utils.unit.createAsserts(database, adapter);

				const testId = 'any.test.xid';
				await createObjectNum(mockAdapter, testId, 3);

				asserts.assertObjectExists(testId);
				asserts.assertStateExists(testId);

				const xid = await XidNumber.asReadable(mockAdapter, testId);

				return { asserts, testId, xid };
			};

			it('creates xid object', async () => {
				const { testId, xid } = await setup();

				expect(xid).not.to.be.undefined;
				expect(xid.xid).to.eq(testId);
			});

			it('getValue returns value', async () => {
				const { xid } = await setup();

				expect(await xid.getValue()).to.eq(3);
			});

			it('setValue throws error', async () => {
				const { testId, xid } = await setup();

				expect(xid.setValue(2)).to.be.rejectedWith('Non managed xid\'s are not allowed to write values: ' + testId);
			});
		});

		it('with non existing state _ throws error', async () => {
			const testId = 'any.test.xid';

			expect(XidNumber.asReadable(mockAdapter, testId)).to.be.rejectedWith(`Non existing State '${testId}'`);
		});

		it('with non matching type _ throws error', async () => {
			const testId = 'any.test.xid';
			await createObjectNum(mockAdapter, testId, 3);

			expect(XidString.asReadable(mockAdapter, testId)).to.be.rejectedWith(
				`Mismatching type for state  '${testId}' (expected: string, given: number)`,
			);
		});

		it('with non existing value _ throws error', async () => {
			const testId = 'any.test.xid';
			await createObject(mockAdapter, testId, 'number', undefined as unknown as number);

			const xid = await XidNumber.asReadable(mockAdapter, testId);
			expect(xid.getValue()).to.be.rejectedWith('No value present in state: ' + testId);
		});
	});

	describe('asManaged', () => {
		const setup = async (defaultValue = 0, props?: CreateXIdProps, testId: string = 'any.test.xid') => {
			const asserts = utils.unit.createAsserts(database, adapter);

			const xid = await XidNumber.asManaged(mockAdapter, testId, defaultValue, props);

			return { asserts, testId, xid };
		};

		it('creates xid object', async () => {
			const { xid, testId } = await setup();

			expect(xid).not.to.be.undefined;
			expect(xid.xid).to.eq(testId);
		});

		it('getValue returns value', async () => {
			const { xid } = await setup(3);

			expect(await xid.getValue()).to.eq(3);
		});

		it('setValue do not throw an error', async () => {
			const { xid } = await setup();

			expect(xid.setValue(2)).not.to.be.rejected;
		});

		it('setValue updates the value', async () => {
			const { xid, asserts } = await setup();

			await xid.setValue(5);

			asserts.assertStateHasValue(xid.xid, 5);
			asserts.assertStateIsAcked(xid.xid, true);
		});

		describe('creates iobroker object', () => {
			it('as state', async () => {
				const { testId, asserts } = await setup();

				asserts.assertObjectExists(testId);
				asserts.assertStateExists(testId);
			});

			it('with initial read/write access ', async () => {
				const { testId, asserts } = await setup(0, {});
				asserts.assertObjectCommon(testId, { read: true, write: true } as unknown as ioBroker.ObjectCommon);
			});

			it('with defined read/write access ', async () => {
				const { testId, asserts } = await setup(0, { access: { read: false, write: false } });
				asserts.assertObjectCommon(testId, { read: false, write: false } as unknown as ioBroker.ObjectCommon);
			});

			it('with given unit °C', async () => {
				const aUnit = '°C';
				const { testId, asserts } = await setup(0, { unit: aUnit });

				asserts.assertObjectCommon(testId, { unit: aUnit } as unknown as ioBroker.ObjectCommon);
			});

			it('with given description', async () => {
				const anyDescription = 'any text as description';
				const { testId, asserts } = await setup(0, { desc: anyDescription });

				asserts.assertObjectCommon(testId, { desc: anyDescription } as unknown as ioBroker.ObjectCommon);
			});
		});
	});
});
