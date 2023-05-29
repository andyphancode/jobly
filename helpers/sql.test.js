const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
    test("update one item, js-to-sql two columns", function () {
        const result = sqlForPartialUpdate (
            { test: "value" },
            { test: "test", testTwo: "test_two"}
        );
        expect(result).toEqual({
            setCols: "\"test\"=$1",
            values: ["value"]
        });
    });

    test("update two item, js-to-sql one column", function () {
        const result = sqlForPartialUpdate (
            { test: "value", testTwo: "value2" },
            { testTwo: "test_two"}
        );
        expect(result).toEqual({
            setCols: "\"test\"=$1, \"test_two\"=$2",
            values: ["value","value2"]
        });
    });
});