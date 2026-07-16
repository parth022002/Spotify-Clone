async function test() {
  const query = "taylor swift style";
  
  // Stable Invidious instance nodes
  const nodes = [
    "https://invidious.projectsegfau.lt",
    "https://yewtu.be",
    "https://inv.tux.im",
    "https://invidious.nerdvpn.de"
  ];
  
  for (const node of nodes) {
    console.log(`\nTrying Invidious node: ${node}...`);
    try {
      // 1. Search for video
      const searchUrl = `${node}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
      console.log("  Searching URL:", searchUrl);
      const searchRes = await fetch(searchUrl);
      
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        console.log("  Search results count:", searchData?.length);
        const firstVideo = searchData?.[0];
        
        if (firstVideo && firstVideo.videoId) {
          const videoId = firstVideo.videoId;
          console.log(`  Found video: "${firstVideo.title}" (${videoId})`);
          
          // 2. Fetch video streaming info
          const videoUrl = `${node}/api/v1/videos/${videoId}`;
          console.log("  Fetching video info:", videoUrl);
          const videoRes = await fetch(videoUrl);
          
          if (videoRes.ok) {
            const videoData = await videoRes.json();
            const adaptive = videoData.adaptiveFormats || [];
            
            // Find audio formats (typically type begins with audio/ or container is m4a/webm)
            const audioStreams = adaptive.filter(f => 
              f.type?.startsWith("audio/") || 
              f.container === "m4a" || 
              f.mimeType?.startsWith("audio/")
            );
            
            console.log("  Audio streams found:", audioStreams.length);
            if (audioStreams.length > 0) {
              // Prefer m4a/aac for standard browser/Howler compatibility
              const preferred = audioStreams.find(s => s.container === "m4a") || audioStreams[0];
              console.log("  Selected Stream URL:", preferred.url);
              console.log("  Bitrate:", preferred.bitrate);
              console.log("  SUCCESS!");
              return; // stop execution as we succeeded!
            }
          } else {
            console.log("  Video info status error:", videoRes.status);
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
