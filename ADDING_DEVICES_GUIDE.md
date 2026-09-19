# Adding Lights & Buttons to an Office

Use this guide any time you need to set up a new office, replace a bulb or button, or assign devices that aren't yet connected.

There are two parts:
1. **Add the device to the Philips Hue app** (so the bridge knows about it)
2. **Assign it to the office in the admin page** (so the check-in system uses it)

---

## Part 1 — Add a Light Bulb in the Hue App

> Do this for each new bulb before assigning it in the admin page.

**Before you start:** Make sure the bulb is physically installed in the light fixture and the light switch is turned ON.

1. Open the **Philips Hue** app on your phone or tablet.
2. Tap **Settings** (bottom right).
3. Tap **Lights**.
4. Tap **Add light** (the + button in the top right corner).
5. The app will scan for new bulbs. Wait 30–60 seconds — new bulbs should appear in the list.
6. Tap the bulb you want to add. If multiple bulbs appear and you're unsure which is which, use the Hue app to briefly turn one on/off to identify it.
7. **Name the bulb clearly** — use the office name, for example: `Office 7`
   - A clear name makes it easy to find in the admin page later.
8. Tap **Done**.

**Tip:** If the bulb doesn't appear, try turning it off and back on at the switch, then scan again.

---

## Part 2 — Add a Smart Button in the Hue App

> Do this for each new smart button before assigning it in the admin page.

1. Open the **Philips Hue** app.
2. Tap **Settings** (bottom right).
3. Tap **Accessories**.
4. Tap **Add accessory** (the + button in the top right corner).
5. Follow the on-screen instructions — you'll be asked to press a button on the device to put it into pairing mode.
   - On most Hue smart buttons: **hold the button for 5–10 seconds** until the LED blinks.
6. The app will detect the button and add it.
7. **Name the button clearly** — match it to the office, for example: `Office 7 Button`
8. Tap **Done**.

**Tip:** Keep the button close to the bridge during pairing, then move it to the office after it's added.

---

## Part 3 — Assign the Devices in the Admin Page

Once the bulb and button are in the Hue app, connect them to the office in the check-in system.

1. On any device connected to the office network, open a browser and go to:
   ```
   http://10.1.10.117:3000/admin
   ```
2. Enter the password: `rva_admin`
3. Find the professional who uses the office you're setting up.
4. Click the **gear icon (⚙)** to the right of their office field.
   - A configuration panel will open showing "Office X Configuration."
5. **Assign the light:**
   - Click **Find Lights**.
   - A list of available lights from the Hue bridge will appear.
   - Click the name of the bulb you just added (e.g., `Office 7`).
   - The light name will appear in the field with a red × to remove it if needed.
6. **Assign the button:**
   - Click **Find Buttons**.
   - A list of available buttons will appear.
   - Click the name of the button you just added (e.g., `Office 7 Button`).
7. Click **Save** (or close the panel — changes save automatically when you select a device).

**That's it.** The office is now fully configured:
- When a client checks in for that professional, the light turns on.
- When the professional presses their button, the light turns off.

---

## Quick Test

After assigning devices, test the full workflow:

1. On the **check-in page** (`http://10.1.10.117:3000`), select the professional and tap **Check In**.
   - The office light should turn on within 1–2 seconds.
2. Press the **smart button** in the office.
   - The light should turn off.

If either step doesn't work, see the troubleshooting section below.

---

## Troubleshooting

**Light doesn't appear in "Find Lights"**
- Make sure you added and named it in the Hue app first.
- The light may already be assigned to another office — it won't appear in the list. Check other offices in the admin page.
- Refresh the admin page and try again.

**Button doesn't appear in "Find Buttons"**
- Same as above — pair it in the Hue app first.
- The button may already be assigned elsewhere.

**Light turns on but the wrong one**
- Double-check the bulb name in the Hue app — make sure you named it to match the correct office.
- In the admin page, click the gear icon, remove the current light assignment (red ×), and reassign the correct one.

**Nothing happens when client checks in**
- Confirm both a light AND a button are assigned to that office (both fields must be filled — the system requires both to be set).
- Check that the Hue bridge is online (solid blue lights on the bridge device).
- Try restarting the server: SSH into the NucBox and run `pm2 restart checkin`.
