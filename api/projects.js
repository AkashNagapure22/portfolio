export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const projects = [
    {
      id: "CASE_01",
      title: "Windows Autopatch A-to-Z",
      description: "Enterprise deployment framework for automated OS updates.",
      image: "/autopatch-thumbnail.png", // Ensure image is in /public folder
      link: "/Autopatchblog.html"
    },
    {
      id: "CASE_02",
      title: "Food Blog",
      description: "A dynamic food showcase built with Neon.",
      image: "/food-thumbnail.png",
      link: "/food.html"
    },
    {
      id: "CASE_03",
      title: "Coins Project",
      description: "Dynamic tracking project for digital assets.",
      image: "/coins-thumbnail.png",
      link: "/coins.html"
    },
    {
      id: "CASE_04",
      title: "Game Blog",
      description: "Interactive gaming setup and technical documentation.",
      image: "/game-thumbnail.png",
      link: "/game.html"
    }
  ];

  return res.status(200).json(projects);
}
