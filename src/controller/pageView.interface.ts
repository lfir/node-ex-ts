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
