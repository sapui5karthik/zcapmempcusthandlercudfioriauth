using { zempcudfioricustauth.db } from '../db/empmodel';

service catservice {

    @readonly
    entity ReadEmpSet as projection on db.Employee;

    @createonly
    entity CreateEmpSet as projection on db.Employee;

    @updateonly
    entity UpdateEmpSet as projection on db.Employee;

}