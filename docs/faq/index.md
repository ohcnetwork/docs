# Frequently Asked Questions

Welcome to **Open Healthcare Network**! This FAQ section addresses common questions and provides solutions to help you get started smoothly.

## Project Overview

### What are the main components of the Open Healthcare Network?

The Open Healthcare Network consists of two core repositories:

- **Backend (Care)**: [README](https://github.com/ohcnetwork/care)
- **Frontend (Care FE)**: [README](https://github.com/ohcnetwork/care_fe)

### What plugins are available?

| Plugin                                                  | Backend                                                                    | Frontend                                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **ABDM** (Ayushman Bharat Digital Mission)              | [care_abdm](https://github.com/ohcnetwork/care_abdm)                       | [care_abdm_fe](https://github.com/ohcnetwork/care_abdm_fe)                       |
| **HCX** (Health Claims Exchange)                        | [care_hcx](https://github.com/ohcnetwork/care_hcx)                         | [care_hcx_fe](https://github.com/ohcnetwork/care_hcx_fe)                         |
| **Scribe** (Voice Assistant)                            | [care_scribe](https://github.com/ohcnetwork/care_scribe)                   | [care_scribe_fe](https://github.com/ohcnetwork/care_scribe_fe)                   |
| **TeleICU Devices** (Remote ICU Monitoring Integration) | [care_teleicu_devices](https://github.com/ohcnetwork/care_teleicu_devices) | [care_teleicu_devices_fe](https://github.com/ohcnetwork/care_teleicu_devices_fe) |
| **LiveKit** (Real-time Communication)                   | [care_livekit](https://github.com/ohcnetwork/care_livekit)                 | [care_livekit_fe](https://github.com/ohcnetwork/care_livekit_fe)                 |
| **Ayushma** (AI Assistant)                              | [ayushma](https://github.com/ohcnetwork/ayushma)                           | [ayushma_fe](https://github.com/ohcnetwork/ayushma_fe)                           |

## Backend Setup

### How do I load initial data for development?

You can load development and test fixtures in two ways:

1. Using make:

```bash
make load-fixtures
```

2. Using Docker directly:

```bash
docker compose exec backend bash -c "python manage.py load_fixtures"
```

### How do I load location-specific government organization data?

To load data for a specific state (e.g., Kerala), use:

```bash
docker compose exec backend bash -c "python manage.py load_govt_organization --state kerala --load-districts --load-local-bodies --load-wards"
```

### How do I create a superuser account?

To create a superuser for accessing the Django admin interface:

```bash
docker compose exec backend bash -c "python manage.py createsuperuser"
```

Follow the prompts to enter username, email, and password.

### How do I fix permission and role issues?

If you encounter access or permission issues, run:

```bash
python manage.py sync_permissions_roles
```

This ensures that user roles are correctly mapped to permissions.

### What should I do if the backend container is unhealthy?

1. Check the logs for error messages:

```bash
docker logs <container_name>
# Example:
docker logs care-backend-1
```

2. Open the Django shell for debugging:

```bash
docker exec -it <container_name> python manage.py shell
# Example:
docker exec -it care-backend-1 python manage.py shell
```

3. Rebuild and restart the services:

```bash
make teardown
make up
```

## Frontend Setup

### What Node.js version is required?

The frontend projects require **Node.js 22**. Use `nvm` to install and switch versions:

```bash
nvm install 22
nvm use 22
```

To verify the active Node version:

```bash
node -v
```

**Note**: Always sync with the latest **develop** branch before starting frontend work.

### How do I resolve dependency installation issues?

If you see peer dependency warnings or install failures:

1. Try installing with legacy peer deps:

```bash
npm install --legacy-peer-deps
```

2. If issues persist:

```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### How do I fix API connection issues?

1. Ensure the backend server is running
2. Check your `.env` file in the frontend project:

```env
REACT_CARE_API_URL=http://127.0.0.1:9000
```

### How do I fix build errors?

If you encounter TypeScript errors or linting issues:

```bash
npm run lint-fix
```

### What should I do if Cypress tests are failing?

Cypress test failures are often specific to individual PRs and may not indicate a broader issue with your local setup. If you encounter failing Cypress tests:

1. **Check if tests pass locally**:

   ```bash
   npm run cypress:run
   ```

2. **Run tests in interactive mode for debugging**:

   ```bash
   npm run cypress:open
   ```

3. **If tests fail consistently**, discuss the issue in the [Slack community](https://slack.ohc.network) - the community can help identify if it's a known issue or specific to your PR.

**Note**: Many Cypress failures are flaky tests that pass on retry. If tests fail in CI but pass locally, it's often a timing or environment issue rather than a code problem.

## Plugin Setup

### How do I set up a plugin?

Most plugins follow this pattern in `plug_config.py`:

```python
plugin_name = Plug(
    name="plugin_name",
    package_name="git+https://github.com/ohcnetwork/plugin_repo.git",
    version="@master",  # or specific version
    configs={},  # plugin-specific settings
)
plugs = [plugin_name]
```

### How do I develop plugins locally?

1. Update `plug_config.py`:

```python
plugin_name = Plug(
    name="plugin_name",
    package_name="/app/plugin_folder",
    version="",
    configs={},
)
```

2. In `plugs/manager.py`, install in editable mode:

```python
subprocess.check_call(
    [sys.executable, "-m", "pip", "install", "-e", *packages]
)
```

3. Rebuild and restart the containers:

```bash
make re-build
make up
```

### What should I do if a plugin isn't loading?

For backend plugins:

- Ensure the plugin name matches the Django app name
- Verify the path or repository URL is correct
- Check that all required environment variables are configured

For frontend plugins:

- Verify you're using the correct Node.js version
- In `care_fe/.env`, ensure the plugin is added to `REACT_ENABLED_APPS`:

```env
REACT_ENABLED_APPS="ohcnetwork/plugin_name_fe@localhost:5173"
```

- Make sure the plugin dev server is running on the expected port

## Learning Resources

### What learning resources are available?

1. **Docker and Container Technology**

   - [Docker Crash Course for Beginners](https://www.youtube.com/watch?v=0UG2x2iWerk)

2. **OHC School Courses**
   - [Care Systems 101](https://school.ohc.network/courses/357) - Overview of Care platform fundamentals
   - [Django For All](https://school.ohc.network/courses/1844) - Learn Django for backend development
   - [React For All](https://school.ohc.network/courses/1843) - Learn React for frontend development
