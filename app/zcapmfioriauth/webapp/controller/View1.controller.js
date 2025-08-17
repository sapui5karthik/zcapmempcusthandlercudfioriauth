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
                        const oTableBinding = oTable.getBinding("items");
                        if (oTableBinding) {
                            oTableBinding.refresh();
                        }
                    }


                },
                (oError) => {
                    sap.m.MessageBox.error("Creation failed: " + oError.message);
                }
            );
        },
        onUpdate: async function () {
            const oModel = this.getOwnerComponent().getModel();

            // Gather data from bound form (example IDs)
            const data = {
                EMPID: this.byId("idEmpId").getValue(),
                EMPNAME: this.byId("idEmpName").getValue(),
                GENDER: this.byId("idGender").getSelectedKey(),
                SALARY: parseFloat(this.byId("idSalary").getValue()),
                DESIGNATION: this.byId("idEmpDes").getValue()
            };

            // 1. Bind directly to the employee by key
            const sPath = `/UpdateEmpSet(${data.EMPID})`;
            const oBinding = oModel.bindContext(sPath, undefined, { $$updateGroupId: "employee" });
            const oContext = oBinding.getBoundContext();
            try {
                // 2. Load the entity to ensure it exists
                await oContext.requestObject();

                // 3. Apply property changes
                oContext.setProperty("EMPNAME", data.EMPNAME);
                oContext.setProperty("GENDER", data.GENDER);
                oContext.setProperty("SALARY", data.SALARY);
                oContext.setProperty("DESIGNATION", data.DESIGNATION);

                // 4. Submit PATCH request
                await oModel.submitBatch("employee");

                sap.m.MessageToast.show("Updated successfully");

                // 5. Refresh table if needed
                const oTable = this.byId("empTable");
                if (oTable) {
                    const oTableBinding = oTable.getBinding("items");
                    if (oTableBinding) {
                        oTableBinding.refresh();
                    }
                }
                this._resetForm();
              
            } catch (err) {
                sap.m.MessageBox.error("Update failed: " + err.message);
            }



        },
        _resetForm : function(){
  this.byId("idEmpId").setValue();
                this.byId("idEmpName").setValue();
                this.byId("idGender").setSelectedKey();
                this.byId("idSalary").setValue();
                this.byId("idEmpDes").setValue();
                this.byId("idEmpDes").setEnabled(true);
                this.byId('empTable').removeSelections();
        },
        onDelete: async function () {
            const oModel = this.getOwnerComponent().getModel();

            // Get employee ID from form (or selected row in table)
            const empId = parseInt(this.byId("idEmpId").getValue(), 10);

            if (isNaN(empId)) {
                return sap.m.MessageBox.error("Please enter a valid Employee ID.");
            }

            // Path to entity
            const sPath = `/UpdateEmpSet(${empId})`;

            // Bind to context
            const oBinding = oModel.bindContext(sPath, undefined, { $$updateGroupId: "employee" });
            const oContext = oBinding.getBoundContext();

            try {
                // Ensure entity exists
                await oContext.requestObject();

                // Delete entity
                await oContext.delete("$auto");   // or use your groupId "employee"

                // Submit changes
                await oModel.submitBatch("employee");

                sap.m.MessageToast.show("Deleted successfully");

                // Refresh table
                const oTable = this.byId("empTable");
                if (oTable) {
                    const oTableBinding = oTable.getBinding("items");
                    if (oTableBinding) {
                        oTableBinding.refresh();
                    }
                }
                this._resetForm();

            } catch (err) {
                sap.m.MessageBox.error("Delete failed: " + err.message);
            }
        },

        _getvalues: function (oEvent) {
            var oTable = this.byId("empTable");
            var aSelectedItems = oTable.getSelectedItems();
            var aSelectedData = [];

            aSelectedItems.forEach((oItem) => {
                var oContext = oItem.getBindingContext();
                var oData = oContext.getObject();
                aSelectedData.push(oData);

                this.byId("idEmpId").setValue(oData.EMPID);
                this.byId("idEmpName").setValue(oData.EMPNAME);
                this.byId("idGender").setSelectedKey(oData.GENDER);
                this.byId("idSalary").setValue(oData.SALARY);
                this.byId("idEmpDes").setValue(oData.DESIGNATION);
                this.byId("idEmpDes").setEnabled(false);
            });




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