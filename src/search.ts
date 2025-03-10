import combinations from "combinations";
import { MultiVehicleSearchSchema as searchScheama } from "./app";
import { locations, sortedLocations, location } from "./data/locations";
import { v4 as uuidv4 } from 'uuid';
import stringify from "json-stable-stringify";
type locationOuput = {
    location_id: string;
    listing_ids: string[];
    total_price_in_cents: number;
};
function searchLocations(data: searchScheama) {
    //Calculate total area for simple cut off
    const totalArea = calculateTotalArea(data);
    const searchResponse: locationOuput[] = [];
    const id = uuidv4()
    console.log(`New request "${id}" Total area: ${totalArea}, data: ${JSON.stringify(data)}`);

    console.time(id)

    for (const [location_id, location] of sortedLocations) {
        //sortedLocations is sorted in descending order so break if the area
        // of the cars is larger then the area of the rest of the locations
        if (location.totalArea < totalArea) break;

        //Otherwise test it, if it was a success add the output to the response
        const output = testLocation(data, location);
        if (output.success) searchResponse.push(output.output);
    }

    //Sort responses in ascending order
    searchResponse.sort(
        (a, b) => a.total_price_in_cents - b.total_price_in_cents
    );

    console.timeEnd(id)
    return searchResponse;
}
//Calculate total area of cars
function calculateTotalArea(data: searchScheama) {
    let totalArea = 0;
    for (const car of data) {
        totalArea += car.length * 10 * car.quantity;
    }
    return totalArea;
}

type testLocationOutput =
    | {
          success: false;
      }
    | { success: true; output: locationOuput };
//Location tester, parses the data into the format to go into the recursive function
function testLocation(
    data: searchScheama,
    location: location
): testLocationOutput {
    //Parse each location into its indiviual "lanes", eg a location of 20x20, has two lanes of length 20
    const listings: { lanes: number[]; price: number; id: string }[] = [];
    for (const listingId of location.listingIDs) {
        const listing = location.listings[listingId];
        const lanes = new Array(listing.width / 10).fill(listing.length);
        listings.push({
            lanes,
            price: listing.price_in_cents,
            id: listing.id,
        });
    }

    //Convert the request data into an array of cars, sorted from largest to smallest
    const cars: number[] = [];
    for (const car of data) {
        for (let i = 0; i < car.quantity; i++) cars.push(car.length);
    }
    cars.sort((a, b) => b - a);

    const listingCombinations = combinations(listings.map((x) => x.id));

    let cheapest = Infinity;
    let cheapestIds: string[] = [];
    let cheapestIndex: number[] = [];
    //Get each combination of listings for the location
    for (const purchased of listingCombinations) {
        //Calculate the total price of this combination
        const purchasedIndex = purchased.map((a) =>
            listings.findIndex((b) => b.id == a)
        );
        let total = 0;
        for (const listing of purchased) {
            total += location.listings[listing].price_in_cents;
        }
        //If the price is more expesnive then the cheapest found option, ignore this combination
        if (total >= cheapest) continue;

        //If the price is cheaper, test to see if this combination fits the cars
        // If it does save it
        const test = packLanes(cars, listings, purchasedIndex, {});
        if (test) {
            cheapest = total;
            cheapestIds = purchased;
            cheapestIndex = purchasedIndex;
        }
    }
    //Infinity means no solution was found for this location
    if (cheapest == Infinity) {
        return { success: false };
    } else {
        return {
            success: true,
            output: {
                location_id: location.id,
                listing_ids: cheapestIds,
                total_price_in_cents: cheapest,
            },
        };
    }
}

function packLanes(
    cars: number[],
    listings_orig: { lanes: number[]; price: number; id: string }[],
    purchased: number[],
    memo: any
) {
    //Base case, no cars left to pack success
    if (cars.length === 0) {
        return true;
    }

    //Check memo and return if found
    const hash = stringify({ cars, listings_orig });
    if (!hash) throw "failed to hash";
    if (typeof memo[hash] == "boolean") return memo[hash];

    //If no memo match, actually calcualte

    //Grab the first car to pack
    const car = cars[0];

    //First attempt to put the current car into any lane a purchased listing
    for (const index of purchased) {
        const listings = structuredClone(listings_orig);
        const listing = listings[index];

        //Try each lane to see if the car fits in a given listing
        let carParked = false;
        for (const i in listing.lanes) {
            const lane = listing.lanes[i];
            if (car <= lane) {
                listing.lanes[i] -= car;
                carParked = true;
                break;
            }
        }
        //If the car managed to fit, then check to see if we can pack the rest of the cars
        // Otherwise ignore this and test the rest of the purchased listings
        if (carParked) {
            //Test packing the remaining cars
            // Listings has already been updated to note that there is a car in one of the lanes
            let test = packLanes(cars.slice(1), listings, purchased, memo);
            if (test) {
                //Update memo if passed and return that we can from this state
                memo[hash] = true;
                return true;
            }
        }
    }
    // If we get to this sport, the cars can not be packed
    memo[hash] = false;
    return false;
}

export default searchLocations;
export { packLanes };
