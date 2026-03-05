import express from 'express';
import dotenv from 'dotenv';
import Routes from './routes/routes.js';
import cors from 'cors';
import path from 'path';
import { db } from './config/database.js';

import { reminder_48hrs } from './send-mail/(cron)/reminder_48hrs.js';
import { reminder_72hrs } from './send-mail/(cron)/reminder_72hrs.js';
import { reminder_5days } from './send-mail/reminder_5_days_if_phase3_not_reviewed_user.js';
import { reminder_10days } from './send-mail/reminder_10_days_if_phase3_not_reviewed_user.js';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve /images globally
const imagesPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(imagesPath));
app.use('/uploadAdminDocs', express.static(path.join(process.cwd(), 'uploadAdminDocs')));
app.use('/uploadUserDocs', express.static(path.join(process.cwd(), 'uploadUserDocs')));
const corsHeaders = {
"Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, ngrok-skip-browser-warning",
};

app.use((req, res, next) => {
  res.set(corsHeaders);
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});


// Increase payload size for image uploads
app.use(express.json({ limit: '500mb' }));

// Connect to MongoDB and start server
db.connect().then(() => {
  app.use('/api', Routes);
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Start reminder services after server is ready
    reminder_48hrs();
    reminder_72hrs();
    // reminder_5days();
    // reminder_10days();
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
