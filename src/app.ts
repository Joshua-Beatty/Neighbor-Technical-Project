import express from "express";
import { z } from "zod";
import searchLocations from "./search";

const app = express();
app.use(express.json());


//Schema validation for incoming request
const VehicalSchema = z.object({
    length: z.number().positive(),
    quantity: z.number().int().positive(),
});
const MultiVehicleSearchSchema = z.array(VehicalSchema).min(1).max(5);
type MultiVehicleSearchSchema = z.infer<typeof MultiVehicleSearchSchema>;


//Just validate the incoming data and pass to search handler
app.post("/", (req, res) => {
    const result = MultiVehicleSearchSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).send(result.error);
        return;
    }
    res.send(searchLocations(result.data));
});

export default app;
export type { MultiVehicleSearchSchema };
