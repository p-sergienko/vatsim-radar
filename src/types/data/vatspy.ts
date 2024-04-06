import type { Feature } from 'geojson';
import type { VatsimShortenedController, VatsimShortenedData } from '~/types/data/vatsim';

export interface VatSpyResponse {
    current_commit_hash: string;
    fir_boundaries_dat_url: string;
    fir_boundaries_geojson_url: string;
    vatspy_dat_url: string;
}

export interface VatSpyAPIData {
    version: string;
    data: VatSpyData;
}

export interface VatSpyData {
    id: string;
    countries: {
        country: string
        code: string
        callsign?: string
    }[];
    airports: {
        icao: string
        name: string
        lat: number
        lon: number
        iata?: string
        fir?: string
        isPseudo: boolean
    }[];
    firs: {
        icao: string
        name: string
        callsign?: string
        boundary?: string
        isOceanic: boolean
        lon: number
        lat: number
        region: string
        division: string
        feature: Feature
    }[];
    uirs: {
        icao: string
        name: string
        firs: string
    }[];
}

export interface VatSpyDataFeature {
    icao?: string;
    name?: string;
    controller?: VatsimShortenedController;
    firs: { boundaryId: string, controller?: VatsimShortenedController }[];
}

export interface VatSpyDataLocalATC {
    atc: VatsimShortenedController
    isATIS: boolean
    airport: {
        icao: string
        iata?: string
    }
}
