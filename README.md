# Neighbor Technical Project

This is the take home technical project for Neighbor. See [INSTRUCTIONS](./INSTRUCTIONS.md), for design docs.

## Requirements

-   [Node.js](https://nodejs.org/) (22 LTS)
-   npm (Comes with Node.js)

## Installation

1. Install Node.js (22 LTS) from [here](https://nodejs.org/).
2. Clone this repository and navigate to the project folder.
3. Run the following command to install dependencies:
    ```sh
    npm install
    ```

## Running the Application

Start the application with:

```sh
npm start
```

## API Endpoint

The API runs at:  
[http://localhost:3000/](http://localhost:3000/)
See [INSTRUCTIONS](./INSTRUCTIONS.md) for details of API docs.

## Assumptions

-   Cars do not neeed any margin around them to fit into a location, eg 4 cars of length 10, can fit into a listing with a size of 20x20
-   Car length and quantity must be positive
-   Cars can not rotate, eg the length of the car must be aligned with the length of the listing
