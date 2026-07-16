async function test() {
  const trackId = "1273954642";
  const url = `https://itunes.apple.com/lookup?id=${trackId}`;
  console.log("Fetching:", url);
  try {
    const response = await fetch(url);
    console.log("Status:", response.status);
    if (response.ok) {
      const data = await response.json();
      console.log("Data results length:", data.results?.length);
      console.log("Track:", data.results?.[0]);
    } else {
      console.log("Response text:", await response.text());
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
test();
