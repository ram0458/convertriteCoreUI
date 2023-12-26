/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your about ViewModel code goes here
 */
define([
  "../accUtils",
  "knockout",
  "axios",
  "ojs/ojbufferingdataprovider",
  "ojs/ojarraydataprovider",
  "ojs/ojlistdataproviderview",
  "ojs/ojconverterutils-i18n",
  "ojs/ojconverter-datetime",
  "ojs/ojconverter-number",
  "ojs/ojcontext",
  "ojs/ojinputtext",
  "ojs/ojbutton",
  "ojs/ojtable",
  "ojs/ojinputsearch",
  "ojs/ojdatetimepicker",
  "ojs/ojselectsingle",
  "ojs/ojformlayout",
  "ojs/ojdialog",
  "ojs/ojmessages",
  "ojs/ojvalidationgroup",
  "ojs/ojdefer",
], function (
  accUtils,
  ko,
  axios,
  BufferingDataProvider,
  ArrayDataProvider,
  ListDataProviderView,
  Context
) {
  function Object_GroupingViewModel() {
    var self = this;
    if (!sessionStorage.getItem("userId")) {
      window.location = "?ojr=Login";
    }
    this.groupValid = ko.observable();
    self.projectNameArray = ko.observableArray([]);
    self.groupVal = ko.observable("0");
    self.groupId = ko.observable("");
    self.description = ko.observable('');
    self.projectName = ko.observable("");
    self.projectname = ko.observable("");
    self.parentObject = ko.observable("");
    self.parentObjectCode = ko.observable('');
    self.parentObjArray = ko.observableArray([]);
    self.objectId= ko.observable("");
    self.objectCode = ko.observable("");
    self.objectArray = ko.observableArray([]);
    self.messages = ko.observableArray();
    self.messagesDataProvider = new oj.ArrayDataProvider(self.messages);
    self.srchfilter = ko.observable("");
    self.searchdataArray = ko.observableArray([]);
    self.ColsObservableArray = ko.observableArray([]);
    self.ctrlFile = ko.observable("");
    self.groupName = ko.observable("");
    self.groupCode = ko.observable("");
    this.searchfilter = ko.observable("");
    self.btnLbl = ko.observable('Save');
    // self.version = ko.observable("");
    // self.versionDataArray = ko.observableArray([]);
    self.objectCodeArray = ko.observableArray([]);
    self.deleteRid = ko.observable();
    self.scrollPos = ko.observable({ rowIndex: 0 });
    this.editRow = ko.observable();

    // getVersion();
    // function getVersion() {
    //   let version = JSON.parse(sessionStorage.getItem("version"));
    //   for (let i = 0; i < version.length; i++) {
    //     self.versionDataArray.push({
    //       "id ": version[i].id,
    //       value: version[i].value,
    //       label: version[i].label,
    //     });
    //   }
    // }

    // this.versiondata = new ArrayDataProvider(self.versionDataArray, {
    //   keyAttributes: "value",
    // });

    // self.versionValueChange = function () {};

    self.loadMore = function () {
      self.scrollPos({ rowIndex: self.scrollPos._latestValue.rowIndex + 5 });
    };

    this.eatNonNumbers = (event) => {
      let charCode = event.which ? event.which : event.keyCode;
      let char = String.fromCharCode(charCode);
      let replacedValue = char.replace(/[^0-9\.]/g, "");
      if (char !== replacedValue) {
        event.preventDefault();
      }
    };


    function getProjectData() {
      while (self.projectNameArray().length > 0) {
        self.projectNameArray.pop();
      }
      let url = riteUTils.riteProps.getAllProjectHeaders;
      getDetails(url)
        .then((res) => {
          $(".progress").show();
          if (res) {
            for (let i = 0; i < res.length; i++) {
              self.projectNameArray.push({
                value: res[i].projectName,
                id: res[i].projectId,
                label: res[i].projectName,
              });
            }
            $(".progress").hide();
          }
        })
        .catch(function (error) {
          $(".progress").hide();
        });
    }

    this.projectNamedata = new ArrayDataProvider(self.projectNameArray, {
      keyAttributes: "id",
    });

    self.projectNameValueChange = function (event) {
      if (event.detail.value) {
        $(".progress").show();
        let url =
          riteUTils.riteProps.getParentObjectsByProjectId +
          "/" +
          self.projectName();
        getDetails(url)
          .then((res) => {
            if (res) {
              self.parentObjArray([]);
              self.objectArray([]);
              self.objectCode('');
              for (let i = 0; i < res.length; i++) {
                self.parentObjArray.push({
                  value: res[i].objectName,
                  id: res[i].objectId,
                  label: res[i].objectName,
                  objectCode: res[i].objectCode,
                });
              }
              $(".progress").hide();
            }
          })
          .catch(function (error) {
            $(".progress").hide();
          });
      }
    };

    this.parentobjectdata = new ArrayDataProvider(self.parentObjArray, {
      keyAttributes: "id",
    });

    self.addBtnDisabled = ko
      .computed(function () {
        if (self.projectName() && self.parentObject()) {
          return false;
        } else {
          return true;
        }
      })
      .bind(this);

      self.addNewRecord = function () {
        let i = self.ColsObservableArray().length ; 
        let seq = (i + 1) * 10; 
        self.ColsObservableArray.push({
          rowId: i + 1,
          seq:seq,
          objectName: "",
          insertOrDelete: "I"

        });
      };
      
    self.pobjCodeValueChange = function (event) {
      if (event.detail.value) {
        $(".progress").show();
        self.parentObjArray().forEach((item) => {
          if (event.detail.value == item.id) {
            self.objectCode(item.objectCode);
          }
        });
        let url =
          riteUTils.riteProps.getObjectsByObjectCode +
          "/" +
          self.projectName() +
          "/" +
          self.objectCode();
        getDetails(url)
          .then((res) => {
            if (res) {
              self.objectArray([]);
              for (let i = 0; i < res.length; i++) {
                self.objectArray.push({
                  value: res[i].objectName,
                  objectId: res[i].objectId,
                  label: res[i].objectName,
                });
              }
              $(".progress").hide();
            }
          })
          .catch(function (error) {
            $(".progress").hide();
          });
        
      }
    };

    this.objectCodeData = new ArrayDataProvider(self.objectArray, {
      keyAttributes: "value",
    });

    
    this.searchanyvalueChanged = function () {
      this.searchfilter(document.getElementById("filter").rawValue);
    }.bind(this);

    this.searchdataprovider = ko.computed(function () {
      const filterRegEx = new RegExp(this.searchfilter(), "i");
      const filterCriterion = {
        op: "$or",
        criteria: [
          { op: "$regex", value: { groupName: filterRegEx } },
          { op: "$regex", value: { groupId: filterRegEx } },
          { op: "$regex", value: { version: filterRegEx } },
        ],
      };
      const arrayDataProvider = new ArrayDataProvider(self.searchdataArray, {
        keyAttributes: "groupId",
      });
      return new ListDataProviderView(arrayDataProvider, {
        filterCriterion: filterCriterion,
      });
    }, this);

    self.showSrchDailog = function () {
      self.srchfilter('');
      document.querySelector("#srchDailog").open();
      getLOVData();
    };

    self.closeSrchDailog = function () {
      document.querySelector("#srchDailog").close();
    };

    self.resetObjectGrouping = function (event) {
      self.groupVal('0');
      self.groupId('');
      self.groupName("");
      self.groupCode("");
      self.description("");
      self.ctrlFile("");
      self.projectName("");
      self.parentObject("");
      self.btnLbl("Save");
      while (self.ColsObservableArray().length > 0) {
        self.ColsObservableArray.pop();
      }
    };

    function getLOVData() {
      let url = riteUTils.riteProps.getAllObjectGroupHdrsView;
      while(self.searchdataArray().length>0){
        self.searchdataArray.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            for (let i = 0; i < res.length; i++) {
              self.searchdataArray.push({
                rowId : i+1,
                groupId: res[i].groupId,
                groupName: res[i].groupName,
                groupCode: res[i].groupCode,
                projectId: res[i].projectId,
                projectName: res[i].projectName,
                parentObjectId: res[i].parentObjectId,
                parentObjectName: res[i].parentObjectName,
                description: res[i].description,
                attribute1: res[i].attribute1,
                attribute2: res[i].attribute2,
                attribute3: res[i].attribute3,
                attribute4: res[i].attribute4,
                attribute5: res[i].attribute5,
              });
            }
          }
          $(".progress").hide();
        })
        .catch((error) => {
          $(".progress").hide();
        });
    }

    self.selectionListener = function (event) {
      var data = event.detail;
      if (event.type == "selectionChanged") {
        var eventTxt = "Triggered selectionChanged event: \n";
        var selectionObj = data["value"];
        if (selectionObj.length > 0) {
          var range = selectionObj[0];
          var startIndex = range.startIndex;
          if (startIndex != null && startIndex.row != null) {
            var workpackid = selectionObj[0].startKey.row;
            var selrow = ko.utils.arrayFirst(
              self.searchdataArray(),
              function (item) {
                return workpackid === item.groupId;
              }
            );
            self.btnLbl('Update')
            self.groupVal("1");
            self.groupId(selrow.groupId);
            self.groupName(selrow.groupName);
            self.groupCode(selrow.groupCode);
            self.description(selrow.description);
            self.projectName(selrow.projectId);
            // self.parentObject(selrow.parentObjectId);
            objectLinesTable(selrow.groupId);
            document.querySelector("#srchDailog").close();
          }
        }
      }
    };

    function objectLinesTable(groupId) {
      if (groupId) {
        $(".progress").show();
        while (self.ColsObservableArray().length > 0) {
          self.ColsObservableArray.pop();
        }
        let url = riteUTils.riteProps.getAllLinesInObjectGroup + groupId;
        getDetails(url)
          .then((res) => {
            while (self.ColsObservableArray().length > 0) {
              self.ColsObservableArray.pop();
            }
            if (res) {
              for (let i = 0; i < res.length; i++) {
                self.ColsObservableArray.push({
                  rowId: i + 1,
                  seq: res[i].sequence,
                  objectId: res[i].objectId,
                  objectName: res[i].objectName,
                  objGrpLineId : res[i].objGrpLineId,
                  groupId : res[i].groupId,
        
                });
              }
              $(".progress").hide();
            }
          })
          .catch(function (error) {
            if (error.response) {
              $(".progress").hide();
            }
            console.log(error);
          });
      }
    }
    this.dataprovider = new BufferingDataProvider(
      new ArrayDataProvider(self.ColsObservableArray, {
        keyAttributes: "rowId",
      })
    );

    this.dataprovider.addEventListener(
      "submittableChange",
      function (event) {
        var submittable = event.detail;
        this.showSubmittableItems(submittable);
      }.bind(this)
    );

    function _checkValidationGroup() {
      const tracker = document.getElementById("tracker");
      if (tracker.valid === "valid") {
        return true;
      } else {
        tracker.showMessages();
        Context.getPageContext()
          .getBusyContext()
          .whenReady()
          .then(() => tracker.focusOn("@firstInvalidShown"));
        return false;
      }
    }



    self.saveObjectGrouping = function (event) {
      const valid = _checkValidationGroup();
      if (valid) {
        let data = {
          groupId: self.groupId()?self.groupId():null,
          projectId: self.projectName(),
          parentObjectId: self.parentObject(),
          groupName: self.groupName(),
          groupCode: self.groupCode(),
          description: self.description(),
          attribute1: null,
          attribute2: null,
          attribute3: null,
          attribute4: null,
          attribute5: null
        };
        let url = riteUTils.riteProps.saveObjectGroupHdr;
        postDetails(url, data).then((res) => {
          if (res) {
            self.groupId(res.groupId);
            self.messages.push({
              severity: "confirmation",
              summary: "Object Headers Saved/Updated Successfully!",
              autoTimeout: 0,
            });
            saveLines();
            self.btnLbl("Update");
          }
        })
        .catch((error) => {
          $(".progress").hide();
          if (error.response.status == 417) {
          self.messages.push({
            severity: "error",
            summary:  "Object Grouping already Exists",
            autoTimeout: 0,
          });
        }
       
        })
      }
    };


    function saveLines() {
      let url = riteUTils.riteProps.saveObjectGroupLines + self.groupId();
      var editItem = self.dataprovider.getSubmittableItems();
      let data = [];
      editItem.forEach((itm) => {
        self.objectArray().forEach((id) => {
          if (id.value == itm.item.data.objectName) {
            self.objectId(id.objectId);
          }
        });
        let obj = {
          objGrpLineId: itm.item.data.objGrpLineId
            ? itm.item.data.objGrpLineId
            : null,
          groupId: self.groupId() ? self.groupId() : null,
          objectId: self.objectId(),
          objectName: itm.item.data.objectName,
          sequence: itm.item.data.seq,
          attribute1: null,
          attribute2: null,
          attribute3: null,
          attribute4: null,
          attribute5: null,
          insertOrDelete: itm.item.data.insertOrDelete == "I" ? "I" : "U",
        };
        data.push(obj);
      });
      $(".progress").show();
      postDetails(url, data)
        .then((res) => {
          while (self.ColsObservableArray().length > 0) {
            self.ColsObservableArray.pop();
          }
          if (res) {
            for (let i = 0; i < res.length; i++) {
              self.ColsObservableArray.push({
                rowId: i + 1,
                objGrpLineId: res[i].objGrpLineId,
                groupId: res[i].groupId,
                objectId: res[i].objectId,
                objectName: res[i].objectName,
                seq: res[i].sequence,
                attribute1: res[i].attribute1,
                attribute2: res[i].attribute2,
                attribute3: res[i].attribute3,
                attribute4: res[i].attribute4,
                attribute5: res[i].attribute5,
              });
            }
            $(".progress").hide();
            self.messages.push({
              severity: "confirmation",
              summary: " Object Lines Saved/Updated Successfully!",
              autoTimeout: 0,
            });
          }
        })
        .catch((error) => {
          $(".progress").hide();
          console.log(error);
        });
    }

    this.handleUpdate = (event, context) => {
      this.editRow({ rowKey: context.item.data.rowId });
    };

    this.handleDone = () => {
      this.editRow({ rowKey: null });
    };

    this.handleCancel = () => {
      this.cancelEdit = true;
      this.editRow({ rowKey: null });
    };

    this.handleDelete = (event) => {
      if (event.target.innerText) {
        self.deleteRid(parseInt(event.target.innerText));
        document.querySelector("#confirmDailog").open();
      }
    };

    self.cancelDelete = function () {
      document.querySelector("#confirmDailog").close();
    };

    self.okDeleteConformation = function () {
      if (self.ColsObservableArray()) {
        self.ColsObservableArray().forEach((itm) => {
          if (itm.rowId == self.deleteRid()) {
            const deleteRowId = self.deleteRid();
            const indexToDelete = self
              .ColsObservableArray()
              .findIndex((item) => item.rowId === deleteRowId);
            if (indexToDelete !== -1) {
              self.ColsObservableArray.splice(indexToDelete, 1);
              document.querySelector("#confirmDailog").close();
              self.messages.push({
                severity: "confirmation",
                summary: "Deleted Successfully",
                autoTimeout: 0,
              });
            }
          }
        });
      }
    };
     


 
    this.beforeRowEditListener = function (event) {
      var rowContext = event.detail.rowContext;
      var dataObj = rowContext.componentElement.getDataForVisibleRow(
        rowContext.status.rowIndex
      );
      this.originalData = Object.assign({}, dataObj.data);
      this.rowData = Object.assign({}, dataObj.data);
      currtemplinesrow = this.rowData;
    }.bind(this);

    this.beforeRowEditEndListener = function (event) {
      var detail = event.detail;
      if (!detail.cancelEdit) {
        if (hasValidationErrorInRow(event.target)) {
          event.preventDefault();
        } else {
          if (isRowDataUpdated()) {
            var key = detail.rowContext.status.rowKey;
            this.dataprovider.updateItem({
              metadata: { key: key },
              data: this.rowData,
            });
          }
        }
      }
    }.bind(this);

    var hasValidationErrorInRow = function (table) {
      var editables = table.querySelectorAll(".editable");
      for (i = 0; i < editables.length; i++) {
        var editable = editables.item(i);
        editable.validate();
        if (editable.valid !== "valid") {
          return true;
        }
      }
      return false;
    };

    var isRowDataUpdated = function () {
      var propNames = Object.getOwnPropertyNames(this.rowData);
      for (var i = 0; i < propNames.length; i++) {
        if (this.rowData[propNames[i]] !== this.originalData[propNames[i]]) {
          return true;
        }
      }
      return false;
    }.bind(this);

    this.showSubmittableItems = function (submittable) {
      var textValue = "";
      submittable.forEach(function (editItem) {
        textValue += editItem.operation + " ";
        textValue += editItem.item.metadata.key + ": ";
        textValue += JSON.stringify(editItem.item.data);
        textValue += "\n";
      });
    };

    this.connected = () => {
      accUtils.announce("Object Grouping Page Loaded", "assertive");
      document.title = "Object Grouping";
      getProjectData();
    };

    /**
     * Optional ViewModel method invoked after the View is disconnected from the DOM.
     */
    this.disconnected = () => {
      // Implement if needed
    };

    /**
     * Optional ViewModel method invoked after transition to the new View is complete.
     * That includes any possible animation between the old and the new View.
     */
    this.transitionCompleted = () => {
      // Implement if needed
    };
  }

  /*
   * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
   * return a constructor for the ViewModel so that the ViewModel is constructed
   * each time the view is displayed.
   */
  return Object_GroupingViewModel;
});
