sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, MessageBox, JSONModel) => {
    "use strict";

    return Controller.extend("zcapmfioriauth.controller.View1", {
        onInit() {
        },
        _getTableData: async function () {
            const oModel = this.getOwnerComponent().getModel();
            const oListBinding = oModel.bindList('/ReadEmpSet');
            const aCtx = await oListBinding.requestContexts();
            const aEmp = aCtx.map(ctx => ctx.getObject());
            this._tableData(aEmp);


        },
        _tableData: function (jsonValues) {
            const oTable = this.byId("empTable");
            var oJSONModel = new JSONModel();
            jsonValues.length === undefined ? 
            oJSONModel.setData({ results: [jsonValues] }) : oJSONModel.setData({ results: jsonValues })

            oTable.setModel(oJSONModel);

            // Update table binding
            oTable.bindItems({
                path: "/results",
                template: new sap.m.ColumnListItem({
                    type: "Active",
                    //press: this.onSelect.bind(this),
                    cells: [
                        new sap.m.Text({ text: "{EMPID}" }),
                        new sap.m.Text({ text: "{EMPNAME}" }),
                        new sap.m.Text({ text: "{GENDER}" }),
                        new sap.m.Text({ text: "{SALARY}" }),
                        new sap.m.Text({ text: "{DESIGNATION}" })
                    ]
                })
            });


        },
        onSelect: function (oEvent) {
            const ctx = oEvent.getSource().getBindingContext();
            const data = ctx.getObject();
            this.empid = data.EMPID;
            // ...same field filling as above
        },
        onCreate: function () {
            const oModel = this.getOwnerComponent().getModel();

            // Gather data from bound form (example IDs)
            const data = {
                EMPID: parseInt(this.byId("idEmpId").getValue(), 10),
                EMPNAME: this.byId("idEmpName").getValue(),
                GENDER: this.byId("idGender").getSelectedKey(),
                SALARY: parseFloat(this.byId("idSalary").getValue()),
                DESIGNATION: this.byId("idEmpDes").getValue()
            };

            const oListBinding = oModel.bindList('/CreateEmpSet');

            const oContext = oListBinding.create(data);
            oContext.created().then(
                () => {
                    sap.m.MessageToast.show("Created successfully");
                    var oTable = this.byId('empTable');

                    if (oTable) {
                        var oTableBinding = oTable.getRowBinding
                            ? oTable.getRowBinding() // for Table
                            : oTable.getBinding("items"); // for List / Macro Table
                        if (oTableBinding) {
                            oTableBinding.refresh(); // Triggers re-read from backend
                        }
                    }


                },
                (oError) => {
                    sap.m.MessageBox.error("Creation failed: " + oError.message);
                }
            );
        },
        onPromote: function () {
            const empId = this.empid;
            if (!empId) return;
            const oModel = this.getOwnerComponent().getModel();
            // Create a deferred binding to the function import
            const oFunction = oModel.bindContext("/PromoteEmployee(...)");

            // Set parameters
            oFunction.setParameter("EMPID", empId);

            // Execute function
            oFunction.execute().then(() => {
                const oResult = oFunction.getBoundContext().getObject();


                this._tableData(oResult);

            }).catch((err) => {
                sap.m.MessageBox.error("Function failed: " + err.message);
            });
        },

        onHighSalary: function () {
            const oModel = this.getOwnerComponent().getModel();


            // Create a deferred binding to the function import
            const oFunction = oModel.bindContext("/HighSalaryEmployees(...)");

            // Set parameters
            oFunction.setParameter("SALARY", 2000);

            // Execute function
            oFunction.execute().then(() => {
                const oResult = oFunction.getBoundContext().getObject();


                this._tableData(oResult.value);

            }).catch((err) => {
                sap.m.MessageBox.error("Function failed: " + err.message);
            });
        },
        getSelectedEmpId: function () {
            const oTable = this.byId("empTable");
            const oItem = oTable.getSelectedItem();
            if (!oItem) {
                MessageBox.error("Please select an employee");
                return null;
            }
            return oItem.getBindingContext().getProperty("EMPID");
        },
    });
});