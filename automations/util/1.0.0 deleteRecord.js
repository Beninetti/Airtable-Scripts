const ScriptConfig = { TABLE_ID: "" };
const { recordId } = input.config();

await base.getTable(ScriptConfig.TABLE_ID).deleteRecordAsync(recordId);