async function test() {
  const query = "chill";
  const url = `https://api-v2.hearthis.at/search?q=${encodeURIComponent(query)}&page=1&count=5`;
  
  console.log("Fetching HearThis tracks for:", query);
  try {
    const response = await fetch(url);
    console.log("Status:", response.status);
    if (response.ok) {
      const data = await response.json();
      console.log("Type of data:", typeof data);
      console.log("Keys of data:", Object.keys(data));
      console.log("Sample keys/values:", JSON.stringify(data).substring(0, 500));
    } else {
      console.log("Error text:", await response.text());
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
test();
