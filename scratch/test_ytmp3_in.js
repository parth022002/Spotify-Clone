async function test() {
  const videoId = "-CmadmM5cOk"; // Taylor Swift - Style
  const url = `https://api.youtube-mp3.org.in/api/single/audio?url=https://www.youtube.com/watch?v=${videoId}`;
  
  console.log("Fetching audio link from youtube-mp3.org.in for:", videoId);
  try {
    const response = await fetch(url);
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
