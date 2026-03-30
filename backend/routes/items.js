const express = require('express');
const router = express.Router();
const supabase = require('../supabase/client');

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data || []);
});

router.get('/search', async (req, res) => {
  const searchQuery = (req.query.query || '').trim();

  if (!searchQuery) {
    res.json([]);
    return;
  }

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data || []);
});

router.get('/stats/overview', async (req, res) => {
  const { data, error } = await supabase
    .from('items')
    .select('total_quantity,available_quantity');

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  const totals = (data || []).reduce(
    (acc, item) => {
      acc.totalItems += Number(item.total_quantity || 0);
      acc.availableItems += Number(item.available_quantity || 0);
      return acc;
    },
    { totalItems: 0, availableItems: 0 }
  );

  res.json({
    totalItems: totals.totalItems,
    availableItems: totals.availableItems,
    issuedItems: totals.totalItems - totals.availableItems
  });
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (!data) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  res.json(data);
});

router.post('/', async (req, res) => {
  const { name, category, total_quantity } = req.body;

  if (!name || !category || !total_quantity) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const parsedTotal = Number(total_quantity);

  const { data, error } = await supabase
    .from('items')
    .insert([
      {
        name,
        category,
        total_quantity: parsedTotal,
        available_quantity: parsedTotal
      }
    ])
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, category, total_quantity } = req.body;

  const { data: existing, error: getError } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (getError) {
    res.status(400).json({ error: getError.message });
    return;
  }

  if (!existing) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const newTotal = Number(total_quantity);
  const issuedCount = Number(existing.total_quantity) - Number(existing.available_quantity);

  if (newTotal < issuedCount) {
    res.status(400).json({ error: 'Total quantity cannot be less than currently issued quantity' });
    return;
  }

  const newAvailable = newTotal - issuedCount;

  const { error } = await supabase
    .from('items')
    .update({
      name,
      category,
      total_quantity: newTotal,
      available_quantity: newAvailable
    })
    .eq('id', id);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ message: 'Item updated successfully' });
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const { data: openTransactions, error: checkError } = await supabase
    .from('transactions')
    .select('id')
    .eq('item_id', id)
    .eq('status', 'issued')
    .limit(1);

  if (checkError) {
    res.status(400).json({ error: checkError.message });
    return;
  }

  if (openTransactions && openTransactions.length > 0) {
    res.status(400).json({ error: 'Cannot delete item with active transactions' });
    return;
  }

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ message: 'Item deleted successfully' });
});

module.exports = router;
