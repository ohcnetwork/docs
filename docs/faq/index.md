# FAQ

Welcome to **Open Healthcare Network**! This section addresses common setup issues and provides documentation links to help you get started smoothly.

---

## Project Documentation

### Core Repositories

- **Backend (Care)**: [README](https://github.com/ohcnetwork/care)
- **Frontend (Care FE)**: [README](https://github.com/ohcnetwork/care_fe)

### Plugins

| Plugin                                                  | Backend                                                                    | Frontend                                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **ABDM** (Ayushman Bharat Digital Mission)              | [care_abdm](https://github.com/ohcnetwork/care_abdm)                       | [care_abdm_fe](https://github.com/ohcnetwork/care_abdm_fe)                       |
| **HCX** (Health Claims Exchange)                        | [care_hcx](https://github.com/ohcnetwork/care_hcx)                         | [care_hcx_fe](https://github.com/ohcnetwork/care_hcx_fe)                         |
| **Scribe** (Voice Assistant)                            | [care_scribe](https://github.com/ohcnetwork/care_scribe)                   | [care_scribe_fe](https://github.com/ohcnetwork/care_scribe_fe)                   |
| **TeleICU Devices** (Remote ICU Monitoring Integration) | [care_teleicu_devices](https://github.com/ohcnetwork/care_teleicu_devices) | [care_teleicu_devices_fe](https://github.com/ohcnetwork/care_teleicu_devices_fe) |
| **LiveKit** (Real-time Communication)                   | [care_livekit](https://github.com/ohcnetwork/care_livekit)                 | [care_livekit_fe](https://github.com/ohcnetwork/care_livekit_fe)                 |
| **Ayushma** (AI Assistant)                              | [ayushma](https://github.com/ohcnetwork/ayushma)                           | [ayushma_fe](https://github.com/ohcnetwork/ayushma_fe)                           |

---

## Common Setup Issues

### Backend Setup Issues

#### 1. Loading Initial Data

To load development and test fixtures:

```bash
make load-fixtures
```

If that doesn't work, try running directly with Docker:

```bash
docker compose exec backend bash -c "python manage.py load_fixtures"
```

To load location-specific government organization data (e.g., Kerala):

```bash
docker compose exec backend bash -c "python manage.py load_govt_organization --state kerala --load-districts --load-local-bodies --load-wards"
```

#### 2. Creating a Superuser

To access the Django admin interface, create a superuser:

```bash
docker compose exec backend bash -c "python manage.py createsuperuser"
```

Follow the prompts to enter username, email, and password.

#### 3. Syncing Organization Roles and Permissions

If you encounter access or permission issues, run:

```bash
python manage.py sync_permissions_roles
```

This ensures that user roles are correctly mapped to permissions.

#### 4. Container Health Issues

If Docker reports that the **care backend container is unhealthy**:

- Check the logs for error messages:

  ```bash
  docker logs <container_name>
  ```

  Example:

  ```bash
  docker logs care-backend-1
  ```

- Open the Django shell for debugging:

  ```bash
  docker exec -it <container_name> python manage.py shell
  ```

  Example:

  ```bash
  docker exec -it care-backend-1 python manage.py shell
  ```

- Rebuild and restart the services:

  ```bash
  make teardown
  make up
  ```

This can resolve configuration or dependency issues.

---

### Frontend Setup Issues

#### 1. Node Version Compatibility

The frontend projects require **Node.js 22**. Use `nvm` to install and switch versions:

```bash
nvm install 22
nvm use 22
```

To verify the active Node version:

```bash
node -v
```

#### 2. Dependency Installation Issues

If you see peer dependency warnings or install failures:

```bash
npm install --legacy-peer-deps
```

If issues persist:

```bash
npm cache clean --force
rm -rf node_modules
npm install
```

#### 3. API Connection Issues

Ensure the backend server is up and running before starting the frontend.
Also, check the `.env` file in your frontend project:

```env
REACT_CARE_API_URL=http://127.0.0.1:9000
```

#### 4. Build Errors

If you see TypeScript errors or linting issues:

```bash
npm run lint-fix
```

---

### Plugin Setup Issues

#### 1. Common Plugin Setup

Most plugins follow a similar pattern. In `plug_config.py`, add:

```python
plugin_name = Plug(
    name="plugin_name",
    package_name="git+https://github.com/ohcnetwork/plugin_repo.git",
    version="@master",  # or specific version
    configs={},  # plugin-specific settings
)
plugs = [plugin_name]
```

#### 2. Local Plugin Development

To develop plugins locally:

- Update `plug_config.py`:

  ```python
  plugin_name = Plug(
      name="plugin_name",
      package_name="/app/plugin_folder",
      version="",
      configs={},
  )
  ```

- In `plugs/manager.py`, install in editable mode:

  ```python
  subprocess.check_call(
      [sys.executable, "-m", "pip", "install", "-e", *packages]
  )
  ```

- Rebuild and restart the containers:

  ```bash
  make re-build
  make up
  ```

#### 3. Plugin Troubleshooting

- **Backend plugin not loading?**

  - Ensure the plugin name matches the Django app name.
  - Verify the path or repository URL is correct.
  - Check that all required environment variables are configured.

- **Frontend plugin issues?**

  - Check that the correct Node.js version is used.

  - In `care_fe/.env`, ensure the plugin is added to `REACT_ENABLED_APPS`:

    ```env
    REACT_ENABLED_APPS="ohcnetwork/plugin_name_fe@localhost:5173"
    ```

  - Make sure the plugin dev server is running on the expected port.

---

## Learning Resources

### Tools We Use

1. **Docker and Container Technology**
   - [Docker Crash Course for Beginners](https://www.youtube.com/watch?v=0UG2x2iWerk) - Basic tutorial to get started with Docker

### OHC School Courses

1. **Care Systems 101**

   - [Introduction to Care Systems](https://school.ohc.network/courses/357) - Overview of Care platform fundamentals

2. **Django For All**

   - [Django Development Course](https://school.ohc.network/courses/1844) - Learn Django for backend development

3. **React For All**
   - [React Development Course](https://school.ohc.network/courses/1843) - Learn React for frontend development
