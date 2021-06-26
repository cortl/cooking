const mapDataToRecipeType = (row) => ({
    title: row[0],
    rating: parseInt(row[1], 10),
    notes: row[2],
    url: row[3],
    skip: row[4]
})

const mapWithLog = (statement) => (stuff) => {
    console.log(statement(stuff));

    return stuff;
}

export {
    mapDataToRecipeType,
    mapWithLog
}