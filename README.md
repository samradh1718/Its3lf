# ITS3LF landing page

A standalone, responsive single-page website. Open `index.html` directly, or serve this folder:

```powershell
cd landingPage
python -m http.server 5500
```

Then visit http://localhost:5500. No build or dependencies are required. Fonts load from Google Fonts with local sans-serif fallbacks.

Includes the supplied logo, original CSS/SVG shopping artwork, section navigation, scroll reveals, an interactive three-stage phone preview, FAQs and reduced-motion support. Phone screens are illustrations, not a connection to the shopping backend. Copy follows the current app's store selection, scanning and online/cash payment flow.

Before launch, replace the app availability message with actual published download links. No store partnerships or download destinations have been invented.

The 36-second illustrated explainer lives in `explainer.js` and `explainer.css`. It uses original inline SVG artwork and a requestAnimationFrame timeline, with play/pause, replay, seeking and seven chapter controls. Playback pauses outside the viewport and in background tabs. Playback starts on a user click; reduced-motion users see static scene transitions when playing. This is an in-browser animation, not an MP4.

English AI narration is stored in `assets/its3lf-narration-en.mp3` (Microsoft en-IN-NeerjaNeural). The audio clock drives the animation; mute, pause, replay, seeking, off-screen pauses and background-tab pauses stay synchronized. No speech API is called by the website. The brand is pronounced "Itself". Generated lines are timed to a six-second opening and six five-second scenes. If audio fails to load, the captioned animation remains playable.

Narration transcript:
- 00:00 Welcome to Itself. Walk into a participating store, and shop your way.
- 00:06 Open Itself. Choose your store, or scan its store Q R code.
- 00:11 Scan a product barcode. Your pick goes straight into your digital basket.
- 00:16 All picked? Review your products and check the total before you pay.
- 00:21 Pay online, or choose cash and pay at the store counter.
- 00:26 Payment complete. Show your exit Q R to store staff for verification.
- 00:31 Itself. Scan, pay and go. Enjoy your day.
