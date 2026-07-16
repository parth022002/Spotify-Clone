async function test() {
  const query = "chill";
  // Jamendo developer client ID for testing (default public client_id)
  const clientId = "56d30c95";
  const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=5&namesearch=${encodeURIComponent(query)}&include=musicinfo`;
  
  console.log("Fetching Jamendo tracks for:", query);
  try {
    const response = await fetch(url);
    console.log("Status:", response.status);
    if (response.ok) {
      const data = await response.json();
      console.log("Results count:", data.results?.length);
      if (data.results && data.results.length > 0) {
        data.results.forEach((track, i) => {
          console.log(`\n[Track ${i + 1}]`);
          console.log("  Title:", track.name);
          console.log("  Artist:", track.artist_name);
          console.log("  Audio URL:", track.audio);
          console.log("  Duration (sec):", track.duration);
          console.log("  Image Cover:", track.image);
        });
      }
    } else {
      console.log("Error text:", await response.text());
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
test();
