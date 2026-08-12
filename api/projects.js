export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const projects = [
    {
      id: "CASE_01",
      title: "Windows Autopatch A-to-Z",
      description: "Enterprise deployment framework for automated OS updates.",
      image: "/autopatch-thumbnail.png", // Ensure this path points to a valid image in public/
      link: "/Autopatchblog.html"
    }
    // Add your other original project objects here...
  ];

  return res.status(200).json(projects);
}
