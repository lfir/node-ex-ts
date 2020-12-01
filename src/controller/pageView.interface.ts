import mongoose from 'mongoose';

export interface INewPageView {
    host: string,
    path: string,
    language?: string,
    country?: string
}

export interface IUpdPageView {
    _id?: string,
    date?: string,
    host?: string,
    path?: string,
    language?: string,
    country?: string
}

export interface IPageView extends mongoose.Document {
    host: string,
    path: string,
    language?: string,
    country?: string,
    date: Date
}
