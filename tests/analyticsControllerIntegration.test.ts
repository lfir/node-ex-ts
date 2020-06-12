import AnalyticsController from '../src/controller/analyticsController';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const ctrl: AnalyticsController = new AnalyticsController();

beforeAll(() => {
  dotenv.config();
  mongoose.connect(process.env.MONGO_URI);
});

test('retrievePageViews gets number of records specified by limit param', async () => {
  const datal1 = ctrl.retrievePageViews({ limit: '1' });
  const datal2 = ctrl.retrievePageViews({ limit: '2' });
  const results = await Promise.all([datal1, datal2]);
  expect(results[0].length).toEqual(1);
  expect(results[1].length).toEqual(2);
});

afterAll(async () => {
  await mongoose.disconnect();
});
