async function test() {
  const url = "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/03/d7/c9/03d7c999-7c5a-03bd-c160-ec6352d32b0c/mzaf_3991893478027170793.plus.aac.p.m4a";
  console.log("Checking CORS headers for:", url);
  try {
    const response = await fetch(url, { method: "HEAD" });
    console.log("Status:", response.status);
    console.log("Headers:");
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
test();
