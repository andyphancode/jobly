const { BadRequestError } = require("../expressError");


/**
 * SQL helper function that creates an object we can use to help create the SET
 * part of an update query. dataToUpdate contains the intended changes to the database,
 * jsToSql ensures the correct column names are targeted in the query. Not every column
 * has to be updated hence the partial update part of the function name.
 * 
 * @param {object} dataToUpdate - object with key:value pairs of new values to insert
 * @param {object} jsToSql - maps the JS equivalent of a SQL column name to the SQL database
 * column name. Example: {testColumn: "test_column"}
 * @returns {object} {sqlSetCols, dataToUpdate}
 * 
 * Example: sqlForPartialUpdate(
 * { test: "value1", testTwo: "v2"},
 * { testTwo: "test_two"}) returns
 * 
 * {setCols: ""test"=$1, "test_two" =$2", values = ["v1", "v2"]}
 * 
 * Note that the original data to update passes keys "test" and "testTwo" but jsToSql changes "testTwo" to "test_two" in
 * the final query
 */ 

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
