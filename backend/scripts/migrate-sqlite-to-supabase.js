require('dotenv').config();

const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const supabase = require('../supabase/client');

const sqlitePath = process.env.SQLITE_PATH || path.join(__dirname, '..', 'database', 'sports_management.db');
const truncateBeforeMigrate = process.env.MIGRATION_TRUNCATE !== 'false';

function readAllFromSqlite(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

async function insertStudentWithMap(student, map) {
  const payload = {
    student_id: student.student_id,
    name: student.name,
    roll_no: student.roll_no,
    class: student.class,
    phone: student.phone,
    created_at: student.created_at
  };

  const { data, error } = await supabase
    .from('students')
    .insert([payload])
    .select('id')
    .single();

  if (error) {
    throw new Error(`Students migration failed for roll ${student.roll_no}: ${error.message}`);
  }

  map.set(Number(student.id), Number(data.id));
}

async function insertItemWithMap(item, map) {
  const payload = {
    name: item.name,
    category: item.category,
    total_quantity: item.total_quantity,
    available_quantity: item.available_quantity,
    created_at: item.created_at
  };

  const { data, error } = await supabase
    .from('items')
    .insert([payload])
    .select('id')
    .single();

  if (error) {
    throw new Error(`Items migration failed for item ${item.name}: ${error.message}`);
  }

  map.set(Number(item.id), Number(data.id));
}

async function insertTransactionWithMap(transaction, studentMap, itemMap) {
  const mappedStudentId = studentMap.get(Number(transaction.student_id));
  const mappedItemId = itemMap.get(Number(transaction.item_id));

  if (!mappedStudentId || !mappedItemId) {
    throw new Error(`Missing mapped ids for transaction ${transaction.id}`);
  }

  const payload = {
    student_id: mappedStudentId,
    item_id: mappedItemId,
    quantity: Number(transaction.quantity),
    issue_date: transaction.issue_date,
    return_date: transaction.return_date,
    status: transaction.status,
    created_at: transaction.created_at
  };

  const { error } = await supabase
    .from('transactions')
    .insert([payload]);

  if (error) {
    throw new Error(`Transactions migration failed for transaction ${transaction.id}: ${error.message}`);
  }
}

async function truncateSupabaseTables() {
  const { error: txError } = await supabase.from('transactions').delete().neq('id', 0);
  if (txError) {
    throw new Error(`Failed to clear transactions: ${txError.message}`);
  }

  const { error: itemError } = await supabase.from('items').delete().neq('id', 0);
  if (itemError) {
    throw new Error(`Failed to clear items: ${itemError.message}`);
  }

  const { error: studentError } = await supabase.from('students').delete().neq('id', 0);
  if (studentError) {
    throw new Error(`Failed to clear students: ${studentError.message}`);
  }
}

async function main() {
  console.log(`Reading SQLite database from: ${sqlitePath}`);

  const sqliteDb = new sqlite3.Database(sqlitePath);

  try {
    const [students, items, transactions] = await Promise.all([
      readAllFromSqlite(sqliteDb, 'SELECT * FROM students ORDER BY id ASC'),
      readAllFromSqlite(sqliteDb, 'SELECT * FROM items ORDER BY id ASC'),
      readAllFromSqlite(sqliteDb, 'SELECT * FROM transactions ORDER BY id ASC')
    ]);

    console.log(`Found ${students.length} students, ${items.length} items, ${transactions.length} transactions in SQLite.`);

    if (truncateBeforeMigrate) {
      console.log('Clearing Supabase tables before migration...');
      await truncateSupabaseTables();
    }

    const studentMap = new Map();
    const itemMap = new Map();

    for (const student of students) {
      await insertStudentWithMap(student, studentMap);
    }

    for (const item of items) {
      await insertItemWithMap(item, itemMap);
    }

    for (const transaction of transactions) {
      await insertTransactionWithMap(transaction, studentMap, itemMap);
    }

    console.log('Migration completed successfully.');
    console.log(`Migrated students: ${students.length}`);
    console.log(`Migrated items: ${items.length}`);
    console.log(`Migrated transactions: ${transactions.length}`);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    sqliteDb.close();
  }
}

main();
