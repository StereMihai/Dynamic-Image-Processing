# Image Controller Endpoints

This README provides information on how to use the endpoints provided by the Image Controller.

## Prerequisites

Before using the endpoints, ensure you have the following:

- Node.js installed on your machine
- npm package manager
- Docker (if you plan to run the service within a Docker container)
> Create an '/uploads' directory at the root of the project. You can either manually upload files to this directory or utilize the "Upload a File" endpoint provided by the service.

## Installation

1. Clone this repository to your local machine:

    ```bash
    git clone git@github.com:StereMihai/Dynamic-Image-Processing.git
    ```

2. Install dependencies:

    ```bash
    cd Dynamic-Image-Processing
    npm install
    ```

3. Create a `.env` file in the root directory of the project and specify the desired port:

    ```plaintext
    PORT=4000
    ```

## Running the Service

To start the service locally, run:

```bash
npm start
```

To run tests, run:

```bash
npm test
```

### Building and running application with Docker

When you're ready, start your application by running:
`docker compose up --build`.

## Endpoints

The following endpoints are available:

### Upload a File

- **Method:** POST
- **Path:** /images
- **Description:** Upload a file.
- **Request Body:** Form data with the file to upload.
- **Response:** 
  - 400 Bad Request if no file is uploaded.
  - 200 OK with a JSON response `{ message: "File uploaded successfully" }` if the file is uploaded successfully.

### Retrieve All File Names

- **Method:** GET
- **Path:** /images
- **Description:** Retrieve a list of all file names in the uploads directory.
- **Response:** 
  - 200 OK with a JSON response containing an array of file names.

### Process and Retrieve Image File

- **Method:** GET
- **Path:** /images/:filename
- **Description:** Process and retrieve an image file by filename.
- **Query Parameters:** 
  - `resolution`: Optional query parameter specifying the desired width and height of the image.
- **Response:** 
  - 500 Failed to process file
  - 400 Bad Request if the query string format is incorrect.
  - 404 Bad Request if the file does not exist.
  - 200 OK with the processed image data if successful.

### Delete Image File

- **Method:** DELETE
- **Path:** /images/:filename
- **Description:** Delete an image file by filename.
- **Response:** 
  - 404 Not Found if the file does not exist.
  - 200 OK with a JSON response `{ message: "File successfully deleted" }` if the file is deleted successfully.

### Get Statistics

- **Method:** GET
- **Path:** /statistics
- **Description:** Get statistics on the number of image processing requests, cache hits, cache misses, and total number of original files uploaded.
- **Response:** 
  - 200 OK with a JSON response containing the following statistics:
    - `totalImageProcessingRequests`: Total number of image processing requests.
    - `hitRatio`: Cache hit ratio as a percentage.
    - `missRatio`: Cache miss ratio as a percentage.
    - `totalNumberOfOriginalFiles`: Total number of original files uploaded.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.