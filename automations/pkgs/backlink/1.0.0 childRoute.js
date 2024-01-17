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

// @ts-ignore
const { records, trigger } = await (async () => {
    return table.selectRecordsAsync({ fields: Object.values(tableFields) })
        .then(query => query.records)
        .then((records) => ({
            records: records.filter(r => r.id !== recordId),
            trigger: records.find(r => r.id === recordId)
        }))
})();

// Filter all records with parent relationships
let allChildren = records.filter(r => r.getCellValue(tableFields.parent) !== null);


// Result object containing a boolean of whether the trigger record has linked children and the linked children if they exist.
let hasChildren = ((t) => {
    // @ts-ignore
    let childrenValue = t.getCellValue(tableFields.children);
    return childrenValue === null ? { result: false } : { result: true, children: childrenValue.map(r => r.id) };
})(trigger);


// Finds all records with a child relationship with the trigger record.
// Returns an array of record ids, otherwise false.
function getChildPool (trigger, allChildren, linkedChildrenIds = null) {

    let pool = (() => {
        return allChildren.filter((c) => c.getCellValue(tableFields.parent)[0].id === trigger.id)
    })();

    return pool.length ? pool : false;
}


async function updateChildren (children, trigger = null) {

    let fieldValue = trigger === null ? [] : [{ id: trigger.id }];
    let childUpdates = children.map(r => ({
        id: r.id,
        fields: { [tableFields.parent]: fieldValue }
    }));

    while (childUpdates.length) {
        table.updateRecordsAsync(childUpdates.splice(0, 50));
    }
}



// This route runs if the trigger record is linked to one or more children.
if (hasChildren.result) {

    let childrenIds = hasChildren.children;
    let children = ((records) => {
        let results = records.filter(r => r.getCellValue(tableFields.parent)?.[0]?.id === recordId || childrenIds.includes(r.id) );
        return results.length ? results : false;
    })(records);

    if (Array.isArray(children))
        await updateChildren(children, trigger);

}

// This route runs if the trigger record is not linked to any children.
if (hasChildren.result === false) {

    let childPool = getChildPool(trigger, allChildren);

    if (Array.isArray(childPool))
        await updateChildren(childPool);
}
