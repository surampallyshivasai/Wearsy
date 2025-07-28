import express from 'express';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 8080;
const dbPath = join(__dirname, 'server/shopping_site.db');

app.use(express.json());

// Database connection
const db = new sqlite3.Database(dbPath);

// Get all tables
app.get('/api/tables', (req, res) => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(tables.map(t => t.name));
    }
  });
});

// Get table data
app.get('/api/table/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  
  db.all(`SELECT * FROM ${tableName} LIMIT 50`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ rows, total: rows.length });
    }
  });
});

// Run custom query
app.post('/api/query', (req, res) => {
  const { sql } = req.body;
  
  if (!sql) {
    res.status(400).json({ error: 'SQL query required' });
    return;
  }
  
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ rows, total: rows.length });
    }
  });
});

// Serve simple HTML
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Database Viewer</title>
    <style>
        body { font-family: Arial; background: #1a1a1a; color: white; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #00d4ff; text-align: center; }
        .table-list { display: grid; grid-template-columns: repeat(auto-fit, 200px); gap: 15px; margin: 20px 0; }
        .table-btn { padding: 10px; background: #333; border: 1px solid #555; color: white; cursor: pointer; }
        .table-btn:hover { background: #00d4ff; color: black; }
        .query-section { margin: 20px 0; }
        textarea { width: 100%; height: 100px; background: #333; color: white; border: 1px solid #555; padding: 10px; }
        button { padding: 10px 20px; background: #00d4ff; color: black; border: none; cursor: pointer; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 8px; border: 1px solid #555; text-align: left; }
        th { background: #333; }
        .error { color: #ff4444; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗄️ Shopping Site Database Viewer</h1>
        
        <div class="table-list" id="tables"></div>
        
        <div class="query-section">
            <h3>Custom SQL Query:</h3>
            <textarea id="sqlQuery" placeholder="Enter SQL query..."></textarea>
            <button onclick="runQuery()">Run Query</button>
        </div>
        
        <div id="results"></div>
    </div>

    <script>
        // Load tables
        fetch('/api/tables')
            .then(res => res.json())
            .then(tables => {
                const tablesDiv = document.getElementById('tables');
                tables.forEach(table => {
                    const btn = document.createElement('button');
                    btn.className = 'table-btn';
                    btn.textContent = table;
                    btn.onclick = () => loadTable(table);
                    tablesDiv.appendChild(btn);
                });
            });

        function loadTable(tableName) {
            fetch(\`/api/table/\${tableName}\`)
                .then(res => res.json())
                .then(data => displayResults(data, \`Table: \${tableName}\`))
                .catch(err => displayError(err.message));
        }

        function runQuery() {
            const sql = document.getElementById('sqlQuery').value;
            if (!sql) return;

            fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) displayError(data.error);
                else displayResults(data, 'Query Results');
            })
            .catch(err => displayError(err.message));
        }

        function displayResults(data, title) {
            const results = document.getElementById('results');
            
            if (!data.rows || data.rows.length === 0) {
                results.innerHTML = \`<h3>\${title}</h3><p>No results</p>\`;
                return;
            }

            const columns = Object.keys(data.rows[0]);
            let html = \`<h3>\${title} (\${data.total} rows)</h3><table><tr>\`;
            
            columns.forEach(col => html += \`<th>\${col}</th>\`);
            html += '</tr>';
            
            data.rows.forEach(row => {
                html += '<tr>';
                columns.forEach(col => html += \`<td>\${row[col] || ''}</td>\`);
                html += '</tr>';
            });
            
            html += '</table>';
            results.innerHTML = html;
        }

        function displayError(message) {
            document.getElementById('results').innerHTML = \`<div class="error">Error: \${message}</div>\`;
        }
    </script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`🌐 Database Web Viewer: http://localhost:${PORT}`);
  console.log(`📁 Database: ${dbPath}`);
}); 