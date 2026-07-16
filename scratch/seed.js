const { PrismaClient } = require("../libs/generated-client");
const db = new PrismaClient();

const SONGS = [
  {
    title: "Acoustic Breeze",
    author: "Hans Zimmer",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    image_path: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Creative Minds",
    author: "Daft Punk",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    image_path: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Summer Chill",
    author: "Lofi Girl",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    image_path: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Lofi Dreamer",
    author: "Alan Walker",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    image_path: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Synthwave Pulse",
    author: "Deadmau5",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    image_path: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Neon Horizon",
    author: "Kaskade",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    image_path: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Midnight Drive",
    author: "Marshmello",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    image_path: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Cyberpunk City",
    author: "Martin Garrix",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    image_path: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Starlight Voyage",
    author: "Avicii",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    image_path: "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Solar Wind",
    author: "Kygo",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    image_path: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Future Retro",
    author: "Calvin Harris",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    image_path: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Echo Chamber",
    author: "David Guetta",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    image_path: "https://images.unsplash.com/photo-1482440308425-276ad0f28b19?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Velocity Boost",
    author: "Swedish House Mafia",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    image_path: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Cloud Walker",
    author: "Tiesto",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    image_path: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Digital Rain",
    author: "Skrillex",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    image_path: "https://images.unsplash.com/photo-1504509546545-e000b4a62425?q=80&w=300&h=300&fit=crop",
  },
  {
    title: "Ambient Bliss",
    author: "Zedd",
    song_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    image_path: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=300&h=300&fit=crop",
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
