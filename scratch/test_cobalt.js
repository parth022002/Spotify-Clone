async function test() {
  const videoId = "-CmadmM5cOk"; // Taylor Swift - Style
  const url = "https://api.cobalt.tools/api/json";
  
  console.log("Requesting audio stream from Cobalt for video:", videoId);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        isAudioOnly: true,
        aFormat: "mp3"
      })
    });
    
    console.log("Status:", response.status);
    if (response.ok) {
      const data = await response.json();
      console.log("Response data:", data);
    } else {
      console.log("Error text:", await response.text());
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
test();
