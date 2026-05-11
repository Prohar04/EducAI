import { Router } from 'express';
import { getExchangeRates } from '#src/services/currencyService.ts';

const router = Router();

router.get('/rates', async (req, res) => {
  try {
    const base = (req.query.base as string) || 'USD';
    const rates = await getExchangeRates(base);
    res.json(rates);
  } catch {
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

export default router;
