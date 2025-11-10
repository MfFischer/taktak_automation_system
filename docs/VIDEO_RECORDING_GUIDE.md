# 🎥 Demo Video Recording Guide - Step by Step

This guide will walk you through recording a professional demo video for Taktak in **2-3 hours**.

---

## 📋 **What You'll Need**

### **Software (All Free!)**
1. **OBS Studio** - Screen recording (https://obsproject.com/)
2. **CapCut** - Video editing & AI enhancement (https://www.capcut.com/)
3. **Your browser** - Chrome or Edge recommended
4. **Optional:** Audacity for audio editing (https://www.audacityteam.org/)

### **Hardware**
- Computer with microphone (built-in is fine)
- Quiet room
- Good lighting (natural light or desk lamp)

---

## 🎬 **Phase 1: Preparation (30 minutes)**

### **Step 1: Set Up Your Demo Environment**

```bash
# Make sure the app is running
cd h:\softwares\taktak
npm run dev

# Wait for it to start, then open:
# http://localhost:3000
```

### **Step 2: Create Test Data**

1. **Create a fresh account:**
   - Email: `demo@taktak.app`
   - Password: `Demo123!@#`
   - Name: `Demo User`

2. **Import 2-3 templates:**
   - Go to Templates page
   - Import "Appointment Reminder System"
   - Import "Low Inventory Alert"
   - Import "Birthday Discount Campaign"

3. **Configure one workflow completely:**
   - Open "Appointment Reminder System"
   - Configure the Schedule node (Daily at 9 AM)
   - Configure the SMS node (phone number, message)
   - Save the workflow

### **Step 3: Clean Up Your Screen**

- Close unnecessary browser tabs
- Close Slack, Discord, email
- Hide desktop icons (right-click desktop → View → Show desktop icons)
- Set browser to full screen (F11)
- Clear browser history/cookies for clean demo

### **Step 4: Write Your Script**

```
[0-5s] INTRO
"Hi! I'm going to show you Taktak - an AI-powered automation platform 
that works offline-first for local businesses."

[5-15s] HOMEPAGE
"Here's the homepage. Taktak helps you automate repetitive tasks 
without writing any code."

[15-25s] SIGN UP
"Let's sign up... and we're in!"

[25-40s] TEMPLATES
"You get 18 ready-made workflow templates. 
Let's import this Appointment Reminder template."

[40-60s] WORKFLOW EDITOR
"Here's the visual workflow editor. 
We have a schedule trigger that runs daily at 9 AM,
queries our database for appointments,
and sends SMS reminders automatically."

[60-75s] CONFIGURE
"Let me configure the SMS node... 
add a phone number... 
write the message with dynamic variables...
and save."

[75-85s] RUN
"Now let's run it... 
and there we go! The workflow executed successfully."

[85-90s] CALL TO ACTION
"Start automating your business today. 
Download Taktak Desktop for just $29 - one-time payment, lifetime access.
Visit taktak.app to get started!"
```

---

## 🎙️ **Phase 2: Recording (30 minutes)**

### **Step 1: Install & Configure OBS Studio**

1. **Download OBS:**
   - Go to https://obsproject.com/
   - Download for Windows
   - Install (keep default settings)

2. **Configure OBS:**

   **Video Settings:**
   - Open OBS
   - Click `Settings` (bottom right)
   - Go to `Video` tab:
     - Base Resolution: `1920x1080`
     - Output Resolution: `1920x1080`
     - FPS: `30`
   - Click `Apply`

   **Output Settings:**
   - Go to `Output` tab
   - Output Mode: `Simple`
   - Recording Quality: `High Quality, Medium File Size`
   - Recording Format: `MP4`
   - Encoder: `Software (x264)`
   - Click `Apply`

   **Audio Settings:**
   - Go to `Audio` tab
   - Desktop Audio: `Default`
   - Mic/Auxiliary Audio: `Your Microphone`
   - Click `Apply` → `OK`

3. **Add Sources:**

   - In the `Sources` panel (bottom), click `+`
   - Select `Display Capture`
   - Name it "Screen"
   - Click `OK`
   - Select your monitor
   - Click `OK`

   - Click `+` again
   - Select `Audio Input Capture`
   - Name it "Microphone"
   - Select your microphone
   - Click `OK`

### **Step 2: Do a Test Recording**

1. Click `Start Recording` (bottom right)
2. Say: "Testing 1, 2, 3"
3. Click `Stop Recording`
4. Click `File` → `Show Recordings`
5. Play the video - check audio and video quality
6. If good, proceed. If not, adjust microphone volume in Settings

### **Step 3: Record Your Demo**

**Before you start:**
- Put your phone on silent
- Close all notifications
- Have your script visible (print it or second monitor)
- Take a deep breath!

**Recording:**

1. Open browser to `http://localhost:3000`
2. Click `Start Recording` in OBS
3. **Wait 3 seconds** (gives you time to edit later)
4. Start speaking and demonstrating:

   **Shot 1 (0-15s): Homepage**
   - Show homepage
   - Scroll slowly to show features
   - Speak clearly about what Taktak does

   **Shot 2 (15-25s): Sign Up**
   - Click "Get Started"
   - Fill in email/password quickly
   - Click "Sign Up"
   - Wait for dashboard to load

   **Shot 3 (25-40s): Templates**
   - Click "Templates" in sidebar
   - Scroll through templates
   - Hover over "Appointment Reminder"
   - Click "Import Template"
   - Wait for success message

   **Shot 4 (40-60s): Workflow Editor**
   - Click "Workflows" in sidebar
   - Click on the imported workflow
   - Show the visual canvas
   - Point out the nodes (Schedule, Database, SMS)
   - Explain the flow

   **Shot 5 (60-75s): Configure**
   - Double-click the SMS node
   - Show the configuration panel
   - Fill in phone number: `+1234567890`
   - Write message: `Hi {{name}}, reminder for your appointment at {{time}}`
   - Click "Save"

   **Shot 6 (75-85s): Run**
   - Click "Run Workflow" button
   - Show the execution progress
   - Show success message
   - Show execution results

   **Shot 7 (85-90s): Call to Action**
   - Go back to homepage
   - Show "Download" button
   - Say the call to action

5. Click `Stop Recording`
6. Save the file

**Tips:**
- Speak slowly and clearly
- Pause between sections (easier to edit)
- If you make a mistake, pause, then restart that section
- Don't worry about perfection - you'll edit it!

---

## ✂️ **Phase 3: Editing & Enhancement (1 hour)**

### **Step 1: Install CapCut**

1. Go to https://www.capcut.com/
2. Download CapCut for Desktop (Windows)
3. Install and open

### **Step 2: Import Your Video**

1. Click `New Project`
2. Click `Import` → Select your OBS recording
3. Drag the video to the timeline

### **Step 3: Basic Editing**

**Trim the Start/End:**
- Click on the video in timeline
- Drag the left edge to remove the 3-second wait at start
- Drag the right edge to remove any extra footage at end

**Cut Out Mistakes:**
- Play through the video
- When you find a mistake:
  - Click where the mistake starts
  - Click `Split` (scissors icon)
  - Click where the mistake ends
  - Click `Split` again
  - Select the middle section
  - Press `Delete`
- The video will automatically join

**Speed Up Slow Parts:**
- Select a slow section (like waiting for page load)
- Click `Speed` in the right panel
- Set to `2x` or `3x`
- Click `Apply`

### **Step 4: Add Captions (AI Auto-Generate)**

1. Click `Text` → `Auto Captions`
2. Select language: `English`
3. Click `Generate`
4. Wait 1-2 minutes
5. Review captions and fix any errors
6. Customize caption style:
   - Font: `Montserrat Bold`
   - Size: `48`
   - Color: `White`
   - Outline: `Black, 4px`
   - Position: `Bottom center`

### **Step 5: Add Background Music**

1. Click `Audio` → `Music`
2. Search for: `upbeat tech`
3. Select a track (preview first)
4. Drag to timeline below your video
5. Adjust volume: `20%` (so it doesn't overpower your voice)
6. Fade in/out:
   - Click the music track
   - Click `Fade` in right panel
   - Set `Fade In: 2s`, `Fade Out: 2s`

### **Step 6: Add Text Overlays**

**Title Card (0-3s):**
- Click `Text` → `Default Text`
- Type: `Taktak`
- Font: `Montserrat Bold`, Size: `120`
- Position: Center
- Animation: `Fade In`

**Feature Highlights:**
- At 25s (Templates): Add text "18 Ready-Made Templates"
- At 40s (Editor): Add text "Visual Workflow Builder"
- At 60s (Configure): Add text "No Coding Required"
- At 75s (Run): Add text "Automated Execution"

For each:
- Click `Text` → `Default Text`
- Type the text
- Font: `Montserrat`, Size: `60`
- Position: Top center
- Duration: 3 seconds
- Animation: `Slide In`

### **Step 7: Add Transitions**

- Between major sections, add transitions:
- Click between two clips
- Click `Transitions`
- Select `Dissolve` or `Fade`
- Duration: `0.5s`

### **Step 8: Color Correction (Optional)**

1. Select your video clip
2. Click `Adjust` in right panel
3. Increase `Brightness`: `+10`
4. Increase `Contrast`: `+15`
5. Increase `Saturation`: `+10`
6. Click `Apply`

### **Step 9: Export**

1. Click `Export` (top right)
2. Settings:
   - Resolution: `1080p (1920x1080)`
   - Frame Rate: `30 FPS`
   - Format: `MP4`
   - Quality: `High`
3. Click `Export`
4. Wait 5-10 minutes
5. Video will be saved to your Videos folder

---

## 📤 **Phase 4: Upload & Integrate (30 minutes)**

### **Option 1: YouTube (Recommended)**

1. **Upload:**
   - Go to https://studio.youtube.com/
   - Click `Create` → `Upload Video`
   - Select your exported video
   - Title: `Taktak Demo - AI Automation Platform`
   - Description: `Taktak is an AI-powered automation platform for local businesses. Visit https://taktak.app`
   - Visibility: `Unlisted` (not public, but shareable)
   - Click `Publish`

2. **Get Embed Code:**
   - Click on your video
   - Click `Share` → `Embed`
   - Copy the iframe code
   - It looks like: `<iframe src="https://www.youtube.com/embed/YOUR_VIDEO_ID"...`

3. **Update Desktop.tsx:**
   - Replace the video placeholder with your iframe code
   - See the code example below

### **Option 2: Self-Host on VPS**

```bash
# On your VPS
mkdir -p /var/www/taktak/videos
scp demo.mp4 root@YOUR_VPS_IP:/var/www/taktak/videos/

# Update nginx to serve videos
# Add to nginx.conf:
location /videos {
    alias /var/www/taktak/videos;
    add_header Cache-Control "public, max-age=31536000";
}
```

---

## 🔧 **Integrating the Video**

Update `apps/client/src/pages/Desktop.tsx`:

```typescript
{/* Demo Video Section */}
<section className="py-20 px-6">
  <div className="max-w-5xl mx-auto">
    <h2 className="text-4xl font-bold text-center mb-12 text-gradient">
      See Taktak in Action
    </h2>
    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
      <div className="aspect-video">
        {/* YouTube Embed */}
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
          title="Taktak Demo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
        
        {/* OR Self-Hosted Video */}
        {/* <video controls className="w-full h-full">
          <source src="/videos/demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}
      </div>
    </div>
  </div>
</section>
```

---

## ✅ **Checklist**

- [ ] OBS Studio installed and configured
- [ ] Test recording successful
- [ ] Demo environment prepared (test account, templates imported)
- [ ] Script written and practiced
- [ ] Full demo recorded (90 seconds)
- [ ] Video edited in CapCut (captions, music, text overlays)
- [ ] Video exported in 1080p
- [ ] Video uploaded to YouTube (unlisted)
- [ ] Embed code copied
- [ ] Desktop.tsx updated with video
- [ ] Changes committed and pushed to GitHub

---

## 🎯 **Quick Tips**

**Recording:**
- Speak 20% slower than normal
- Pause between sentences
- Smile while talking (it shows in your voice!)
- If you mess up, pause 3 seconds, then restart that sentence

**Editing:**
- Cut out all "um", "uh", long pauses
- Speed up slow parts (page loads, typing)
- Keep it under 90 seconds
- Add captions for accessibility

**Audio:**
- Record in a quiet room
- Use a USB microphone if possible (but built-in is fine)
- Speak 6-12 inches from microphone
- Background music at 20% volume

---

## 🆘 **Troubleshooting**

**OBS not recording audio:**
- Settings → Audio → Check microphone is selected
- Windows: Right-click speaker icon → Sounds → Recording → Enable microphone

**Video is laggy:**
- Settings → Output → Lower bitrate to 2500
- Settings → Video → Lower FPS to 24

**File size too large:**
- CapCut → Export → Quality: Medium
- Or use HandBrake to compress: https://handbrake.fr/

**Voice sounds bad:**
- Use Audacity to enhance:
  - Effect → Noise Reduction
  - Effect → Normalize
  - Effect → Compressor

---

**You're ready to record! Follow this guide step-by-step and you'll have a professional demo video in 2-3 hours! 🎬**

