async function resolveFullSong(artist, title) {
  const query = `${artist} - ${title}`;
  console.log("Resolving full song for:", query);
  
  // 1. Scrape YouTube for Video ID
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const searchRes = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    if (!searchRes.ok) throw new Error("YouTube search failed");
    
    const html = await searchRes.text();
    const regex = /"videoId":"([^"]+)"/;
    const match = html.match(regex);
    const videoId = match ? match[1] : null;
    
    if (!videoId) throw new Error("No YouTube video ID found");
    console.log("  Found Video ID:", videoId);
    
    // 2. Call Cobalt API for direct stream
    const api = "https://api.cobalt.liubquanti.click/";
    const cobaltRes = await fetch(api, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        audioFormat: "mp3",
        audioBitrate: "128"
      })
    });
    
    if (cobaltRes.ok) {
      const data = await cobaltRes.json();
      if (data.url) {
        console.log("  SUCCESS! Full-length stream URL:", data.url);
        return data.url;
      }
    }
    throw new Error("Cobalt conversion failed");
  } catch (err) {
    console.error("  Error in resolution:", err.message);
    return null;
  }
}

async function run() {
  const url = await resolveFullSong("Taylor Swift", "Style");
  console.log("Final Resolved URL:", url ? "YES" : "NO");
}
run();
