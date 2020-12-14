import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { mongooseOptions } from '../src/configuration/mongooseConfiguration';
import AnalyticsController from '../src/controller/analyticsController';
import { IUpdPageView } from '../src/controller/pageView.interface';

const ctrl: AnalyticsController = new AnalyticsController();

beforeAll(() => {
  dotenv.config();
  mongoose.connect(process.env.MONGO_URI, mongooseOptions);
});

test('retrievePageViews gets number of records specified by limit param', async () => {
  const datal1 = ctrl.retrievePageViews({ limit: '1' });
  const datal2 = ctrl.retrievePageViews({ limit: '2' });

  const results = await Promise.all([datal1, datal2]);

  expect(results[0].length).toEqual(1);
  expect(results[1].length).toEqual(2);
});

test('retrievePageViews gets records in range specified by from and to params only', async () => {
  const expectedDate = '2020-05-20';

  const results = await ctrl.retrievePageViews({
    from: expectedDate,
    to: expectedDate
  });
  const receivedDate = results[0].get('date').toJSON();

  expect(receivedDate).toMatch(expectedDate);
  expect(results.length).toEqual(1);
});

test('CRUD operations can be executed', async () => {
  const expectedHost = 'itest',
    createdRecordId = (await ctrl.storePageView(expectedHost, '/tst')).get(
      '_id'
    ),
    idObj = { id: createdRecordId },
    retrievedRecordHost = (await ctrl.retrievePageView(idObj)).get('host'),
    exptectedPath = '/tmp',
    newPathObj: IUpdPageView = { path: exptectedPath },
    updatedRecordPath = (await ctrl.updatePageView(idObj, newPathObj)).get(
      'path'
    ),
    deletedRecordId = (await ctrl.deletePageView(idObj)).get('_id');

  expect(createdRecordId).toBeTruthy();
  expect(retrievedRecordHost).toEqual(expectedHost);
  expect(updatedRecordPath).toEqual(exptectedPath);
  expect(deletedRecordId).toEqual(createdRecordId);
});

afterAll(async () => {
  await mongoose.disconnect();
});
