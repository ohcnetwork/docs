# Setup Plug in CARE

This document explains how to set up and integrate backend and frontend plugins with the CARE system.

---

## Backend Plugin Configuration

Follow these steps to configure a backend plugin in your local CARE development environment:

### Step 1: Clone the Plugin Repository

Navigate to the root directory of your CARE project and clone your plugin repository:

```bash
cd care
git clone <your-plugin-repository-url>
```

### Step 2: Add Plugin Configuration

Update `plug_config.py` to include your plugin configuration:

```python
from plugs.manager import Plug

my_plugin = Plug(
    name="your_plugin_name",            # Django app name in the plugin
    package_name="/app/your_plugin_folder",  # Must be /app/ + plugin folder name
    version="",                         # Keep empty for local development
    configs={},                         # Additional plugin configurations (if any)
)

plugs = [my_plugin]  # Add your plugin to the plugs list
```

### Step 3: Install Plugin in Editable Mode

Edit the installation command in `plugs/manager.py` to enable editable installation mode for all packages:

```python
subprocess.check_call(
    [sys.executable, "-m", "pip", "install", *["-e", pkg for pkg in packages]]  # Include '-e' for editable mode
)
```

### Step 4: Rebuild Docker Image and Run Server

Execute the following commands to apply changes:

```bash
make re-build
make up
```

Your backend plugin should now be running locally along with CARE.

---

## Frontend Plugin Configuration

Frontend plugins integrate additional functionality into CARE's frontend UI. Follow these steps for local setup:

### Step 1: Clone the Repositories

Clone both CARE frontend and the plugin repositories:

```bash
git clone <care-frontend-repository-url>
git clone <your-plugin-frontend-repository-url>
```

### Step 2: Setup Plugin Frontend

Navigate into your frontend plugin directory, install dependencies, and run the server:

```bash
cd your_plugin_frontend
npm install
npm run start
```

### Step 3: Configure CARE Frontend

Navigate to the CARE frontend directory:

```bash
cd ../care_fe
```

Update the environment variable `REACT_ENABLED_APPS` to point to your running plugin server:

```bash
REACT_ENABLED_APPS="your-plugin-repository-name@localhost:5173"
```

Ensure `localhost:5173` matches your plugin frontend's running port.

### Step 4: Setup and Run CARE Frontend

Complete CARE frontend setup and start the development server:

```bash
npm run setup
npm install
npm run dev
```

Your frontend plugin is now integrated and running with CARE.

---

You have successfully set up backend and frontend plugins in your local CARE development environment.
