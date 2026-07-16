async function test() {
  const videoId = "-CmadmM5cOk"; // Taylor Swift - Style
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const api = "https://api.cobalt.liubquanti.click/";
  
  console.log("POSTing conversion request to:", api);
  try {
    const response = await fetch(api, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: youtubeUrl,
        audioFormat: "mp3",
        audioBitrate: "128"
      })
    });
    
    console.log("Status:", response.status);
    if (response.ok) {
      const data = await response.json();
      console.log("Response data:", data);
      if (data.url) {
        console.log("SUCCESS! Direct MP3 URL:", data.url);
      }
    } else {
      console.log("Error text:", await response.text());
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
test();
