async function test() {
  const clientId = "709fa152";
  const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=5&namesearch=love`;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      console.log("Full headers response:", data.headers);
    }
  } catch (err) {
    console.error(err);
  }
}
test();
