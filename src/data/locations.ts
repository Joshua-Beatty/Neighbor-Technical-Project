import listings from "./listings.json";

type listing = (typeof listings)[number];

type location = {
    listingIDs: string[];
    listings: Record<string, listing>;
    totalArea: number;
    id: string;
};
const locations: Record<string, location> = {};
for (const listing of listings) {
    const location_id = listing.location_id;
    if (!locations[location_id]) {
        locations[location_id] = {
            listingIDs: [],
            listings: {},
            totalArea: 0,
            id: location_id
        };
    }
    const location = locations[location_id];
    location.listingIDs.push(listing.id);
    location.listings[listing.id] = listing;
    location.totalArea += listing.width * listing.length;
}

const sortedLocations = Object.entries(locations);
sortedLocations.sort((a, b) => b[1].totalArea - a[1].totalArea);

export { locations, sortedLocations };
export type { location };
