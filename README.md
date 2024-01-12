# Airtable Scripts

Scripts intended for use inside of Airtable's automation and extension scripting environments.

## Directory Structure

### `/automations`

The `/automations` directory is structured with two subdirectories: `/pkgs` and `/util`.<br>
The `/pkgs` directory contains information needed to configure an entire Airtable automation workflow, these are referred to as packages.<br>
Each package contains a `README.md` that outlines the configuration instructions and requirements for deploying the automation package to your Airtable base.

The `/util` directory contains individual utility scripts that are more isolated in their scope, and therefore do not require the overall execution context
needed by the scripts found in packages.<br>
For specific information about each script found in the `/util` directory, refer to the `README.md` found within the directory.

### `/extensions`

The `/extensions` directory structure mimics the structure of `/automations`. However, the `/extensions` directory
