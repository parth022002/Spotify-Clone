async function test() {
  const query = "taylor swift style";
  
  // Public Piped API instance nodes
  const nodes = [
    "https://api.piped.yt",
    "https://pipedapi.kavin.rocks",
    "https://piped-api.lunar.icu",
    "https://piped-api.us.projectsegfau.lt"
  ];
  
  for (const node of nodes) {
    console.log(`\nTrying Piped node: ${node}...`);
    try {
      // 1. Search for track
      const searchUrl = `${node}/search?q=${encodeURIComponent(query)}&filter=videos`;
      console.log("  Searching URL:", searchUrl);
      const searchRes = await fetch(searchUrl);
      
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const results = searchData.items || [];
        console.log("  Search results count:", results.length);
        const firstVideo = results[0];
        
        if (firstVideo && firstVideo.url) {
          // Extract videoId from URL (e.g. "/watch?v=VIDEO_ID")
          const videoId = firstVideo.url.split("v=")[1];
          console.log(`  Found video: "${firstVideo.title}" (${videoId})`);
          
          // 2. Fetch video streams info
          const streamUrl = `${node}/streams/${videoId}`;
          console.log("  Fetching streams:", streamUrl);
          const streamRes = await fetch(streamUrl);
          
          if (streamRes.ok) {
            const streamData = await streamRes.json();
            const audioStreams = streamData.audioStreams || [];
            console.log("  Audio streams found:", audioStreams.length);
            if (audioStreams.length > 0) {
              const preferred = audioStreams.find(s => s.format === "M4A") || audioStreams[0];
              console.log("  Selected Stream URL:", preferred.url);
              console.log("  Codec/Format:", preferred.format);
              console.log("  Bitrate:", preferred.bitrate);
              console.log("  SUCCESS!");
              return;
            }
          } else {
            console.log("  Stream info status error:", streamRes.status);
          }
        }
      } else {
        console.log("  Search status error:", searchRes.status);
      }
    } catch (err) {
      console.log("  Error on node:", err.message);
    }
  }
}
test();
