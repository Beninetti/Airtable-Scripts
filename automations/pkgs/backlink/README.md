# Backlink

This automation configuration adds backlink functionality to Airtable records.<br>
Airtable allows users to define dependencies within the same table, but the relationship is only visible from the record where the dependency was created.

Refer to the following schema:

```text
       /---- Parent (Linked Record)
Record
       \---- Children (Linked Record(s))
```

If a record (A) defines relationships with records (B) and (C) in (A)'s _Children_ field,<br>
(B) and (C)'s _Parent_ field remains empty, despite the fact that they are actually related.

This automation bridges the gap and insures that bidirectional relationships are accurately reflected without requiring manual updates.

**Note**: At this time, only one parent relationship is permitted per record. Multiple child relationships are permitted.

# Automation Schema

```text
      Trigger |-----When a record is updated
              |
      Actions |-----None
              |
Cond. Actions |---\
              |    \-----Group 1---\
              |                     |---parentRoute.js
              |                     |---childRoute.js
```

# Field Requirements

### `Parent Record`

-   Type: [`multipleRecordLinks`](https://airtable.com/developers/scripting/api/cell_values#multiple-record-links)
    -   Configuration
        -   `Allow linking to multiple records` = `false`
        -   `Limit record selection to a view` = `false`

### `Child Records`

-   Type: [`multipleRecordLinks`](https://airtable.com/developers/scripting/api/cell_values#multiple-record-links)
    -   Configuration
        -   `Allow linking to multiple records` = `true`
        -   `Limit record selection to a view` = `false`

The `Child Records` field relates to the same table you are creating the field on.

### `Parent/Child Last Modified By`

-   Type: [`lastModifiedBy`](https://airtable.com/developers/scripting/api/cell_values#last-modified-by)
    -   Configuration
        -   Fields: [`Parent Record`, `Child Records`]

In order to prevent an endless automation loop, the `Parent/Child Last Modified By` field allows the automation to determine whether any further action is needed
based on whether an automation made the last edit to the `Parent Record` or `Child Records` fields.<br>

# Configuration

## Trigger

-   **Type**: `When record updated`
    -   **Table**: Select the table containing the [`Parent Record`, `Child Records`, `Parent/Child Last Modified By`] fields.
    -   **View**: `Undefined`
    -   **Fields**: [`Parent Record`, `Child Records`]

## Actions

This automation does not use unconditional actions.

## Conditional Action Groups

### Group 1

-   **Condition(s)**: `Parent/Child Last Modified By` { is none of } `Automations`.
-   **Actions**:
    -   `parentRoute.js`
    -   `childRoute.js`

# Scripts

## `parentRoute.js`

### Abstract

`parentRoute.js` treats the trigger record as a child record.<br>
If the trigger record has a parent defined in the `Parent Record` field, the script will examine the declared parent record's `Child Records` field
to verify that the trigger record is correctly referenced. If the trigger is not correctly referenced, the trigger record is added to the declared parent's
`Child Records` field.

The script will also search for any records whose `Child Records` field contains a reference to the trigger record, but are not declared in the trigger's `Parent Record` field.<br>
Records returned from this search are known as "Step-Parents".

If any step-parents are found, the script will update the records to remove the trigger from each step-parent's `Child Records` field.

### Input Dependencies

-   `recordId: string` - The record ID of the record that triggered the automation.

### `ScriptConfig`

```typescript
{
  TABLE_NAME: string,
  TABLE_ID: string,
  PARENT_FIELD_NAME_OR_ID: string,
  CHILD_FIELD_NAME_OR_ID: string
}
```

-   `TABLE_NAME`: The name of the desired table. **Must be camel cased**.
-   `TABLE_ID`: The ID of the desired table.
-   `PARENT_FIELD_NAME_OR_ID`: The ID or name of the `Parent Record` field.
    -   **It is highly recommended to use the field ID.**
-   `CHILD_FIELD_NAME_OR_ID`: The ID or name of the `Child Records` field.
    -   **It is highly recommended to use the field ID.**

## `childRoute.js`

### Abstract

The `childRoute.js` script treats the trigger record as a parent.
If the trigger record has children defined in its `Child Records` field, the script will examine the declared children's `Parent Record` fields
to verify that the trigger record is correctly referenced as the record's parent.<br>
If the trigger is not correctly referenced, and **the child record's `Parent Record` field is empty**, the trigger record is written to the child record's `Parent Record` field.

The script will also search for any records whose `Parent Record` field references the trigger record, but are not declared in the trigger's `Child Records` field.<br>
Records returned from this search as known as "Step-Children".

If any step-children are found, the script will update the records to remove the trigger from each step-child's `Parent Record` field.

### Input Dependencies

-   `recordId: string` - The record ID of the record that triggered the automation.

### `ScriptConfig`

```typescript
{
  TABLE_NAME: string,
  TABLE_ID: string,
  PARENT_FIELD_NAME_OR_ID: string,
  CHILD_FIELD_NAME_OR_ID: string
}
```

-   `TABLE_NAME`: The name of the desired table. **Must be camel cased**.
-   `TABLE_ID`: The ID of the desired table.
-   `PARENT_FIELD_NAME_OR_ID`: The ID or name of the `Parent Record` field.
    -   **It is highly recommended to use the field ID.**
-   `CHILD_FIELD_NAME_OR_ID`: The ID or name of the `Child Records` field.
    -   **It is highly recommended to use the field ID.**
