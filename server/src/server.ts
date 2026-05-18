import app from './app.ts';
import logger from './config/logger.ts';

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  logger.info(`Server is running at http://localhost:${PORT}`);
});
