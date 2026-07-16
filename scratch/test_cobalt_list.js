async function test() {
  const url = "https://instances.cobalt.best/api/v1/instances";
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    if (res.ok) {
      const data = await res.json();
      console.log("Is array:", Array.isArray(data));
      if (Array.isArray(data)) {
        // filter active and working youtube instances
        const working = data.filter(inst => inst.status === "up" && inst.services?.youtube !== false);
        console.log("Working count:", working.length);
        working.slice(0, 10).forEach(inst => {
          console.log(`- URL: ${inst.url}, Version: ${inst.version}, Trust: ${inst.trustScore}`);
        });
      } else {
        console.log("Keys:", Object.keys(data));
        if (data.instances) {
          console.log("Instances count:", data.instances.length);
          data.instances.slice(0, 10).forEach(inst => {
            console.log(`- URL: ${inst.url}, Version: ${inst.version}`);
          });
        }
      }
    } else {
      console.log("Error text:", await res.text());
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
test();
