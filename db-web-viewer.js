import express from 'express';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 8080;
const dbPath = join(__dirname, 'server/shopping_site.db');

app.use(express.static('public'));

// Database connection
const db = new sqlite3.Database(dbPath);

// API endpoint to get all tables
app.get('/api/tables', (req, res) => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(tables.map(t => t.name));
    }
  });
});

// API endpoint to get table data
app.get('/api/table/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  
  // Get table structure
  db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Get table data
    db.all(`SELECT * FROM ${tableName} LIMIT 100`, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({
          columns: columns.map(col => col.name),
          rows: rows,
          total: rows.length
        });
      }
    });
  });
});

// API endpoint to run custom SQL
app.post('/api/query', express.json(), (req, res) => {
  const { sql } = req.body;
  
  if (!sql || !sql.trim()) {
    res.status(400).json({ error: 'SQL query is required' });
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

// Serve the HTML interface
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🗄️ Shopping Site Database Viewer</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 100%);
            color: #fff;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        h1 {
            text-align: center;
            color: #00d4ff;
            margin-bottom: 30px;
            font-size: 2.5rem;
        }
        
        .tables-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .table-card {
            background: rgba(35, 39, 47, 0.8);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #3a3f4a;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .table-card:hover {
            border-color: #00d4ff;
            transform: translateY(-2px);
        }
        
        .table-card h3 {
            color: #00d4ff;
            margin-bottom: 10px;
        }
        
        .table-card p {
            color: #ccc;
            font-size: 0.9rem;
        }
        
        .query-section {
            background: rgba(35, 39, 47, 0.8);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            border: 1px solid #3a3f4a;
        }
        
        .query-section h2 {
            color: #00d4ff;
            margin-bottom: 15px;
        }
        
        .query-input {
            width: 100%;
            padding: 12px;
            background: #1e2127;
            border: 2px solid #3a3f4a;
            border-radius: 8px;
            color: #fff;
            font-family: monospace;
            margin-bottom: 10px;
        }
        
        .query-input:focus {
            border-color: #00d4ff;
            outline: none;
        }
        
        .btn {
            padding: 12px 24px;
            background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            background: linear-gradient(135deg, #00e6ff 0%, #00b3e6 100%);
            transform: translateY(-2px);
        }
        
        .results {
            background: rgba(35, 39, 47, 0.8);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #3a3f4a;
            max-height: 500px;
            overflow-y: auto;
        }
        
        .results h2 {
            color: #00d4ff;
            margin-bottom: 15px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        th, td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #3a3f4a;
        }
        
        th {
            background: #1e2127;
            color: #00d4ff;
            font-weight: 600;
        }
        
        tr:hover {
            background: rgba(0, 212, 255, 0.1);
        }
        
        .loading {
            text-align: center;
            color: #00d4ff;
            padding: 20px;
        }
        
        .error {
            color: #ff4d4f;
            padding: 10px;
            background: rgba(255, 77, 79, 0.1);
            border-radius: 8px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗄️ Shopping Site Database Viewer</h1>
        
        <div class="tables-grid" id="tablesGrid">
            <div class="loading">Loading tables...</div>
        </div>
        
        <div class="query-section">
            <h2>🔍 Custom SQL Query</h2>
            <textarea 
                class="query-input" 
                id="sqlQuery" 
                rows="3" 
                placeholder="Enter your SQL query here...&#10;Example: SELECT * FROM users LIMIT 5;"
            ></textarea>
            <button class="btn" onclick="runQuery()">Run Query</button>
        </div>
        
        <div class="results" id="results">
            <h2>📊 Query Results</h2>
            <p>Select a table above or run a custom query to see results.</p>
        </div>
    </div>

    <script>
        // Load tables on page load
        window.onload = function() {
            loadTables();
        };
        
        async function loadTables() {
            try {
                const response = await fetch('/api/tables');
                const tables = await response.json();
                
                const tablesGrid = document.getElementById('tablesGrid');
                tablesGrid.innerHTML = '';
                
                tables.forEach(table => {
                    const tableCard = document.createElement('div');
                    tableCard.className = 'table-card';
                    tableCard.onclick = () => loadTableData(table);
                    
                    tableCard.innerHTML = \`
                        <h3>\${table}</h3>
                        <p>Click to view data</p>
                    \`;
                    
                    tablesGrid.appendChild(tableCard);
                });
            } catch (error) {
                console.error('Error loading tables:', error);
                document.getElementById('tablesGrid').innerHTML = '<div class="error">Error loading tables</div>';
            }
        }
        
        async function loadTableData(tableName) {
            try {
                const response = await fetch(\`/api/table/\${tableName}\`);
                const data = await response.json();
                
                displayResults(data, \`Table: \${tableName}\`);
            } catch (error) {
                console.error('Error loading table data:', error);
                displayError('Error loading table data');
            }
        }
        
        async function runQuery() {
            const sql = document.getElementById('sqlQuery').value.trim();
            
            if (!sql) {
                displayError('Please enter a SQL query');
                return;
            }
            
            try {
                const response = await fetch('/api/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ sql })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    displayError(data.error);
                } else {
                    displayResults(data, 'Custom Query Results');
                }
            } catch (error) {
                console.error('Error running query:', error);
                displayError('Error running query');
            }
        }
        
        function displayResults(data, title) {
            const results = document.getElementById('results');
            
            if (!data.rows || data.rows.length === 0) {
                results.innerHTML = \`
                    <h2>\${title}</h2>
                    <p>No results found</p>
                \`;
                return;
            }
            
            const columns = data.columns || Object.keys(data.rows[0]);
            
            let tableHTML = \`
                <h2>\${title}</h2>
                <p>Total results: \${data.total}</p>
                <table>
                    <thead>
                        <tr>
                            \${columns.map(col => \`<th>\${col}</th>\`).join('')}
                        </tr>
                    </thead>
                    <tbody>
            \`;
            
            data.rows.forEach(row => {
                tableHTML += '<tr>';
                columns.forEach(col => {
                    const value = row[col];
                    tableHTML += \`<td>\${value !== null && value !== undefined ? value : ''}</td>\`;
                });
                tableHTML += '</tr>';
            });
            
            tableHTML += '</tbody></table>';
            results.innerHTML = tableHTML;
        }
        
        function displayError(message) {
            const results = document.getElementById('results');
            results.innerHTML = \`
                <h2>❌ Error</h2>
                <div class="error">\${message}</div>
            \`;
        }
        
        // Allow Enter key to run query
        document.getElementById('sqlQuery').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                runQuery();
            }
        });
    </script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`🌐 Database Web Viewer running on http://localhost:${PORT}`);
  console.log(`📁 Database location: ${dbPath}`);
}); 