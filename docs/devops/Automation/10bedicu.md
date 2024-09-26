## `update_json.yml`

The `update_json.yml` workflow performs the following tasks:

1. **Run Scraper Scripts**:
   - Executes the scraper scripts stored in the `scraper` directory.

2. **Update JSON Files**:
   - Updates the JSON files located in the `data` directory:
     - `donors.json`
     - `hospital_status.json`
     - `hospitals.json`
     - `meta.json`
     - `pmu.json`

3. **Update Interval**:
   - The JSON files are updated at specified intervals or manually.

4. **Reflect Changes**:
   - Ensures that the updates are reflected on the 10bedICU website.

---
