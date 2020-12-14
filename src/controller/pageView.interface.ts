import mongoose from 'mongoose';

export interface IPageView extends mongoose.Document {
  host: string;
  path: string;
  language?: string;
  country?: string;
  date: Date;
}

export interface INewPageView {
  host: string;
  path: string;
  language?: string;
  country?: string;
}

export interface IUpdPageView {
  host?: string;
  path?: string;
  language?: string;
  country?: string;
  date?: string;
}
