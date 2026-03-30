const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const supabase = require('../supabase/client');

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data || []);
});

router.get('/search', async (req, res) => {
  const query = (req.query.query || '').trim();

  if (!query) {
    res.json([]);
    return;
  }

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .or(`name.ilike.%${query}%,roll_no.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data || []);
});

router.get('/stats/count', async (req, res) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('student_id')
    .eq('status', 'issued');

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  const uniqueStudents = new Set((data || []).map((row) => row.student_id));
  res.json({ activeStudents: uniqueStudents.size });
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (!data) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  res.json(data);
});

router.post('/', async (req, res) => {
  const { name, roll_no, class: studentClass, phone } = req.body;
  const student_id = `STU-${uuidv4().slice(0, 8).toUpperCase()}`;

  if (!name || !roll_no || !studentClass || !phone) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const { data, error } = await supabase
    .from('students')
    .insert([
      {
        student_id,
        name,
        roll_no,
        class: studentClass,
        phone
      }
    ])
    .select()
    .single();

  if (error) {
    if ((error.message || '').toLowerCase().includes('duplicate')) {
      res.status(400).json({ error: 'Roll number already exists' });
      return;
    }
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, roll_no, class: studentClass, phone } = req.body;

  const { error } = await supabase
    .from('students')
    .update({
      name,
      roll_no,
      class: studentClass,
      phone
    })
    .eq('id', id);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ message: 'Student updated successfully' });
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ message: 'Student deleted successfully' });
});

router.post('/bulk/import', async (req, res) => {
  const { students } = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    res.status(400).json({ error: 'Invalid data format. Expected array of students.' });
    return;
  }

  const insertPromises = students.map(async (student, index) => {
    const { name, roll_no, class: studentClass, phone } = student;

    if (!name || !roll_no || !studentClass || !phone) {
      return { ok: false, error: `Row ${index + 1}: Missing required fields` };
    }

    const student_id = `STU-${uuidv4().slice(0, 8).toUpperCase()}`;

    const { error } = await supabase
      .from('students')
      .insert([
        {
          student_id,
          name,
          roll_no,
          class: studentClass,
          phone
        }
      ]);

    if (error) {
      return { ok: false, error: `Row ${index + 1} (${name}): ${error.message}` };
    }

    return { ok: true };
  });

  const results = await Promise.all(insertPromises);
  const successCount = results.filter((result) => result.ok).length;
  const errors = results.filter((result) => !result.ok).map((result) => result.error);

  res.json({
    message: 'Import completed',
    successCount,
    errorCount: errors.length,
    totalCount: students.length,
    errors
  });
});

module.exports = router;
