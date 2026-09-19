# Complete Check-In System Setup Guide

## Table of Contents
1. [Equipment Checklist](#equipment-checklist)
2. [How It All Works Together](#how-it-all-works-together)
3. [Phase 1: Pre-Setup at Home](#phase-1-pre-setup-at-home)
4. [Phase 2: On-Site Installation](#phase-2-on-site-installation)
5. [Daily Operation](#daily-operation)
6. [Troubleshooting](#troubleshooting)

---

## Equipment Checklist

### ✅ What You Already Have
- [x] GMKtec Mini PC (Intel Inside)
- [x] Software code (already created)
- [x] Monitor (for temporary setup use)

### 🛒 What You Need to Buy

#### Required:
- [ ] **Philips Hue Bridge** (~$60)
  - Model: Philips Hue Bridge v2
  - Includes: Bridge, power adapter, ethernet cable

- [ ] **13 Philips Hue White Bulbs** (~$15 each = ~$195)
  - Model: Philips Hue White A19
  - Or: Philips Hue White and Color (if you want color options)
  - Make sure they're compatible with Hue Bridge

- [ ] **iPad/Tablet** (~$329+ if you don't have one)
  - Any iPad model works
  - Or: Any tablet with web browser
  - Will display the check-in interface

#### Optional but Recommended:
- [ ] **Ethernet cable** (if WiFi is unreliable)
  - To connect GMKtec directly to router

- [ ] **Small label maker**
  - To label which bulb goes in which office

- [ ] **Power strip**
  - For GMKtec + Hue Bridge

---

## How It All Works Together

### The Complete System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS OFFICE NETWORK                  │
│                         (WiFi/LAN)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │   WAITING    │         │   OFFICE 1   │                │
│  │     ROOM     │         │              │                │
│  │              │         │  💡 Hue Bulb │                │
│  │  iPad with   │         │   (Light 1)  │                │
│  │  Check-In    │         └──────────────┘                │
│  │    Page      │                                          │
│  └──────┬───────┘         ┌──────────────┐                │
│         │                 │   OFFICE 2   │                │
│         │ WiFi            │              │                │
│         │                 │  💡 Hue Bulb │                │
│         ↓                 │   (Light 2)  │                │
│  ┌──────────────┐         └──────────────┘                │
│  │   GMKtec     │                                          │
│  │   Mini PC    │         ┌──────────────┐                │
│  │              │         │   OFFICE 3   │                │
│  │ Node.js      │         │              │                │
│  │ Server       │         │  💡 Hue Bulb │                │
│  │ Port 3000    │         │   (Light 3)  │                │
│  └──────┬───────┘         └──────────────┘                │
│         │                                                  │
│         │ Local Network          ... through ...           │
│         │                                                  │
│         ↓                 ┌──────────────┐                │
│  ┌──────────────┐         │  OFFICE 13   │                │
│  │ Philips Hue  │         │              │                │
│  │   Bridge     │◄────────┤  💡 Hue Bulb │                │
│  │              │ Zigbee  │  (Light 13)  │                │
│  │ (Hub Device) │         └──────────────┘                │
│  └──────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step-by-Step Flow (What Happens When Someone Checks In):

**1. Patient arrives at waiting room**
   - Sees iPad with check-in interface
   - Screen shows: "Who are you here to see?"

**2. Patient selects provider**
   - Opens dropdown menu
   - Selects "Office 5" (Dr. Smith's office)

**3. Patient clicks "Check In" button**
   - iPad sends HTTP request over WiFi
   - Request goes to: `http://192.168.1.XXX:3000/api/checkin`
   - Data sent: `{ "office": "Office 5" }`

**4. GMKtec Mini PC receives request**
   - Node.js server running on GMKtec processes request
   - Looks up Office 5 in config.json
   - Finds: Office 5 = Light ID "5"

**5. GMKtec sends command to Hue Bridge**
   - HTTP PUT request to Hue Bridge
   - Command: Turn on Light #5, blue color, max brightness
   - URL: `http://192.168.1.45/api/{username}/lights/5/state`

**6. Hue Bridge communicates with bulb**
   - Uses Zigbee wireless protocol (low-power mesh network)
   - Sends command to Light #5
   - Light turns on instantly

**7. Light in Office 5 turns on**
   - Dr. Smith sees light turn on
   - Knows patient has checked in
   - Comes to waiting room to greet patient

**8. Confirmation shown on iPad**
   - Screen displays: "You are checked in."
   - Success message appears
   - Form resets after 2.5 seconds
   - Ready for next patient

**Total time:** Less than 1 second from button click to light on!

---

## Phase 1: Pre-Setup at Home

### What You're Accomplishing:
Setting up the GMKtec with all software so it's 95% ready before moving to business location.

### Time Required: 1-2 hours

---

### Step 1: GMKtec Initial Setup (15 minutes)

**1.1 Connect GMKtec to monitor, keyboard, mouse**
- Use HDMI cable for monitor
- USB keyboard and mouse

**1.2 Boot up and connect to your home WiFi**
- Power on GMKtec
- Let Windows boot up
- Connect to your WiFi network
- Make sure internet is working

**1.3 Note the IP address**
- Open Command Prompt (Windows key + R, type `cmd`)
- Type: `ipconfig`
- Find "IPv4 Address" under your WiFi adapter
- Write it down (example: 192.168.1.150)

**1.4 Install Windows updates**
- Go to Settings → Update & Security
- Install all available updates
- Restart if needed

---

### Step 2: Install Node.js (10 minutes)

**2.1 Download Node.js**
- Go to: https://nodejs.org/
- Download the LTS version (Long Term Support)
- Choose Windows installer (.msi file)

**2.2 Install Node.js**
- Run the downloaded installer
- Click "Next" through all prompts
- Accept default settings
- ✅ Make sure "Add to PATH" is checked
- Click "Install"
- Click "Finish"

**2.3 Verify installation**
- Open new Command Prompt
- Type: `node --version`
- Should show: v20.x.x or similar
- Type: `npm --version`
- Should show: 10.x.x or similar

---

### Step 3: Transfer Your Code (10 minutes)

**3.1 Copy the project folder**

**Option A: USB Drive**
- Copy `check_in_system` folder from your Mac to USB drive
- Plug USB into GMKtec
- Copy folder to `C:\Users\[YourName]\`

**Option B: Network Share**
- Enable file sharing on your Mac
- Access Mac from GMKtec via network
- Copy `check_in_system` folder

**Option C: Cloud (Dropbox/Google Drive)**
- Upload folder from Mac
- Download to GMKtec

**3.2 Verify files are there**
- Open File Explorer
- Navigate to where you copied the folder
- Should see:
  ```
  check_in_system/
  ├── server.js
  ├── package.json
  ├── config.json
  ├── config.example.json
  ├── README.md
  └── public/
      └── index.html
  ```

---

### Step 4: Install Dependencies and Test (15 minutes)

**4.1 Open Command Prompt in project folder**
- Navigate to the folder in File Explorer
- In the address bar, type: `cmd` and press Enter
- Command Prompt opens in that folder

**4.2 Install npm packages**
```bash
npm install
```
- Wait for installation to complete (1-2 minutes)
- Should see "added 107 packages"

**4.3 Test the server**
```bash
npm start
```
- Should see:
  ```
  🚀 Check-in System Server Running
  🎭 DEMO MODE: Running without Hue Bridge (for testing)
  📱 Open browser to: http://localhost:3000
  ✓ Ready for check-ins!
  ```

**4.4 Test the UI**
- Open web browser on GMKtec
- Go to: `http://localhost:3000`
- Should see the beautiful check-in page
- Try selecting an office and clicking "Check In"
- Should see: "You are checked in." message
- ✅ Success!

**4.5 Stop the server**
- Go back to Command Prompt
- Press `Ctrl + C`
- Server stops

---

### Step 5: Enable Remote Desktop (10 minutes)

This lets you access GMKtec from your Mac later without needing a monitor.

**5.1 Enable Remote Desktop on GMKtec**
- Right-click "This PC" → Properties
- Click "Remote settings" (left sidebar)
- Select "Allow remote connections to this computer"
- Click "OK"

**5.2 Note computer name**
- In same window, note the "Computer name"
- Example: GMKTEC-PC

**5.3 Set up user password (if not already set)**
- Remote Desktop requires a password
- Go to Settings → Accounts → Sign-in options
- Set a password if you don't have one

**5.4 Test from your Mac (optional)**
- Download "Microsoft Remote Desktop" from Mac App Store (free)
- Open app
- Click "+" → Add PC
- Enter GMKtec's IP address
- Enter username and password
- Should connect and show GMKtec desktop

---

### Step 6: Create Auto-Start Script (15 minutes)

This makes the server start automatically when GMKtec boots up.

**6.1 Create startup batch file**
- Right-click in the `check_in_system` folder
- New → Text Document
- Name it: `start-server.bat`
- Right-click → Edit
- Paste this:
  ```batch
  @echo off
  cd /d C:\Users\[YourName]\check_in_system
  npm start
  ```
- Replace `[YourName]` with your actual username
- Save and close

**6.2 Test the batch file**
- Double-click `start-server.bat`
- Command window should open
- Server should start
- Press Ctrl+C to stop

**6.3 Create startup shortcut**
- Right-click `start-server.bat` → Create shortcut
- Cut the shortcut (Ctrl+X)
- Press Windows key + R
- Type: `shell:startup`
- Press Enter (Startup folder opens)
- Paste the shortcut (Ctrl+V)

**6.4 Test auto-start**
- Restart GMKtec
- Wait for Windows to boot
- Command window should automatically open
- Server should start running
- ✅ Perfect!

---

### Step 7: Final Home Testing (10 minutes)

**7.1 Test from another device**
- Get iPad or phone
- Make sure it's on same WiFi as GMKtec
- Open browser
- Go to: `http://[GMKtec-IP]:3000`
- Example: `http://192.168.1.150:3000`

**7.2 Verify full functionality**
- Select different offices
- Click "Check In" button
- See confirmation messages
- Check server terminal shows demo mode messages

**7.3 Bookmark on iPad**
- On iPad Safari, visit the page
- Tap the Share button
- Tap "Add to Home Screen"
- Name it "Check In"
- Now there's an app icon on iPad home screen!

---

### ✅ Phase 1 Complete!

Your GMKtec is now:
- ✅ Fully configured with Node.js
- ✅ Running your check-in software
- ✅ Auto-starts on boot
- ✅ Accessible via Remote Desktop
- ✅ Ready to move to business location

**You can now disconnect the monitor and pack up GMKtec!**

---

## Phase 2: On-Site Installation

### What You're Accomplishing:
Installing Hue Bridge, bulbs, connecting everything to business WiFi, and going live!

### Time Required: 2-3 hours (depending on bulb installation)

### Prerequisites:
- GMKtec fully set up from Phase 1
- All equipment purchased and ready
- Access to business WiFi password
- Access to business router (to find IP addresses)

---

### Step 1: Install Hue Bridge (15 minutes)

**1.1 Unbox and connect Hue Bridge**
- Take Hue Bridge out of box
- Connect ethernet cable from Bridge to your router
- Plug in power adapter
- Wait 1-2 minutes for lights to settle
- Should see solid blue lights (ready state)

**1.2 Find Hue Bridge IP address**

**Option A: Check router admin page**
- Log into your router (usually 192.168.1.1 or 192.168.0.1)
- Look for connected devices
- Find "Philips Hue Bridge" in device list
- Note the IP address (example: 192.168.1.45)

**Option B: Use Hue app discovery**
- Download "Philips Hue" app on your phone
- Open app → Set up new bridge
- App will find bridge and show IP

**Option C: Use our server's endpoint**
- We'll use this method later after everything connects

**Write down:** Hue Bridge IP: ___________________

---

### Step 2: Install Smart Bulbs (45-60 minutes)

**2.1 Install bulbs in all 13 offices**
- Turn off power to light fixtures (if possible)
- Remove old bulbs
- Screw in Hue bulbs
- Turn power back on
- Bulbs should light up (may flash once)

**2.2 Label each bulb location**
- Use sticky notes or labels
- Mark which bulb is in which office
- Example: "Office 1 - Dr. Smith"

**2.3 Add bulbs to Hue Bridge**
- Open Philips Hue app on phone
- Go to Settings → Light setup
- Tap "Add light"
- App searches for new bulbs
- Should find all 13 bulbs
- Add them one at a time

**2.4 Rename bulbs in Hue app**
- In Hue app, go to each bulb
- Rename them clearly:
  - "Office 1"
  - "Office 2"
  - etc.
- This makes configuration easier later

---

### Step 3: Connect GMKtec to Business WiFi (10 minutes)

**3.1 Connect monitor to GMKtec (temporary)**
- Plug HDMI cable to GMKtec
- Connect keyboard and mouse
- Power on

**3.2 Connect to business WiFi**
- Click WiFi icon in system tray
- Select your business WiFi network
- Enter password
- Wait for connection

**3.3 Find GMKtec's new IP address**
- Open Command Prompt
- Type: `ipconfig`
- Find IPv4 Address under WiFi adapter
- **Write down:** GMKtec IP: ___________________

**3.4 Verify server is running**
- Server should have auto-started on boot
- If not, double-click `start-server.bat`

---

### Step 4: Configure Hue Bridge Connection (20 minutes)

**4.1 Generate Hue Bridge API Username**

This is the authentication key for your server to talk to the Bridge.

**Step 1: Press the button on Hue Bridge**
- Walk to where Hue Bridge is plugged in
- Press the large round button on top
- Bridge is now in pairing mode for 30 seconds

**Step 2: Generate username (from GMKtec)**
- On GMKtec, open Command Prompt
- Type this command (replace with YOUR Hue Bridge IP):
  ```bash
  curl -X POST http://192.168.1.45/api -d "{\"devicetype\":\"checkin-system\"}"
  ```
- Press Enter within 30 seconds of pressing Bridge button

**Step 3: Copy the username**
- Response will look like:
  ```json
  [{"success":{"username":"Ab3xYz9Qr2Mn8Kp5Ld1Wc4Vb7Nf6Hg3"}}]
  ```
- Copy the long username string
- **Write down:** Hue Username: ___________________

**If you get an error:**
- Make sure you pressed the Bridge button first
- Make sure you're within 30 seconds
- Check the IP address is correct
- Try again

---

### Step 5: Find Light IDs and Map to Offices (30 minutes)

**5.1 Get all lights from Hue Bridge**
- On GMKtec, open web browser
- Go to: `http://localhost:3000/api/lights`
- You'll see JSON with all your lights
- Example:
  ```json
  {
    "1": {
      "name": "Office 1",
      "state": {"on": false, "bri": 254},
      ...
    },
    "2": {
      "name": "Office 2",
      ...
    }
  }
  ```

**5.2 Create mapping list**
Make a table like this:

| Office Name | Light Name in Hue App | Light ID |
|-------------|----------------------|----------|
| Office 1    | Office 1             | 1        |
| Office 2    | Office 2             | 2        |
| Office 3    | Office 3             | 3        |
| ...         | ...                  | ...      |

**5.3 Verify each light (optional but recommended)**
- Use the Hue app to turn lights on/off
- Make sure you know which physical bulb is which ID

---

### Step 6: Update config.json (10 minutes)

**6.1 Open config.json**
- On GMKtec, navigate to `check_in_system` folder
- Right-click `config.json` → Edit with Notepad

**6.2 Update with your settings**
```json
{
  "demoMode": false,
  "hueBridgeIP": "192.168.1.45",
  "hueUsername": "Ab3xYz9Qr2Mn8Kp5Ld1Wc4Vb7Nf6Hg3",
  "officeLightMapping": {
    "Office 1": "1",
    "Office 2": "2",
    "Office 3": "3",
    "Office 4": "4",
    "Office 5": "5",
    "Office 6": "6",
    "Office 7": "7",
    "Office 8": "8",
    "Office 9": "9",
    "Office 10": "10",
    "Office 11": "11",
    "Office 12": "12",
    "Office 13": "13"
  }
}
```

**Important changes:**
- ✅ Change `demoMode` to `false`
- ✅ Update `hueBridgeIP` with your Bridge IP
- ✅ Update `hueUsername` with your generated username
- ✅ Update light IDs in `officeLightMapping` to match your actual light IDs

**6.3 Save the file**

---

### Step 7: Restart Server and Test (15 minutes)

**7.1 Restart the server**
- Go to Command Prompt running the server
- Press Ctrl+C to stop
- Double-click `start-server.bat` to restart
- Should now show (no demo mode message):
  ```
  🚀 Check-in System Server Running
  📱 Open browser to: http://localhost:3000
  🌉 Hue Bridge: 192.168.1.45
  ✓ Ready for check-ins!
  ```

**7.2 Test from GMKtec first**
- Open browser on GMKtec
- Go to: `http://localhost:3000`
- Select "Office 1"
- Click "Check In"
- **Light in Office 1 should turn on!** 💡
- Success message: "You are checked in."

**7.3 Test each office**
- Go through each office 1-13
- Verify correct light turns on
- If wrong light turns on, check your config.json mapping

---

### Step 8: Connect iPad and Final Testing (15 minutes)

**8.1 Connect iPad to business WiFi**
- Same network as GMKtec and Hue Bridge
- Make sure WiFi is working

**8.2 Open check-in page on iPad**
- Open Safari
- Go to: `http://192.168.1.XXX:3000` (your GMKtec IP)
- Beautiful check-in page should load

**8.3 Test full workflow**
- Select each office
- Click "Check In"
- Verify correct light turns on each time
- Check that iPad shows confirmation
- Verify form resets after 2.5 seconds

**8.4 Add to iPad home screen**
- Tap Safari's share button
- Tap "Add to Home Screen"
- Name it: "Check In"
- Icon appears on home screen
- Now staff can launch like an app!

---

### Step 9: Set Up iPad Kiosk Mode (Optional, 10 minutes)

This locks iPad to only show the check-in page.

**9.1 Enable Guided Access**
- iPad Settings → Accessibility
- Scroll down → Guided Access
- Turn ON
- Set a passcode

**9.2 Lock to check-in page**
- Open your check-in page
- Triple-click home/power button
- Tap "Start" in top right
- iPad is now locked to this page
- Can't exit without passcode

**To exit:** Triple-click, enter passcode, tap "End"

---

### Step 10: Physical Setup and Cable Management (15 minutes)

**10.1 Position GMKtec**
- Find permanent location (closet, behind desk, etc.)
- Make sure WiFi signal is good
- Plug into power
- Disconnect monitor (not needed anymore!)

**10.2 Position Hue Bridge**
- Central location for best Zigbee coverage
- Near router (ethernet connected)
- Away from metal objects

**10.3 Mount iPad in waiting room**
- Use iPad stand or wall mount
- Position where patients can easily see/reach
- Near power outlet for charging
- Consider security cable/lock

**10.4 Label everything**
- Label power cables
- Note IP addresses on equipment
- Keep config backup in safe place

---

### ✅ Phase 2 Complete!

Your system is now:
- ✅ Fully operational
- ✅ Connected to business WiFi
- ✅ Controlling real Hue lights
- ✅ iPad accessible to patients
- ✅ Ready for daily use!

---

## Daily Operation

### Normal Day (Everything Works Automatically):

**Morning:**
- GMKtec auto-starts when powered on (or runs 24/7)
- Server launches automatically
- No action needed from you

**Throughout the day:**
- Patients use iPad to check in
- Lights turn on in providers' offices
- Providers see notification and greet patients
- System runs continuously

**End of day:**
- Optionally turn off lights via Hue app
- GMKtec can stay running 24/7 (recommended)
- iPad can stay on charge

### Power Usage:
- GMKtec: ~10-15 watts (like a laptop charger)
- Hue Bridge: ~2 watts
- 13 LED bulbs when off: ~0 watts
- **Total cost:** ~$2-3/month in electricity

---

## Troubleshooting

### Problem: Light doesn't turn on

**Check:**
1. Is the bulb powered on at the switch?
2. Is the Hue Bridge online? (check lights on bridge)
3. Did you press the correct office?
4. Check config.json - is the light ID correct?
5. Try turning light on manually via Hue app

**Fix:**
- Verify light ID mapping
- Check Bridge connectivity
- Restart server: Ctrl+C, then `npm start`

---

### Problem: iPad can't connect to page

**Check:**
1. Is iPad on the same WiFi as GMKtec?
2. Is GMKtec powered on?
3. Is server running on GMKtec?
4. Try accessing from GMKtec first: `http://localhost:3000`

**Fix:**
- Verify GMKtec IP hasn't changed
- Check WiFi connection
- Restart server
- Check firewall settings on GMKtec

---

### Problem: Server won't start

**Check:**
1. Is Node.js installed? Run: `node --version`
2. Are dependencies installed? Run: `npm install`
3. Is config.json formatted correctly? (check for syntax errors)

**Fix:**
- Reinstall dependencies: `npm install`
- Check config.json for typos
- Look at error message in terminal

---

### Problem: Wrong light turns on

**Check:**
- config.json light mapping
- Visit `/api/lights` to see actual light IDs

**Fix:**
- Update `officeLightMapping` in config.json
- Make sure Office names match exactly
- Restart server after changes

---

### Problem: GMKtec IP address changed

**Why this happens:**
- Router assigns dynamic IPs
- Can change after power outage or router restart

**Fix (Quick):**
- Find new IP: `ipconfig` on GMKtec
- Update iPad bookmark with new IP

**Fix (Permanent):**
- Set static IP for GMKtec in router settings
- Or use hostname instead of IP: `http://GMKTEC-PC:3000`

---

### Remote Access for Troubleshooting

**From your Mac:**
1. Open Microsoft Remote Desktop app
2. Connect to GMKtec IP address
3. Full desktop access
4. Check server logs, restart server, etc.

**No need to physically access GMKtec!**

---

## Quick Reference Card

**Print this and keep near GMKtec:**

```
═══════════════════════════════════════════════════
      CHECK-IN SYSTEM - QUICK REFERENCE
═══════════════════════════════════════════════════

Equipment IPs:
  GMKtec:      ____________________
  Hue Bridge:  ____________________

Access URLs:
  Check-in page:  http://[GMKtec-IP]:3000
  View lights:    http://[GMKtec-IP]:3000/api/lights

Restart Server:
  1. Remote Desktop to GMKtec
  2. Press Ctrl+C in server window
  3. Double-click: start-server.bat

Common Issues:
  □ Check WiFi connections
  □ Verify Hue Bridge is online (lights on bridge)
  □ Restart server
  □ Power cycle GMKtec if needed

Support:
  Config file: C:\Users\[Name]\check_in_system\config.json
  Server logs: Check Command Prompt window

═══════════════════════════════════════════════════
```

---

## System Maintenance

### Monthly:
- [ ] Check that all lights still work
- [ ] Update iPad iOS if prompted
- [ ] Verify GMKtec has space (shouldn't use much)

### Every 6 months:
- [ ] Update Node.js to latest LTS version
- [ ] Install Windows updates on GMKtec
- [ ] Update dependencies: `npm update`

### As needed:
- [ ] Replace any burned-out bulbs
- [ ] Update provider names if staff changes
- [ ] Add/remove offices in config.json

---

## Backup Your Configuration

**Save these files somewhere safe:**

1. **config.json** - all your settings
2. **entire check_in_system folder** - backup to USB/cloud
3. **This guide** - keep PDF copy
4. **Network info** - WiFi passwords, IP addresses

**If GMKtec fails:**
- Get replacement computer
- Copy files back
- Follow Phase 1 again
- Back up in ~1 hour

---

## Support and Upgrades

### Future Enhancements You Could Add:

**Easy:**
- Change light colors per provider
- Auto turn off lights after X minutes
- Different messages per office type
- Add company logo to page

**Medium:**
- Log check-ins to database
- Display queue on provider screens
- Email/SMS notifications
- Multiple check-in iPads

**Advanced:**
- Mobile app version
- Provider dashboard
- Analytics and reports
- Integration with scheduling system

---

## Congratulations!

You now have a fully functional, professional check-in system that:

✅ Notifies providers instantly when patients arrive
✅ Improves patient experience with modern interface
✅ Runs reliably 24/7 with minimal maintenance
✅ Costs almost nothing to operate
✅ Scales easily if you grow

**Enjoy your new system!**
