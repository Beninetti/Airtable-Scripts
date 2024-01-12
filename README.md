# Airtable Scripts

Scripts intended for use inside of Airtable's automation and extension scripting environments.

# Directory Structure

## `/automations`

The `/automations` directory is structured with two subdirectories: `/pkgs` and `/util`.<br>
The `/pkgs` directory contains information needed to configure an entire Airtable automation workflow, these are referred to as packages.<br>
Each package contains a `README.md` that outlines the configuration instructions and requirements for deploying the automation package to your Airtable base.

The `/util` directory contains individual utility scripts that are more isolated in their scope, and therefore do not require the overall execution context
needed by the scripts found in packages.<br>
For specific information about each script found in the `/util` directory, refer to the `README.md` found within the directory.

## `/extensions`

The `/extensions` directory contains individual `.js` scripts that may be pasted directly into an empty Airtable scripting extension IDE.

Instructions for configuration and general purpose documentation for each script may be found in `/extensions/README.md`.

Scripts are named using the [semantic versioning](https://semver.org/#summary) standard: `<MAJOR>.<MINOR>.<PATCH>`<br>

- Major: Foundational changes to the overall script.
- Minor:
  - Change(s) to underlying logic.
  - Change(s) to the execution flow. 
  - Expanded script functionality to account for additional use cases or scenarios. 
- Patch:
  - Bug fixes 
  - Refinements and optimizations that bolster the overall reliability and flexibility of the script. 

### Example

```text
- 1.0.0 script.js
        1.0.1 => Added type checking for lookup field values
        1.0.2 => Optimized bulk record update actions
    1.1.0 => Added async timeout error handling.
        1.1.1 => Fixed bug that caused records with null values to be duplicated.
```

