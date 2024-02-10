// basic server

import express from 'express';
import routes from './routes';

const app = express();
const PORT = 5000 || process.env.PORT;

app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
