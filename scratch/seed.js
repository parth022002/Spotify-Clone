const { PrismaClient } = require("../libs/generated-client");
const db = new PrismaClient();

const SONGS = [
  {
    title: "Acoustic Breeze",
    author: "Benjamin Tissot",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    image_path: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&h=600&fit=crop",
  },
  {
    title: "Creative Minds",
    author: "Bensound",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    image_path: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=600&h=600&fit=crop",
  },
  {
    title: "Summer Chill",
    author: "Royalty Free Music",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    image_path: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&h=600&fit=crop",
  },
  {
    title: "Lofi Dreamer",
    author: "Lofi Beats",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    image_path: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&h=600&fit=crop",
  },
  {
    title: "Synthwave Pulse",
    author: "Retro Beats",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    image_path: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&h=600&fit=crop",
  }
];

async function seed() {
  try {
    console.log("Seeding database...");

    // Create system user if it doesn't exist
    const systemUserId = "system-user-account";
    const systemUser = await db.user.upsert({
      where: { id: systemUserId },
      update: {},
      create: {
        id: systemUserId,
        email: "system@spotify.com",
        full_name: "Spotify System DJ",
      },
    });

    console.log("System user confirmed:", systemUser.email);

    // Seed songs
    for (const song of SONGS) {
      const existing = await db.song.findFirst({
        where: { title: song.title, author: song.author }
      });

      if (!existing) {
        const newSong = await db.song.create({
          data: {
            user_id: systemUserId,
            title: song.title,
            author: song.author,
            song_path: song.song_path,
            image_path: song.image_path,
          }
        });
        console.log(`Successfully seeded song: "${newSong.title}" by ${newSong.author}`);
      } else {
        console.log(`Song "${song.title}" already exists in database.`);
      }
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await db.$disconnect();
  }
}

seed();
