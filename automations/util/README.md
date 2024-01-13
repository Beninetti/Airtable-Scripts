# Automation Utilities

# Instructions

# Scripts

## `deleteRecord.js`

### Abstract

The native Airtable automation suite does not natively allow the destruction of records without the use of scripting or third-party
tools (Zapier, Make, Pipedream, etc.).

This automation allows creators to delete a single Airtable record using the Scripting API [`table.deleteRecordAsync`](https://airtable.com/developers/scripting/api/table#delete-record-async) method.<br>
This script's intended use case was to allow a user to request the deletion of a specific record using an Interface button.
The automation then has the ability to check whether the record can safely be deleted.

One of the biggest disadvantages to the  _Delete record_ Interface button action available in the Interface Designer is that there is not a way to prevent
users from deleting _any_ record they want using the native button, making the native delete feature a potentially
high-risk solution for allowing users to delete records.

### Input Dependencies

- `recordId: string` - The record ID of the record that triggered the automation.

### `ScriptConfig`

```typescript
{
    TABLE_ID: string
}
```

- `TABLE_ID`: The ID of the table that contains the trigger record.
