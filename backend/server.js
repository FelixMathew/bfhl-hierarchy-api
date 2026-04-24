const express = require('express');
const cors = require('cors');
const { processHierarchy } = require('./engine');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const IDENTITY = {
  user_id: 'john_doe_01012000',
  email_id: 'user@example.com',
  college_roll_number: 'ROLL001',
};

app.get('/bfhl', (req, res) => {
  res.status(405).json({ status_code: 405, message: 'Method Not Allowed. Use POST.' });
});

app.post('/bfhl', (req, res) => {
  const { data } = req.body;

  if (data === undefined || data === null) {
    return res.status(400).json({
      ...IDENTITY,
      error: 'Missing required field: "data"',
      hierarchies: [],
      invalid_entries: [],
      duplicate_edges: [],
      summary: { total_trees: 0, total_cycles: 0, largest_tree_root: null },
    });
  }

  if (!Array.isArray(data)) {
    return res.status(400).json({
      ...IDENTITY,
      error: '"data" must be an array of strings',
      hierarchies: [],
      invalid_entries: [],
      duplicate_edges: [],
      summary: { total_trees: 0, total_cycles: 0, largest_tree_root: null },
    });
  }

  try {
    const result = processHierarchy(data);
    return res.status(200).json({ ...IDENTITY, ...result });
  } catch (err) {
    console.error('Processing error:', err);
    return res.status(500).json({
      ...IDENTITY,
      error: 'Internal processing error',
      hierarchies: [],
      invalid_entries: [],
      duplicate_edges: [],
      summary: { total_trees: 0, total_cycles: 0, largest_tree_root: null },
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found. Available: POST /bfhl' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Hierarchy API running at http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/bfhl\n`);
});
