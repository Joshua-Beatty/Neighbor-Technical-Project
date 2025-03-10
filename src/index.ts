import app from "./app";
import { packLanes } from "./search";

//Start the app on port 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

const output = packLanes(
    [
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
    ],
    [
        {
            lanes: [20, 20, 20, 20],
            price: 20080,
            id: "da08da27-089b-4bc1-9ec4-41f4b65063ab",
        },
        {
            lanes: [500, 40, 40],
            price: 21038,
            id: "e4bc7133-471c-4934-8dcd-fbafb49c0037",
        },
    ],
    [0, 1],
    {}
);
console.log(output);
