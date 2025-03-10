import { MultiVehicleSearchSchema as searchScheama } from "./app";
import { locations, sortedLocations, location } from "./data/locations";
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

    //Test if we can pack the cars into the given listings using the helper
    const test = packLanes(cars, listings, [], []);
    //Price of Infinity means it is not possible to pack them
    if (test.price !== Infinity) {
        return {
            success: true,
            output: {
                location_id: location.id,
                listing_ids: test.purchasedIds,
                total_price_in_cents: test.price,
            },
        };
    }

    return { success: false };
}

function packLanes(
    cars: number[],
    listings_orig: { lanes: number[]; price: number; id: string }[],
    purchased: number[],
    purchasedIds: string[]
) {
    //If there are no cars left in the lenth, packing is successful
    // return that there is no additional cost
    if (cars.length === 0) return { price: 0, purchased, purchasedIds };

    //Grab the first car to pack
    const car = cars[0];

    //Load inital conditions
    let lowestPrice = Infinity;
    //These arrays will be overwritten if there is a successful packing
    let lowestPricePurchased: number[] = [];
    let lowestPricePurchasedIds: string[] = [];

    //First attempt to put the current car into any lane of a currently purchased listing
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
            let price = packLanes(
                cars.slice(1),
                listings,
                purchased,
                purchasedIds
            );
            // If the price is less then the current price go aheaad and save 
            // That this packing is the most optimal so far
            if (price.price < lowestPrice) {
                lowestPrice = price.price;
                lowestPricePurchased = price.purchased;
                lowestPricePurchasedIds = price.purchasedIds;
            }
        }
    }
    //If lowest price is 0, that means all of the above cars were
    // able to fit without purchasing any additional listing, so no need to test further
    if (lowestPrice === 0) {
        return {
            price: lowestPrice,
            purchased: lowestPricePurchased,
            purchasedIds: lowestPricePurchasedIds,
        };
    }

    //If we were not able to park the car into any of the already purchased listings
    // Or if the cheapest of the packing attempts above cost money, we should attempt 
    // to pack this car into a newly purchased listing
    for (const index in listings_orig) {
        const listings = structuredClone(listings_orig);
        const listing = listings[index];

        //Make sure this car fits into this listing before purchasing it
        if (listing.lanes[0] < car) continue;

        //Note price, and put car into the first lane
        listing.lanes[0] -= car;
        const price = listing.price;

        //Creating new "purchased" arrays
        const purchased_new = structuredClone(purchased);
        purchased_new.push(Number(index));
        const purchasedIds_new = structuredClone(purchasedIds);
        purchasedIds_new.push(listing.id);
        let newPrice = packLanes(
            cars.slice(1),
            listings,
            purchased_new,
            purchasedIds_new
        );

        const totalPrice = newPrice.price + price;
        //If the price is cheaper then anything we have seen so far return it
        if (totalPrice < lowestPrice) {
            lowestPrice = totalPrice;
            lowestPricePurchased = newPrice.purchased;
            lowestPricePurchasedIds = newPrice.purchasedIds;
        }
    }

    return {
        price: lowestPrice,
        purchased: lowestPricePurchased,
        purchasedIds: lowestPricePurchasedIds,
    };
}

export default searchLocations;
export { packLanes };
