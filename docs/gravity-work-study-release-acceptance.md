# Gravity Work Study Lab — Release Acceptance Test
**Status:** NOT APPROVED FOR PUBLIC RELEASE  
**Deployment policy:** GitHub verification first; Netlify production builds paused until a reviewed release is authorized.

## Required test equipment
Windows 10/11 office computer; tablet running current Chrome or Edge; headset or microphone; internet access; a consenting volunteer in an area without customer conversations; a short (2–3 minute) demonstration of a routine work task. No real employee/customer audio should be sent to transcription unless proper permissions and notice are in place.

## A. Web Guided
1. Open /gravity-work-study-lab and start Guided once.
2. Confirm Gravity gives the specific first instruction and displays a usable next action.
3. Fill in the problem without guessing a cause. Continue.
4. Verify each succeeding screen has an explanation, input, next action, and back navigation.
5. Confirm Gravity uses Cedar voice and the application remains responsive.
**Pass:** first-time manager reaches an observation without assistance.

## B. Record + Mark
1. Start a new study and open Recorded Observation.
2. Grant microphone access; select Start Recording.
3. State aloud: “Starting pizza preparation.” Tap Mark Event.
4. After approximately 20 seconds, narrate a step change and tap Mark Event.
5. Record a waiting period; tap Mark Event with optional note.
6. Stop & Save; verify device-local session in the saved list.
7. Export audio and marker JSON; verify both files exist and audio plays.
8. Reload and confirm recording remains available.
**Pass:** local audio and markers survive reload; marker timestamps increase; export is complete. **Fail:** missing audio, markers, or crash.

## C. Transcription + Manager Review
1. Use a short consented test recording (<8 MB as the current feature limit).
2. Explicitly approve uploading this recording; choose Analyze Selected Recording.
3. Compare transcript text and timestamps with the audio; correct any inaccurate statements.
4. Check that no event is pre-approved. Select and approve only verified statements.
5. Export reviewed events. Confirm the original audio and raw markers remain intact.
6. Reload; export the complete .gravity-study.json study evidence package; verify the approved review sidecar is present.
7. Test transcription rejection/offline behavior: audio must remain saved locally after a failed request.
**Pass:** no fabricated observed facts; uncertainty is labeled; approval never overwrites original data. 
**Remaining design risk:** event timestamp is when the narration was spoken, not independently verified physical task time.

## D. Tablet ↔ Office
1. On the office web browser, create a study and a portable connection code.
2. On the tablet, join using that code, confirm matching study ID.
3. Make a change on the tablet; return to the original office browser; bring back latest.
4. Check evidence record and all unrelated studies remain unchanged.
5. Perform a conflicting change on both ends and check conflict handling; do not overwrite either copy.
6. Export an audio file and marker JSON from the tablet; verify they can be downloaded and opened at the office.
**Pass:** study synchronizes correctly without data loss. **Open gap:** raw audio currently is NOT synchronized through the device-link service; export/copy audio separately. Also verify access from a *different* office computer rather than assuming the original browser's local owner token follows login.

## E. Windows
1. Download the newest GitHub Actions Windows candidate artifact (not the older public beta).
2. Install on a real Windows PC.
3. Check Guided and Cedar spoken instructions.
4. Test microphone access, audio recording, marker save/reload, transcription, review, export, print and local backup.
5. Close and reopen Windows; confirm everything is still present.
6. Validate Windows microphone permissions and transcription with a real test clip.
**Pass:** uninterrupted audio workflow and durable records after app restart.

## F. Manuals
1. Start with a completely new manager and the full-color illustrated manual.
2. Follow each step without coaching. Mark every missing button name, screenshot or troubleshooting instruction.
3. Repeat from the black-and-white printable copy.
4. Confirm Windows-specific microphone permissions, tablet setup, consent, recording limits, cloud transcription disclosure, export and recovery procedures.
**Pass:** new manager completes a study using the manual alone.
**Current gap:** Work Study Lab's final color/B&W illustrated PDF and Word manuals have not been published and visually approved.

## Release decision
- [ ] GitHub source and production commit reconciliation
- [ ] All automated suites PASS
- [ ] Guided real-browser PASS
- [ ] Audio capture and markers PASS on tablet
- [ ] Cloud transcription test PASS
- [ ] Review and package preservation PASS
- [ ] Tablet/office study synchronization PASS
- [ ] Windows physical-device PASS
- [ ] Manuals accepted after real manager trial
- [ ] Security / privacy and consent review PASS
- [ ] Manual approval to resume Netlify build and deploy once

**The automated source presence test does not certify physical microphone, headset, consent compliance, or real tablet behavior. Do not report these as passed without evidence.**
