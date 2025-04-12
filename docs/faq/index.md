# FAQ

New to Open Healthcare Network? This FAQ section addresses common issues and provides links to official documentation to help you get started smoothly.

## Project Documentation Links

### Core Repositories

- **Backend (Care)**: [README](https://github.com/ohcnetwork/care?tab=readme-ov-file#self-hosting)
- **Frontend (Care FE)**: [README](https://github.com/ohcnetwork/care_fe?tab=readme-ov-file#getting-started)

### Plugins

1. **ABDM (Ayushman Bharat Digital Mission)**
   - [Backend Documentation](https://github.com/ohcnetwork/care_abdm?tab=readme-ov-file#getting-started)
   - [Frontend Documentation](https://github.com/ohcnetwork/care_abdm_fe?tab=readme-ov-file#getting-started)

2. **Scribe (Voice Assistant)**
   - [Backend Documentation](https://github.com/ohcnetwork/care_scribe?tab=readme-ov-file#installation)
   - [Frontend Documentation](https://github.com/ohcnetwork/care_scribe_fe)

3. **HCX (Health Claims Exchange)**
   - [Backend Documentation](https://github.com/ohcnetwork/care_hcx)
   - [Frontend Documentation](https://github.com/ohcnetwork/care_hcx_fe)

## Common Setup Issues

### Backend Setup Issues

1. **Creating a Superuser**
   - To create an admin user for accessing the Django admin panel, run:
     ```
     docker compose exec backend bash -c "python manage.py createsuperuser"
     ```
   - Follow the prompts to set username, email, and password

2. **Loading Initial Data**
   - To load seed data for testing and development:
     ```
     make load-seed-data
     ```
   - If `make load-seed-data` doesn't work, try:
     ```
     docker compose exec backend bash -c "python manage.py load_govt_organization --state kerala --load-districts --load-local-bodies --load-wards"
     ```

3. **Syncing Organization Roles and Permissions**
   - If you're experiencing permission issues, run:
     ```
     python manage.py sync_permissions_roles
     ```
   - This ensures that all roles have the correct permissions assigned

4. **Container Health Issues**
   - If you see "care container unhealthy" error:
     - Check container logs to identify specific errors:
       ```
       docker logs <container_name>
       ```
     - Try a complete teardown and rebuild:
       ```
       make teardown
       make up
       ```
     - This often resolves configuration and dependency issues

### Frontend Setup Issues

1. **Node Version Compatibility**
   - The projects require Node.js 22
   - Use nvm to manage Node versions:
     ```
     nvm install 22
     nvm use 22
     ```
   - Check your current version with `node -v`

2. **Dependency Installation Issues**
   - If facing peer dependency conflicts:
     ```
     npm install --legacy-peer-deps
     ```
   - For persistent installation failures:
     ```
     npm cache clean --force
     rm -rf node_modules
     npm install
     ```

3. **API Connection Issues**
   - If you're connecting with the backend, make sure:
     - Backend server is running before starting the frontend
     - The environment variable in `.env` is correctly set:
       ```
       REACT_CARE_API_URL=http://127.0.0.1:9000
       ```

4. **Build Errors**
   - If encountering TypeScript errors, run:
     ```
     npm run lint-fix
     ```

### Plugin Setup Issues

For more specific issues, please refer to the GitHub repositories or reach out to the community on our Slack channel.
