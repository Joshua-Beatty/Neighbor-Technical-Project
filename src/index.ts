import app from "./app";
import { packLanes } from "./search";

//Start the app on port 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

const output = packLanes(
    [50, 40, 21, 21],
    [
        { lanes: [92], price: 100, id: "1" },
        { lanes: [42], price: 10, id: "2" },
        { lanes: [40], price: 1, id: "3" },
    ],
    [],
    []
);
console.log(output);
