const express = require('express');
const router = express.Router();
const supabase = require('../supabase/client');

const normalizeDateTimeValue = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
};

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

const mapTransactionsWithRelations = (transactions, studentsById, itemsById) => {
  return (transactions || []).map((transaction) => {
    const student = studentsById[transaction.student_id] || {};
    const item = itemsById[transaction.item_id] || {};

    return {
      id: transaction.id,
      student_id: transaction.student_id,
      item_id: transaction.item_id,
      quantity: transaction.quantity,
      issue_date: transaction.issue_date,
      return_date: transaction.return_date,
      status: transaction.status,
      student_name: student.name || null,
      roll_no: student.roll_no || null,
      student_code: student.student_id || null,
      item_name: item.name || null,
      category: item.category || null
    };
  });
};

const fetchMappedTransactions = async (filter = {}) => {
  let query = supabase
    .from('transactions')
    .select('id,student_id,item_id,quantity,issue_date,return_date,status')
    .order('issue_date', { ascending: false });

  if (filter.status) {
    query = query.eq('status', filter.status);
  }

  if (filter.student_id) {
    query = query.eq('student_id', filter.student_id);
  }

  const { data: transactions, error: txError } = await query;

  if (txError) {
    throw txError;
  }

  if (!transactions || transactions.length === 0) {
    return [];
  }

  const studentIds = [...new Set(transactions.map((tx) => tx.student_id))];
  const itemIds = [...new Set(transactions.map((tx) => tx.item_id))];

  const [{ data: students, error: studentsError }, { data: items, error: itemsError }] = await Promise.all([
    supabase.from('students').select('id,name,roll_no,student_id').in('id', studentIds),
    supabase.from('items').select('id,name,category').in('id', itemIds)
  ]);

  if (studentsError) {
    throw studentsError;
  }

  if (itemsError) {
    throw itemsError;
  }

  const studentsById = Object.fromEntries((students || []).map((s) => [s.id, s]));
  const itemsById = Object.fromEntries((items || []).map((i) => [i.id, i]));

  return mapTransactionsWithRelations(transactions, studentsById, itemsById);
};

router.get('/', async (req, res) => {
  try {
    const rows = await fetchMappedTransactions();
    res.json(rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/issued', async (req, res) => {
  try {
    const rows = await fetchMappedTransactions({ status: 'issued' });
    const trimmed = rows.map((row) => ({
      id: row.id,
      student_id: row.student_id,
      item_id: row.item_id,
      quantity: row.quantity,
      issue_date: row.issue_date,
      status: row.status,
      student_name: row.student_name,
      roll_no: row.roll_no,
      student_code: row.student_code,
      item_name: row.item_name,
      category: row.category,
      return_date: row.return_date
    }));
    res.json(trimmed);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/issue', async (req, res) => {
  const { student_id, item_id, quantity, issue_date, expected_return_date } = req.body;

  if (!student_id || !item_id || !quantity || !issue_date) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const studentIdNum = Number(student_id);
  const itemIdNum = Number(item_id);
  const quantityNum = Number(quantity);
  const normalizedIssueDate = normalizeDateTimeValue(issue_date);
  const normalizedExpectedReturnDate = normalizeDateTimeValue(expected_return_date);

  if (!isPositiveInteger(studentIdNum) || !isPositiveInteger(itemIdNum)) {
    res.status(400).json({ error: 'Invalid student or item id' });
    return;
  }

  if (!isPositiveInteger(quantityNum)) {
    res.status(400).json({ error: 'Quantity must be a whole number greater than 0' });
    return;
  }

  if (!normalizedIssueDate) {
    res.status(400).json({ error: 'Invalid issue date/time format' });
    return;
  }

  const { data: item, error: itemError } = await supabase
    .from('items')
    .select('id,available_quantity')
    .eq('id', itemIdNum)
    .maybeSingle();

  if (itemError || !item) {
    res.status(400).json({ error: 'Item not found' });
    return;
  }

  if (Number(item.available_quantity) < quantityNum) {
    res.status(400).json({ error: 'Insufficient quantity available' });
    return;
  }

  const { data: inserted, error: insertError } = await supabase
    .from('transactions')
    .insert([
      {
        student_id: studentIdNum,
        item_id: itemIdNum,
        quantity: quantityNum,
        issue_date: normalizedIssueDate,
        return_date: normalizedExpectedReturnDate,
        status: 'issued'
      }
    ])
    .select('id')
    .single();

  if (insertError) {
    res.status(400).json({ error: insertError.message });
    return;
  }

  const { error: updateError } = await supabase
    .from('items')
    .update({
      available_quantity: Number(item.available_quantity) - quantityNum
    })
    .eq('id', itemIdNum);

  if (updateError) {
    res.status(400).json({ error: updateError.message });
    return;
  }

  res.json({
    id: inserted.id,
    student_id: studentIdNum,
    item_id: itemIdNum,
    quantity: quantityNum,
    status: 'issued'
  });
});

router.post('/return', async (req, res) => {
  const { transaction_id, return_date } = req.body;

  if (!transaction_id || !return_date) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const transactionIdNum = Number(transaction_id);
  const normalizedReturnDate = normalizeDateTimeValue(return_date);

  if (!isPositiveInteger(transactionIdNum)) {
    res.status(400).json({ error: 'Invalid transaction id' });
    return;
  }

  if (!normalizedReturnDate) {
    res.status(400).json({ error: 'Invalid return date/time format' });
    return;
  }

  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .select('id,quantity,item_id,status')
    .eq('id', transactionIdNum)
    .eq('status', 'issued')
    .maybeSingle();

  if (txError || !transaction) {
    res.status(400).json({ error: 'Transaction not found or already returned' });
    return;
  }

  const { error: updateTransError } = await supabase
    .from('transactions')
    .update({
      return_date: normalizedReturnDate,
      status: 'returned'
    })
    .eq('id', transactionIdNum);

  if (updateTransError) {
    res.status(400).json({ error: updateTransError.message });
    return;
  }

  const { data: item, error: itemError } = await supabase
    .from('items')
    .select('id,total_quantity,available_quantity')
    .eq('id', transaction.item_id)
    .maybeSingle();

  if (itemError || !item) {
    res.status(400).json({ error: 'Related item not found' });
    return;
  }

  const updatedAvailable = Number(item.available_quantity) + Number(transaction.quantity);

  if (updatedAvailable > Number(item.total_quantity)) {
    res.status(400).json({ error: 'Return would make available quantity exceed total quantity. Please fix item data first.' });
    return;
  }

  const { error: updateItemError } = await supabase
    .from('items')
    .update({
      available_quantity: updatedAvailable
    })
    .eq('id', transaction.item_id);

  if (updateItemError) {
    res.status(400).json({ error: updateItemError.message });
    return;
  }

  res.json({ message: 'Item returned successfully' });
});

router.get('/history/:student_id', async (req, res) => {
  const studentIdNum = Number(req.params.student_id);

  try {
    const rows = await fetchMappedTransactions({ student_id: studentIdNum });
    const history = rows.map((row) => ({
      id: row.id,
      quantity: row.quantity,
      issue_date: row.issue_date,
      return_date: row.return_date,
      status: row.status,
      item_name: row.item_name,
      category: row.category
    }));
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
