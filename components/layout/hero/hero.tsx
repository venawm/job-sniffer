"use client";
const Hero = () => {
  const handlePost = async () => {
    await fetch("/api/scraper", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          url: "https://bajratechnologies.com/jobs",
          keyword: "Technical Content Writer",
        },
        {
          url: "https://www.lftechnology.com/careers",
          keyword: "lead ai engineer",
        },
        {
          url: "https://progressivelabs.tech/vacancy",
          keyword: "software Engineer",
        },
      ]),
    });
  };

  return (
    <div>
      <div>Hero</div>
      <button onClick={handlePost}>Post</button>
    </div>
  );
};
export default Hero;
