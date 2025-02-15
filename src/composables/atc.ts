import type { VatsimShortenedController } from '~/types/data/vatsim';
import { getHoursAndMinutes } from '~/utils';
import type { Map } from 'ol';
import type { ShallowRef } from 'vue';
import type { VatSpyData } from '~/types/data/vatspy';
import { useMapStore } from '~/store/map';
import type { StoreOverlayPilot } from '~/store/map';

export const useFacilitiesIds = () => {
    const dataStore = useDataStore();

    return {
        ATIS: -1,
        OBS: dataStore.vatsim.data.facilities.value.find(x => x.short === 'OBS')?.id ?? -1,
        FSS: dataStore.vatsim.data.facilities.value.find(x => x.short === 'FSS')?.id ?? -1,
        DEL: dataStore.vatsim.data.facilities.value.find(x => x.short === 'DEL')?.id ?? -1,
        GND: dataStore.vatsim.data.facilities.value.find(x => x.short === 'GND')?.id ?? -1,
        TWR: dataStore.vatsim.data.facilities.value.find(x => x.short === 'TWR')?.id ?? -1,
        APP: dataStore.vatsim.data.facilities.value.find(x => x.short === 'APP')?.id ?? -1,
        CTR: dataStore.vatsim.data.facilities.value.find(x => x.short === 'CTR')?.id ?? -1,
    };
};

export function getControllerPositionColor(controller: VatsimShortenedController) {
    const ids = useFacilitiesIds();

    if (controller.isATIS || controller.facility === ids.ATIS) {
        return radarColors.warning500;
    }

    if (controller.facility === ids.DEL) {
        return radarColors.primary700;
    }

    if (controller.facility === ids.TWR) {
        return radarColors.error700;
    }

    if (controller.facility === ids.GND) {
        return radarColors.success500;
    }

    if (controller.facility === ids.APP) {
        return radarColors.error300;
    }

    if (controller.facility === ids.CTR) {
        return radarColors.primary300;
    }

    return radarColors.darkgray800;
}

export function sortControllersByPosition<T extends { facility: number; isATIS?: boolean; [key: string]: any }>(facilities: T[]): T[] {
    const ids = useFacilitiesIds();

    const getPositionIndex = (position: number, isAtis = false) => {
        if (isAtis) return 5;
        if (position === ids.DEL) return 0;
        if (position === ids.GND) return 1;
        if (position === ids.TWR) return 2;
        if (position === ids.APP) return 3;
        if (position === ids.CTR) return 4;
        if (position === ids.ATIS) return 5;
        return 6;
    };

    return facilities.slice().sort((a, b) => {
        return getPositionIndex(a.facility, a.isATIS) > getPositionIndex(b.facility, b.isATIS) ? 1 : -1;
    });
}

export function findAtcByCallsign(callsign: string) {
    const dataStore = useDataStore();
    const local = dataStore.vatsim.data.locals.value.find(x => x.atc.callsign === callsign)?.atc;
    if (local) return local;

    return dataStore.vatsim.data.firs.value.find(x => x.controller?.callsign === callsign)?.controller;
}

export function getATCTime(controller: VatsimShortenedController) {
    return getHoursAndMinutes(new Date(controller.logon_time).getTime());
}

export function findAtcAirport(atc: VatsimShortenedController) {
    const dataStore = useDataStore();
    const title = atc.callsign.split('_')[0];
    const iataAirport = dataStore.vatspy.value?.data.airports.find(x => x.iata === title);
    if (iataAirport) {
        return {
            ...iataAirport,
            icao: iataAirport.iata!,
        };
    }

    return dataStore.vatspy.value?.data.airports.find(x => x.icao === title);
}

export async function showAirportOnMap(airport: VatSpyData['airports'][0], map: Map | null, zoom?: number) {
    map = map || inject<ShallowRef<Map | null>>('map')!.value;
    const mapStore = useMapStore();
    const view = map?.getView();
    if (!airport) return;

    mapStore.overlays.filter(x => x.type === 'pilot').forEach(x => (x as StoreOverlayPilot).data.tracked = false);
    await nextTick();

    view?.animate({
        center: [airport.lon, airport.lat],
        zoom: zoom ?? 14,
    });
}

export function showAtcOnMap(atc: VatsimShortenedController, map: Map | null) {
    map = map || inject<ShallowRef<Map | null>>('map')!.value;
    const airport = findAtcAirport(atc);
    if (!airport) return;

    return showAirportOnMap(airport, map);
}
