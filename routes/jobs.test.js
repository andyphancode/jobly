"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    test("ok for admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(
                {
                    title: "newJob",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1"
                }
            )
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "newJob",
                salary: 1,
                equity: "0.1",
                companyHandle: "c1"    
            }
        });
    });

    test("not ok for user (unauth)", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(
                {
                    title: "newJob",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1"
                }
            )
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

  test("bad request with missing data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
            title: "newJob"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            title: "newJob",
            salary: -1000,
            equity: "0.1",
            companyHandle: "c1"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

});

/************************************** GET /jobs */

describe("GET /jobs", function () {

    test("ok for anon", async function () {
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
            jobs:
            [
                {
                    id: testJobIds[0],
                    title: "J1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1"
                },
                {
                    id: testJobIds[1],
                    title: "J2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c2"
                },
                {
                    id: testJobIds[2],
                    title: "J3",
                    salary: 3,
                    equity: null,
                    companyHandle: "c3"
                }
            ]
        });
    });

    test("works: filter (min)", async function() {
        const resp = await request(app)
            .get("/jobs")
            .query({ minSalary: 3 });
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: testJobIds[2],
                    title: "J3",
                    salary: 3,
                    equity: null,
                    companyHandle: "c3"
                }
            ]
        });
    });

    test("works: filter (hasEquity)", async function() {
        const resp = await request(app)
            .get("/jobs")
            .query({ hasEquity: true });
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: testJobIds[0],
                    title: "J1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1"
                },
                {
                    id: testJobIds[1],
                    title: "J2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c2"
                }
            ]
        });
    });

    test("works: filter (name)", async function() {
        const resp = await request(app)
            .get("/jobs")
            .query({ title: "1" });
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: testJobIds[0],
                    title: "J1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1"
                }
            ]
        });
    });

    test("works: filter (all)", async function() {
        const resp = await request(app)
            .get("/jobs")
            .query({ title: "1", minSalary: 1, hasEquity: true });
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: testJobIds[0],
                    title: "J1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1"
                }
            ]
        });
    });

    test("bad request on wrong filter", async function() {
        const resp = await request(app)
            .get("/jobs")
            .query({ hello: "1" });
        expect(resp.statusCode).toEqual(400)
    });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
    test("works for anon", async function () {
        const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
        expect(resp.body).toEqual({
            job: {
                id: testJobIds[0],
                title: "J1",
                salary: 1,
                equity: "0.1",
                companyHandle: "c1",
                company: {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img",
                },
            },
        });
    });
  
    test("not found for no such job", async function () {
        const resp = await request(app).get(`/jobs/0`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
    test("works for admins", async function() {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "newJobTitle"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            job: {
                id: testJobIds[0],
                title: "newJobTitle",
                salary: 1,
                equity: "0.1",
                companyHandle: "c1"
            }
        });
    });

    test("unauth for anon", async function() {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "newJobTitle"
            })
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for non-admin user", async function() {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "newJobTitle"
            })
            .set("authorization", `Bearer ${u1Token}`);
            expect(resp.statusCode).toEqual(401);
    });

    test("not found on no such job", async function () {
        const resp = await request(app)
            .patch(`/jobs/0`)
            .send({
                title: "newJobTitle",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });  

    test("bad request on id change attempt", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                id: 96969696969
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on invalid data", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                salary: "wrong"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
    test("works for admin", async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({ deleted: testJobIds[0] });
    });
  
    test("unauth for non-admin users", async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });
  
    test("unauth for anon", async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`);
        expect(resp.statusCode).toEqual(401);
    });
  
    test("not found for no such job", async function () {
        const resp = await request(app)
            .delete(`/jobs/0`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });
});