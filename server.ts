
import express from "express";
import { z } from 'zod';

//express() creates the app.
const app = express();
const PORT = 3000;
//Middleware for JSON parsing.
app.use(express.json()); 


//Phase 1 - Minimal server & ping

//app.get() defines a GET route.
//res.json() sends a JSON response.
app.get("/ping", (req, res) => {
    res.json( {message: "pong"});
});




//Phase 2 - Fetch random user



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


//Phase 3: User POST Route

//Successful test data
const user = { name: "Alice", age: 30, email: "SanDra@test.com"};

const UserSchema = z.object({

  //Name length, age optional with default 28.
  name: z.string().min(3).max(12),
  age: z.number().min(18).max(100).optional().default(28),
  email: z.string().email().toLowerCase(),  // This corrects email to lowercase.
});

app.post('/users', (req, res) => {
  const newUser = UserSchema.safeParse(req.body);
  if (!newUser.success) {
    return res.status(400).json({ error: 'Validation failed', details: newUser.error });
  } else {
    res.status(201).json(newUser.data);  // Returns only the validated data
  }
});

// Start the server (only use once at the end)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});