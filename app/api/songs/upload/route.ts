import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const songFile = formData.get("song") as File;
    const imageFile = formData.get("image") as File;

    if (!songFile || !imageFile) {
      return new NextResponse("Missing files", { status: 400 });
    }

    // Prepare directories
    const publicDir = path.join(process.cwd(), "public");
    const songsDir = path.join(publicDir, "uploads", "songs");
    const imagesDir = path.join(publicDir, "uploads", "images");

    // Ensure directories exist
    await fs.mkdir(songsDir, { recursive: true });
    await fs.mkdir(imagesDir, { recursive: true });

    // Generate unique names
    const songExt = path.extname(songFile.name) || ".mp3";
    const imageExt = path.extname(imageFile.name) || ".png";
    const songName = `song-${crypto.randomUUID()}${songExt}`;
    const imageName = `image-${crypto.randomUUID()}${imageExt}`;

    const songPath = path.join(songsDir, songName);
    const imagePath = path.join(imagesDir, imageName);

    // Save song file
    const songBuffer = Buffer.from(await songFile.arrayBuffer());
    await fs.writeFile(songPath, songBuffer);

    // Save image file
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    await fs.writeFile(imagePath, imageBuffer);

    // Return the relative URLs served statically from the public folder
    return NextResponse.json({
      song_path: `/uploads/songs/${songName}`,
      image_path: `/uploads/images/${imageName}`,
    });

  } catch (error: any) {
    console.error("[SONG_UPLOAD_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
