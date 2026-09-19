const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public', {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

// Demo mode (for testing without Hue Bridge)
const DEMO_MODE = config.demoMode || false;

// Philips Hue Bridge configuration
const HUE_BRIDGE_IP = config.hueBridgeIP;
const HUE_USERNAME = config.hueUsername;
const BASE_URL = `http://${HUE_BRIDGE_IP}/api/${HUE_USERNAME}`;

// Track last seen button state to detect new presses
const buttonLastSeen = {};

// Check-in: professional → office → offices[office] → lightId
app.post('/api/checkin', async (req, res) => {
    try {
        const { office } = req.body;
        if (!office) return res.status(400).json({ error: 'Office name is required' });

        const cfg = readConfig();
        const professional = cfg.professionals.find(p => p.name === office);
        const officeId = professional ? professional.office : null;
        const officeConfig = officeId ? (cfg.offices || {})[officeId] : null;
        const lightId = officeConfig ? officeConfig.lightId : null;

        if (!lightId && !DEMO_MODE) {
            return res.status(404).json({ error: `No light configured for ${office}` });
        }

        const lightState = { on: true, bri: 254, hue: 25500, sat: 254 };

        if (DEMO_MODE) {
            console.log(`🎭 DEMO MODE: Simulating check-in for ${office} (Office ${officeId}, Light ${lightId})`);
            await new Promise(resolve => setTimeout(resolve, 300));
        } else {
            await axios.put(`${BASE_URL}/lights/${lightId}/state`, lightState);
        }

        console.log(`✓ Check-in successful: ${office} (Office ${officeId}, Light ${lightId})`);
        res.json({ success: true, message: `${office} has been notified!`, office });

    } catch (error) {
        console.error('Error during check-in:', error.message);
        res.status(500).json({ error: 'Failed to communicate with Hue Bridge', details: error.message });
    }
});

// List sensors — use this to find smart button sensor IDs
app.get('/api/sensors', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/sensors`);
        const buttons = Object.entries(response.data)
            .filter(([, s]) => s.type === 'ZLLSwitch')
            .reduce((acc, [id, s]) => {
                acc[id] = { name: s.name, type: s.type, lastupdated: s.state.lastupdated, buttonevent: s.state.buttonevent };
                return acc;
            }, {});
        res.json(buttons);
    } catch (error) {
        console.error('Error getting sensors:', error.message);
        res.status(500).json({ error: 'Failed to get sensors from Hue Bridge', details: error.message });
    }
});

// Poll smart buttons — dismiss office light on short press (event 1002)
async function pollButtons() {
    if (DEMO_MODE) return;
    try {
        const cfg = readConfig();
        const offices = cfg.offices || {};

        // Build sensor buttonId → lightId map from offices
        const sensorLightMap = {};
        for (const office of Object.values(offices)) {
            if (office.buttonId && office.lightId) {
                sensorLightMap[office.buttonId] = office.lightId;
            }
        }
        if (Object.keys(sensorLightMap).length === 0) return;

        const response = await axios.get(`${BASE_URL}/sensors`);
        const sensors = response.data;

        for (const [id, sensor] of Object.entries(sensors)) {
            if (sensor.type !== 'ZLLSwitch') continue;
            const lightId = sensorLightMap[id];
            if (!lightId) continue;

            const { buttonevent, lastupdated } = sensor.state;
            const stateKey = `${lastupdated}:${buttonevent}`;

            if (buttonLastSeen[id] === undefined) {
                buttonLastSeen[id] = stateKey;
                continue;
            }

            if (buttonLastSeen[id] !== stateKey) {
                buttonLastSeen[id] = stateKey;
                if (buttonevent === 1002) {
                    await axios.put(`${BASE_URL}/lights/${lightId}/state`, { on: false });
                    console.log(`✓ Button dismiss: sensor ${id}, light ${lightId}`);
                }
            }
        }
    } catch (error) {
        console.error('Button poll error:', error.message);
    }
}

// List all lights (helpful for setup)
app.get('/api/lights', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/lights`);
        res.json(response.data);
    } catch (error) {
        console.error('Error getting lights:', error.message);
        res.status(500).json({ error: 'Failed to get lights from Hue Bridge' });
    }
});

