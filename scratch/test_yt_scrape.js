async function test() {
  const query = "taylor swift style";
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  
  console.log("Searching YouTube for:", query);
  try {
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    console.log("Status:", response.status);
    if (response.ok) {
      const html = await response.text();
      const regex = /"videoId":"([^"]+)"/g;
      let match;
      const videoIds = [];
      while ((match = regex.exec(html)) !== null && videoIds.length < 5) {
        if (!videoIds.includes(match[1])) {
          videoIds.push(match[1]);
        }
      }
      console.log("Scraped Video IDs:", videoIds);
    } else {
      console.log("Error text:", await response.text());
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
test();
