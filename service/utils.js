function filterArrays(obj, days) {
    for (let key in obj) {
        if (Array.isArray(obj[key])) {
            if (obj[key].length && key !== 'warehouses') {
                obj[key] = obj[key].filter(item => {
                    const date = item.date ? new Date(item.date) : item.lastChangeDate ? new Date(item.lastChangeDate) : new Date(item.create_dt);
                    const weekAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
                    return date >= weekAgo;
                });
            }
        }
    }
    return obj
}


module.exports = { filterArrays }