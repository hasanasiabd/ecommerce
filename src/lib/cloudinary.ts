// FILE: src/lib/cloudinary.ts

import { v2 as cloudinary } from "cloudinary";

const cloudinaryUrl =
  process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) {
  throw new Error(
    "CLOUDINARY_URL is not configured."
  );
}

cloudinary.config(
  cloudinaryUrl
);

export default cloudinary;