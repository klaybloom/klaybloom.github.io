import sharp from "sharp";

export const IMAGE_MAX_EDGE = 1600;
export const IMAGE_WEBP_QUALITY = 82;
export const IMAGE_MAX_BYTES = 1024 * 1024;

type ConvertImageOptions = {
  maxEdge?: number;
  quality?: number;
  maxBytes?: number;
};

export async function convertImageToWebp(
  input: Buffer,
  options: ConvertImageOptions = {},
) {
  const maxEdge = options.maxEdge ?? IMAGE_MAX_EDGE;
  const initialQuality = options.quality ?? IMAGE_WEBP_QUALITY;
  const maxBytes = options.maxBytes ?? IMAGE_MAX_BYTES;
  const metadata = await sharp(input, { animated: true }).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Image dimensions could not be determined");
  }

  const longestEdge = Math.max(metadata.width, metadata.height);
  const baseScale = Math.min(1, maxEdge / longestEdge);
  const widths = [baseScale, baseScale * 0.9, baseScale * 0.8];
  const qualities = [initialQuality, 76, 70, 64];

  let lastOutput: Buffer | null = null;
  for (const scale of widths) {
    const width = Math.max(1, Math.round(metadata.width * scale));
    const height = Math.max(1, Math.round(metadata.height * scale));

    for (const quality of qualities) {
      const output = await sharp(input, { animated: true })
        .resize({
          width,
          height,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toBuffer();
      lastOutput = output;

      if (output.byteLength <= maxBytes) {
        return output;
      }
    }
  }

  if (!lastOutput) {
    throw new Error("Image conversion did not produce output");
  }
  throw new Error(`Converted image exceeds ${maxBytes} bytes`);
}
