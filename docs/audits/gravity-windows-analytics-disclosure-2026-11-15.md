# Windows preview analytics disclosure — November 15, 2026

## Finding

All four current Windows candidate applications load Google Analytics 4 after packaging. They send a persistent random installation ID, product and version identifiers, generic app-open/button/form events, and periodic recent-activity events. Google Analytics standard collection may additionally process browser/device details and approximate location. The Windows download page described the custom event fields but did not clearly name Google Analytics or disclose that standard collection.

## Repair

Updated all four preview notices on `site/windows-programs.html` and the Windows analytics section of `site/privacy.html` to identify Google Analytics 4, the custom event fields, standard browser/device and approximate-location collection, and the current Do Not Track / launch-variable exclusions. Added links to Google's official data-collection explanations. Updated the two source hashes in `source-manifest.json`.

The app code and telemetry behavior were not changed. No build, browser test, release, or deployment was performed.
