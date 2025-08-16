const cds = require('@sap/cds');

const { Employee } = cds.entities;

module.exports = srv => {
     srv.on('READ', 'ReadEmpSet', async (req, resp) => {

        let results = await cds.transaction(req).run([
            SELECT.from(Employee)
        ]);    

        return results;

    }); 

    // CREATE
     srv.on('CREATE', 'CreateEmpSet', async (req, resp) => {
        try {
            const result = await cds.transaction(req).run(
                INSERT.into(Employee).entries(req.data)
            );

            // result is usually 1 if the insert worked
            if (result > 0) {
                return req.data; // Return created record
            } else {
                req.error(500, 'Failed to create');
            }
        } catch (err) {
            req.error(500, 'Server Error: ' + err.toString());
        }
    }); 

    // UDPATE

    srv.on('UPDATE', 'UpdateEmpSet', async (req) => {
        try {
            const designation = req.data.SALARY > 2000 ? 'Senior Employee' : 'Junior Employee';

            const result = await cds.transaction(req).run(
                UPDATE(Employee).set({
                    EMPNAME: req.data.EMPNAME,
                    GENDER: req.data.GENDER,
                    SALARY: req.data.SALARY,
                    Designation: designation
                }).where({ EMPID: req.data.EMPID })
            );

            if (result > 0) {
                return { ...req.data, Designation: designation };
            } else {
                req.error(404, 'Employee not found');
            }
        } catch (err) {
            req.error(500, 'Server Error: ' + err.toString());
        }
    });

    // Action: Promote an employee (changes data)
    srv.on('PromoteEmployee', async (req) => {    
     
       const empId = req.data.EMPID;
    // Update designation
    await UPDATE(Employee)
      .set({ DESIGNATION: 'CEO' })
      .where({ EMPID: empId });

        // Return updated record
       const updated = await SELECT.one.from(Employee).where({ EMPID: empId });
    return updated;
    });

    // Function: Return employees with salary above a threshold
    srv.on('HighSalaryEmployees', async (req) => {
        const SALARY = req.data.SALARY;
        const results = await SELECT.from(Employee).where`SALARY > ${SALARY}`;
        return results;
    });

}