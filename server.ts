
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



//Challenge
//Zod schema for login and registered date.
const LoginSchema = z.object({
  results: z.array(
    z.object({
      login: z.object({
        username: z.string(),
      }),
      registered: z.object({
        date: z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: 'Invalid date format',
        }),
      }),
    })
  ),
});

//Handle GET request for random-login. Fetches and return user details.

app.get('/random-login', async (req, res) => {
  try {
    console.log('Starting to get data from the random user website...'); 
    const response = await fetch('https://randomuser.me/api/'); // Fetches data from website
    console.log('Response data:', response.status); // Show if the website worked
    const data = await response.json(); 
    console.log('Data status:', JSON.stringify(data, null, 2)); // Show the full data


    const parsedData = LoginSchema.safeParse(data);
    if (!parsedData.success) {
      console.log('Validation error', parsedData.error); // Show why it failed
      return res.status(500).json({ error: 'Invalid data from API', details: parsedData.error });
    }

    // User/date info
    const user = parsedData.data.results[0];
    const registeredDate = new Date(user.registered.date); // Turn the date string into a date
    if (isNaN(registeredDate.getTime())) { //Is the date invald?
      console.log('Bad date found:', user.registered.date); // Logs invalid date
      return res.status(500).json({ error: 'Date from website is not good' });
    }
    const niceDate = registeredDate.toISOString().split('T')[0]; // Shows date as YYYY-MM-DD
    const summary = `${user.login.username} (joined on ${niceDate})`; 

    // Send back the username, date, and summary
    res.json({
      username: user.login.username,
      registeredDate: niceDate,
      summary: summary,
    });
  } catch (error) {
    console.log('Problem getting data:', error); // Log errors
    res.status(500).json({ error: 'Couldn’t get the data' }); // Retrn error message
  }
});

// Start the server (Always at the end. Only once!)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});