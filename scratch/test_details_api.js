async function test() {
  const songId = "itunes-1273954642";
  const url = `http://localhost:3000/api/songs/details?id=${songId}`;
  console.log("Fetching local details:", url);
  try {
    const response = await fetch(url);
    console.log("Status:", response.status);
    console.log("Headers:", response.headers.get("content-type"));
    const text = await response.text();
    console.log("Response Body:", text);
  } catch (error) {
    console.error("Local fetch error:", error);
  }
}
test();
