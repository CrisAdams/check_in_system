# Check-In System with Philips Hue Notifications

A simple, elegant check-in system for a counseling practice. When clients check in via an iPad, it automatically turns on a smart light in the provider's office.

## Quick Start

### Prerequisites
- Node.js installed (v14 or higher) - Download from [nodejs.org](https://nodejs.org/)
- Philips Hue Bridge connected to your network
- 13 Philips Hue bulbs (one per office)
- iPad or tablet

---

## Setup Instructions

### Step 1: Install Dependencies

Open Terminal and navigate to this folder, then run:

```bash
npm install
```

This installs Express, Axios, and CORS packages needed for the server.

---

### Step 2: Find Your Hue Bridge IP Address

**Option A - Check your router:**
- Log into your router admin panel
- Look for "Philips Hue Bridge" in connected devices
- Note the IP address (e.g., 192.168.1.45)

**Option B - Use the Hue app:**
- Open Philips Hue app on your phone
- Go to Settings → Hue Bridges → (i) info icon
- Note the IP address

---

### Step 3: Create a Hue Bridge Username (API Key)

You need to authenticate with the Hue Bridge once to get a username (API key).

1. **Press the physical button on your Hue Bridge** (the round button on top)

2. **Within 30 seconds**, run this command in Terminal (replace the IP with yours):

```bash
curl -X POST http://192.168.1.45/api -d '{"devicetype":"checkin-system"}'
```

3. You'll get a response like:
```json
[{"success":{"username":"1234567890abcdef1234567890abcdef"}}]
```

4. **Copy that username** - you'll need it for config.json

---

### Step 4: Find Your Light IDs

Each Hue bulb has an ID number. Let's find them:

1. First, create your `config.json` file:
```bash
cp config.example.json config.json
```

2. Edit `config.json` and add your Bridge IP and username:
```json
{
  "hueBridgeIP": "192.168.1.45",
  "hueUsername": "1234567890abcdef1234567890abcdef",
  "officeLightMapping": {
    ...
  }
}
```

3. Start the server temporarily:
```bash
npm start
```

4. In your browser, go to:
```
http://localhost:3000/api/lights
```

5. You'll see all your lights with their IDs and names:
```json
{
  "1": {"name": "Office Light 1", ...},
  "2": {"name": "Conference Room", ...},
  "3": {"name": "Office Light 2", ...}
}
```

6. **Map each office to its light ID** in `config.json`:
```json
"officeLightMapping": {
  "Office 1": "1",
  "Office 2": "3",
  "Office 3": "5",
  ...
}
```

**Tip:** You can use the Hue app to blink lights on/off to identify which physical bulb corresponds to which ID.

---

### Step 5: Test the System

1. **Start the server:**
```bash
npm start
```

You should see:
```
🚀 Check-in System Server Running
📱 Open tablet browser to: http://localhost:3000
🌉 Hue Bridge: 192.168.1.45

✓ Ready for check-ins!
```

2. **Open the check-in page:**
- On your iPad/tablet, open Safari or Chrome
- Go to: `http://[YOUR-COMPUTER-IP]:3000`
  - Find your computer's IP: System Preferences → Network
  - Example: `http://192.168.1.100:3000`

3. **Test a check-in:**
- Select "Office 1" from the dropdown
- Click "Check In"
- The light in Office 1 should turn on (bright blue)

4. **If it works:** You're done! If not, see troubleshooting below.

---

## How to Run Daily

### Option 1: Manual Start (Recommended for Testing)
```bash
cd /Users/cristeenadams/code/highburyholdings/rva_counseling
npm start
```
Keep this Terminal window open while the system is in use.

### Option 2: Run in Background
```bash
npm start &
```

### Option 3: Auto-start on Boot (Advanced)
Create a LaunchAgent or use PM2 process manager:
```bash
npm install -g pm2
pm2 start server.js --name checkin-system
pm2 startup
pm2 save
```

---

## Usage

### For Clients (iPad Interface):
1. Tap the dropdown menu
2. Select the office/provider
3. Tap "Check In"
4. Green confirmation message appears
5. Provider's light turns on

### For Providers:
- When your office light turns on, a client has checked in
- Turn off the light manually when ready

---

## Customization

### Change Light Color/Brightness

Edit `server.js` around line 29:

```javascript
const lightState = {
    on: true,
    bri: 254,        // Brightness: 1-254 (max)
    hue: 25500,      // Color: 0-65535
    sat: 254         // Saturation: 0-254
};
```

**Color reference (hue values):**
- Red: 0
- Orange: 5000
- Yellow: 12000
- Green: 25500
- Blue: 46920
- Purple: 56100
- Pink: 58000

### Auto Turn-Off Light

To automatically turn off the light after 5 minutes, add this to `server.js` after the light turns on:

```javascript
// Auto turn off after 5 minutes
setTimeout(async () => {
    await axios.put(`${BASE_URL}/lights/${lightId}/state`, { on: false });
}, 5 * 60 * 1000); // 5 minutes
```

---

## Troubleshooting

### "Failed to communicate with Hue Bridge"
- Check that your computer and Hue Bridge are on the same network
- Verify the Bridge IP in `config.json`
- Press the Bridge button and regenerate username if needed

### "No light configured for Office X"
- Check `config.json` - make sure light IDs are correct
- Visit `/api/lights` to see all available lights

### iPad can't connect to server
- Make sure iPad and computer are on same WiFi
- Use computer's IP address, not "localhost"
- Check firewall settings on your computer

### Wrong light turns on
- Visit `/api/lights` to verify light IDs
- Update the mapping in `config.json`

---

## Technical Architecture

### Frontend (`public/index.html`)
- Clean, tablet-optimized interface
- Dropdown with 13 offices
- Large check-in button
- Success/error messaging
- Responsive design

### Backend (`server.js`)
- Express.js server
- RESTful API endpoints
- Direct communication with Hue Bridge (local network)
- Error handling and logging

### Communication Flow
```
iPad → Server → Hue Bridge → Smart Bulb
```

1. User selects office on iPad
2. Browser sends POST request to server
3. Server looks up light ID from config
4. Server sends command to Hue Bridge API
5. Bridge turns on the specific bulb
6. Server responds to browser with success
7. User sees confirmation message

---

## API Endpoints

### `POST /api/checkin`
Check in to an office (turns light on)
```json
Request: { "office": "Office 1" }
Response: { "success": true, "message": "Office 1 has been notified!" }
```

### `POST /api/turnoff`
Turn off an office light (for testing)
```json
Request: { "office": "Office 1" }
Response: { "success": true, "message": "Office 1 light turned off" }
```

### `GET /api/lights`
Get all Hue lights and their IDs
```json
Response: { "1": { "name": "Office 1", ... }, ... }
```

### `GET /api/health`
Server health check
```json
Response: { "status": "ok", "message": "Server is running" }
```

---

## File Structure

```
rva_counseling/
├── server.js              # Backend Node.js server
├── package.json           # Dependencies
├── config.json            # Your Hue Bridge settings (you create this)
├── config.example.json    # Template for config
├── README.md              # This file
└── public/
    └── index.html         # Frontend check-in interface
```

---

## Security Notes

- This system runs on your **local network only** (no internet required)
- No data is stored or logged
- No personal information collected
- Hue Bridge API is local-only (secure)

---

## Future Enhancements (Optional)

If you want to expand the system later:
- Add check-in logging to a database
- Display queue on provider's screen
- Send SMS/email notifications in addition to lights
- Add admin panel to manage offices
- Multi-location support
- Different colors for different appointment types

---

## Support

If you have questions or run into issues:
1. Check the Troubleshooting section above
2. Verify all setup steps were completed
3. Check server logs in Terminal for error messages

---

## License

MIT - Free to use and modify
