using { zempcudfioricustauth.db } from '../db/empmodel';

service catservice {

    @readonly
    entity ReadEmpSet as projection on db.Employee;

    @createonly
    entity CreateEmpSet as projection on db.Employee;

    @updateonly
    entity UpdateEmpSet as projection on db.Employee;

   // Action: Promote an employee (updates Designation)
  action PromoteEmployee(EMPID: Integer) returns String;

  // Function: Get employees with salary above a threshold
  function HighSalaryEmployees(SALARY: Decimal(13,2)) returns Decimal(13,12);

}
