const ScriptConfig = {
    TABLE_NAME: "",
    TABLE_ID: "",
    PARENT_FIELD_NAME_OR_ID: "",
    CHILD_FIELD_NAME_OR_ID: ""
}

const { recordId } = input.config();

const tables = {
    [ScriptConfig.TABLE_NAME]: base.getTable(ScriptConfig.TABLE_ID)
};

const fields = {
    [ScriptConfig.TABLE_NAME]: {
        parent: ScriptConfig.PARENT_FIELD_NAME_OR_ID,
        children: ScriptConfig.CHILD_FIELD_NAME_OR_ID
    }
};

const table = tables[ScriptConfig.TABLE_NAME], tableFields = fields[ScriptConfig.TABLE_NAME];

// Finds all records with a parent relationship with the trigger record.
function getParentPool (trigger, records, excludedParentId = "") {

    let parentPool = records.filter((rec) => {
        let childRecordIds = rec.getCellValue(tableFields.children)
            .map(rec => rec.id);
        return childRecordIds.includes(trigger.id) && rec.id !== excludedParentId;
    });

    return parentPool.length ? parentPool : false;
}

async function updateParents (parents, removalId) {

    let parentUpdates = parents.map((rec) => ({
        id: rec.id,
        fields: {
            [tableFields.children]: [...rec.getCellValue(tableFields.children).filter(r => r.id !== removalId)]
        }
    }));

    while (parentUpdates.length) {
        table.updateRecordsAsync(parentUpdates.splice(0, 50));
    }
}

async function updateParent (parent, trigger) {

    let parentRecord = await table.selectRecordAsync(parent.id);
    // @ts-ignore
    let childFieldValue = parentRecord.getCellValue(tableFields.children);
    childFieldValue === null ? childFieldValue = [trigger] : childFieldValue = [...childFieldValue, trigger];

    // @ts-ignore
    return table.updateRecordAsync(parentRecord.id, {
        [tableFields.children]: [...new Set(childFieldValue.map(rec => rec.id))].map(e => ({ id: e }))
    })
}

const { records, trigger } = await (async () => {
    return table.selectRecordsAsync({ fields: Object.values(tableFields) })
        .then(query => query.records)
        .then((records) => ({
            records: records.filter((r) => r.id !== recordId),
            trigger: records.find((r) => r.id === recordId)
        }))
})();


// Get all records with child relationships
let allParents = records.filter((rec) => rec.getCellValue(tableFields.children) !== null);

// Result object containing a boolean value of whether the trigger record has a linked parent, and the linked parent if one exists.
let hasParent = ((rec) => {

    // @ts-ignore
    let value = rec.getCellValue(tableFields.parent);

    return value === null ? { result: false } : { result: true, parent: value[0] };

})(trigger);


// This route runs if the trigger record is linked to a parent.
if (hasParent.result) {

    let linkedParent = hasParent.parent;
    let parentPool = getParentPool(trigger, allParents, linkedParent.id);

    // Update old parent record(s) to unlink the trigger record as a child
    if (Array.isArray(parentPool) && parentPool.length)
        await updateParents(parentPool, recordId);

    // Update the parent record to ensure that the trigger record is linked in the parent's child relationships
    if (parentPool === false)
        await updateParent(linkedParent, trigger)

}

// This route runs if the trigger record is not linked to a parent
if (hasParent.result === false) {

    let parentPool = getParentPool(trigger, allParents);

    // If parentPool is an array, then there are lingering parent records.
    // Update all parents to remove the trigger if linked in their child fields.
    if (Array.isArray(parentPool))
        await updateParents(parentPool, recordId);

}