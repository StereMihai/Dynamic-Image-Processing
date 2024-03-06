import ImageController from "../image.controller";
import request from "supertest";
import App from "../../../app";
import fs from "fs";
import path from "path";

describe("ImageController", () => {
  let imageController: ImageController;
  let app: App;
  const testFilePath = path.join(__dirname, "test-files", "test-file.jpg");
  beforeEach(() => {
    imageController = new ImageController();
    app = new App([imageController]);
  });

  describe("POST /images", () => {
    it("should return 400 if no file is uploaded", async () => {
      const response = await request(app.app).post("/images");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "No file uploaded" });
    });

    it("should upload a file successfully", async () => {
      const response = await request(app.app)
        .post("/images")
        .attach("file", testFilePath);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "File uploaded successfully" });
    });

    describe("GET /images", () => {
      it("should return an array of file names", async () => {
        const response = await request(app.app).get("/images");

        expect(response.status).toBe(200);
        expect(response.body.fileNames).toBeDefined();
        expect(Array.isArray(response.body.fileNames)).toBe(true);
      });
    });

    describe("GET /images/statistics", () => {
      it("should return image processing statistics", async () => {
        const response = await request(app.app).get("/images/statistics");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.objectContaining({
          totalImageProcessingRequests: expect.any(Number),
          hitRatio: expect.any(Number),
          missRatio: expect.any(Number),
          totalNumberOfOriginalFiles: expect.any(Number),
        }));
      });
    });
  });
});
