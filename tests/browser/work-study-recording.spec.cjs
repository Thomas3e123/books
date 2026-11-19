const { test, expect } = require('@playwright/test');

test('Work Study saves a recording and marker, exports them and checks the transcription limit', async ({ page }) => {
  // Supply a real audio track without depending on a CI runner's microphone.
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const context = new AudioContext();
      const tone = context.createOscillator();
      const destination = context.createMediaStreamDestination();
      tone.connect(destination);
      tone.start();
      await context.resume();
      return destination.stream;
    };
  });
  await page.goto('/gravity-work-study-lab.html');
  await page.locator('#wsrec-start').click();
  await expect(page.locator('#wsrec-status')).toContainText('Recording.');
  await page.locator('#wsrec-note').fill('Practice order ready');
  await page.locator('#wsrec-mark').click();
  await page.locator('#wsrec-stop').click();
  await expect(page.locator('#wsrec-status')).toContainText('1 markers');
  await page.reload();
  await expect(page.locator('#wsrec-history option').first()).toContainText('1 markers');
  const download = page.waitForEvent('download');
  await page.locator('#wsrec-portable-export').click();
  const stream = await (await download).createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const recording = JSON.parse(Buffer.concat(chunks).toString());
  expect(recording.marks[0].note).toBe('Practice order ready');
  expect(recording.audioBase64.length).toBeGreaterThan(0);

  await page.locator('#wsreview-consent').check();
  recording.audioBase64 = Buffer.alloc(4 * 1024 * 1024 + 1).toString('base64');
  await page.locator('#wsrec-portable-import').setInputFiles({
    name: 'practice.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(recording))
  });
  await expect(page.locator('#wsrec-status')).toContainText('Imported audio');
  await expect(page.locator('#wsrec-history option')).toHaveCount(2);
  await expect(page.locator('#wsreview-consent')).not.toBeChecked();
  let uploads = 0;
  await page.route('**/.netlify/functions/work-study-transcribe', route => {
    uploads++;
    return route.abort();
  });
  await page.locator('#wsreview-consent').check();
  await page.locator('#wsreview-analyze').click();
  await expect(page.locator('#wsreview-status')).toContainText('4 MB transcription limit');
  expect(uploads).toBe(0);
});