// Admin page route
app.get('/admin', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// --- Admin API ---

const CONFIG_PATH = path.join(__dirname, 'config.json');

function readConfig() {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function writeConfig(data) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}

function adminAuth(req, res, next) {
    const password = req.headers['x-admin-password'];
    const cfg = readConfig();
    if (password !== (cfg.adminPassword || 'rva_admin')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// Public: active professionals for check-in page
app.get('/api/professionals', (req, res) => {
    const cfg = readConfig();
    res.json((cfg.professionals || []).filter(p => p.active !== false));
});

// Admin: get professionals
app.get('/api/admin/professionals', adminAuth, (req, res) => {
    const cfg = readConfig();
    res.json(cfg.professionals || []);
});

// Admin: add professional
app.post('/api/admin/professionals', adminAuth, (req, res) => {
    const { name, office } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const cfg = readConfig();
    cfg.professionals.push({ name, office: office || '', active: true });
    writeConfig(cfg);
    res.json({ success: true, professionals: cfg.professionals });
});

// Admin: update professional
app.put('/api/admin/professionals/:index', adminAuth, (req, res) => {
    const index = parseInt(req.params.index);
    const { name, office, active } = req.body;
    const cfg = readConfig();
    if (index < 0 || index >= cfg.professionals.length) {
        return res.status(404).json({ error: 'Not found' });
    }
    cfg.professionals[index] = {
        name:   name   !== undefined ? name   : cfg.professionals[index].name,
        office: office !== undefined ? office : cfg.professionals[index].office,
        active: active !== undefined ? active : cfg.professionals[index].active
    };
    writeConfig(cfg);
    res.json({ success: true, professionals: cfg.professionals });
});

// Admin: delete professional
app.delete('/api/admin/professionals/:index', adminAuth, (req, res) => {
    const index = parseInt(req.params.index);
    const cfg = readConfig();
    if (index < 0 || index >= cfg.professionals.length) {
        return res.status(404).json({ error: 'Not found' });
    }
    cfg.professionals.splice(index, 1);
    writeConfig(cfg);
    res.json({ success: true, professionals: cfg.professionals });
});

// Admin: reorder professionals
app.put('/api/admin/reorder', adminAuth, (req, res) => {
    const { professionals } = req.body;
    if (!Array.isArray(professionals)) {
        return res.status(400).json({ error: 'professionals must be an array' });
    }
    const cfg = readConfig();
    cfg.professionals = professionals;
    writeConfig(cfg);
    res.json({ success: true, professionals: cfg.professionals });
});

// Admin: get all offices
app.get('/api/admin/offices', adminAuth, (req, res) => {
    const cfg = readConfig();
    res.json(cfg.offices || {});
});

// Admin: update office Hue config (creates entry if it doesn't exist)
app.put('/api/admin/offices/:officeId', adminAuth, (req, res) => {
    const { officeId } = req.params;
    const { lightId, lightName, buttonId, buttonName } = req.body;
    const cfg = readConfig();
    if (!cfg.offices) cfg.offices = {};
    cfg.offices[officeId] = {
        lightId: lightId !== undefined ? lightId : (cfg.offices[officeId] || {}).lightId || '',
        lightName: lightName !== undefined ? lightName : (cfg.offices[officeId] || {}).lightName || '',
        buttonId: buttonId !== undefined ? buttonId : (cfg.offices[officeId] || {}).buttonId || '',
        buttonName: buttonName !== undefined ? buttonName : (cfg.offices[officeId] || {}).buttonName || ''
    };
    writeConfig(cfg);
    res.json({ success: true, offices: cfg.offices });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Check-in System Server Running`);
    if (DEMO_MODE) {
        console.log(`🎭 DEMO MODE: Running without Hue Bridge (for testing)`);
    } else {
        console.log(`🌉 Hue Bridge: ${HUE_BRIDGE_IP}`);
        console.log(`🔘 Watching for smart button dismissals`);
        setInterval(pollButtons, 1500);
    }
    console.log(`📱 Open browser to: http://localhost:${PORT}`);
    console.log(`\n✓ Ready for check-ins!\n`);
});
