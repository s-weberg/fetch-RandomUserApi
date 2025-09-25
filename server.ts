//Phase 1 - Minimal server & ping

import express from "express";

//express() creates the app.
const app = express();
const PORT = 3000;

//app.get() defines a GET route.
//res.json() sends a JSON response.
app.get("/ping", (req, res) => {
    res.json( {message: "pong"});
});

//app.listen() starts the server.
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



//Phase 2 - Fetch random user

import { z } from 'zod';

// Schema for the RandomUser API.
//z.object() and z.array() define the expected structure.
const RandomUserSchema = z.object({
  results: z.array(
    z.object({
      name: z.object({
        title: z.string(),
        first: z.string(),
        last: z.string(),
      }),
      location: z.object({
        country: z.string(),
      }),
    })
  ),
});

app.get('/random-person', async (req, res) => {
  try {
    const response = await fetch('https://randomuser.me/api/');
    const data = await response.json();

    // Validate with Zod
    //safeParse() checks data, without throwing errors.
    const parsedData = RandomUserSchema.safeParse(data);
    if (!parsedData.success) {
      return res.status(500).json({ error: 'Invalid data from API', 
        details: parsedData.error });
    }

    const user = parsedData.data.results[0];
    const fullName = `${user.name.title} ${user.name.first} ${user.name.last}`;

    res.json({
      fullName,
      country: user.location.country,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});