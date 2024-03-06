import sharp from "sharp";

export async function resizeImage(
  inputPath: string,
  width: number,
  height: number
) {
  const { data } = await sharp(inputPath)
    .resize({ width, height })
    .toBuffer({ resolveWithObject: true });

  return Buffer.from(data.buffer);
}
