console.log('*** [adminService] - run ***');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const router = express.Router();
const ScriptRun = require('../models/scriptRun.model'); // We'll create this model next
const SCRIPTS_DIR = path.join(__dirname, '../scripts');

// Middleware: Only allow Admin/Super-Admin
function requireAdmin(req, res, next) {
  if (!req.user || !['Admin', 'Super-Admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// GET /api/admin/scripts - List available scripts
router.get('/', requireAdmin, (req, res) => {
  console.log('[AdminScripts] Looking for scripts in:', SCRIPTS_DIR);
  fs.readdir(SCRIPTS_DIR, (err, files) => {
    if (err) {
      console.error('[AdminScripts] Error reading scripts dir:', err);
      return res.status(500).json({ error: err.message });
    }
    const scripts = files.filter(f => f.endsWith('.js'));
    res.json(scripts);
  });
});

// POST /api/admin/scripts/run - Run a script
router.post('/run', requireAdmin, (req, res) => {
  const { scriptName } = req.body;
  if (!scriptName || !scriptName.endsWith('.js')) {
    return res.status(400).json({ error: 'Invalid script name' });
  }
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);
  if (!fs.existsSync(scriptPath)) {
    return res.status(404).json({ error: 'Script not found' });
  }
  const child = spawn('node', [scriptPath], { stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  child.stdout.on('data', data => { stdout += data.toString(); });
  child.stderr.on('data', data => { stderr += data.toString(); });
  child.on('close', async (code) => {
    // Log the run
    await ScriptRun.create({
      script: scriptName,
      executedBy: req.user.email,
      date: new Date(),
      status: code === 0 ? 'success' : 'error',
      output: stdout,
      error: stderr
    });
    res.json({ code, stdout, stderr });
  });
});

// GET /api/admin/scripts/history - List script run history
router.get('/history', requireAdmin, async (req, res) => {
  const history = await ScriptRun.find().sort({ date: -1 }).limit(50);
  res.json(history);
});

module.exports = router; 