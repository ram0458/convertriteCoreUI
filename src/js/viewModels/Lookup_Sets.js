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
  "ojs/ojfilepicker",
  "ojs/ojcontext",
  "ojs/ojinputtext",
  "ojs/ojcheckboxset",
  "ojs/ojbutton",
  "ojs/ojtable",
  "ojs/ojinputsearch",
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
  FilePickerUtils,
  Context
) {
  function Lookup_SetsViewModel() {
    var self = this;
    if (!sessionStorage.getItem("userId")) {
      window.location = "?ojr=Login";
    }
    this.groupValid = ko.observable();
    self.lookUpSetName = ko.observable();
    self.lookUpSetCode = ko.observable();
    self.relatedTo = ko.observable();
    self.description = ko.observable();
    self.lookupValue = ko.observable();
    self.lookupValuesArray = ko.observableArray([]);
    this.editRow = ko.observable();
    self.ColsObservableArray = ko.observableArray([]);
    self.messages = ko.observableArray();
    self.scrollPos = ko.observable({ rowIndex: 0 });
    self.srchfilter = ko.observable("");
    self.searchdataArray = ko.observableArray([]);
    self.relatedToDataArray = ko.observableArray([]);
    self.actualValueArray = ko.observableArray([]);
    this.searchfilter = ko.observable("");
    self.flag = ko.observable("0");
    self.lookupSetId = ko.observable();
    self.deleteRid = ko.observable();
    self.lookupFlag = ko.observableArray([]);
    self.btnLbl = ko.observable("Save");

    self.loadMore = function () {
      self.scrollPos({ rowIndex: self.scrollPos._latestValue.rowIndex + 5 });
    };
    self.messagesDataProvider = new ArrayDataProvider(self.messages);
    /**
     * Optional ViewModel method invoked after the View is inserted into the
     * document DOM.  The application can put logic that requires the DOM being
     * attached here.
     * This method might be called multiple times - after the View is created
     * and inserted into the DOM and after the View is reconnected
     * after being disconnected.
     */

    self.addNewRecord = function () {
      let i = self.ColsObservableArray().length;
      self.ColsObservableArray.push({
        rowid: i + 1,
        attribute1: "",
        attribute2: "",
        attribute3: "",
        attribute4: "",
        attribute5: "",
        actualValue: "",
        lookUpSetId: 0,
        lookUpValue: "",
        lookUpValueId: "",
        enabledFlag: ["checked"],
        type: "I",
      });
    };

    self.actualValueArray([
      { id: 1, value: "Project", label: "Project" },
      { id: 2, value: "Parent Object", label: "Parent Object" },
      { id: 3, value: "Object", label: "Object" },
    ]);

    this.actuvalData = new ArrayDataProvider(self.actualValueArray, {
      keyAttributes: "value",
    });

    this.dataprovider = new BufferingDataProvider(
      new ArrayDataProvider(self.ColsObservableArray, {
        keyAttributes: "rowid",
      })
    );

    this.dataprovider.addEventListener(
      "submittableChange",
      function (event) {
        var submittable = event.detail;
        this.showSubmittableItems(submittable);
      }.bind(this)
    );

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
        if (editItem.item.metadata.message) {
          textValue +=
            " error: " + JSON.stringify(editItem.item.metadata.message);
        }
        textValue += "\n";
      });
    };
    self.closeSrchDailog = function () {
      document.querySelector("#srchDailog").close();
    };
    self.showSrchDailog = function () {
      self.srchfilter("");
      document.querySelector("#srchDailog").open();
      getLOVData();
    };

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
                return workpackid === item.lookUpSetId;
              }
            );
            self.btnLbl("Update");
            self.lookUpSetName(selrow.lookUpSetName);
            self.lookUpSetCode(selrow.lookUpSetCode);
            self.description(selrow.description);
            self.relatedTo(selrow.relatedTo);
            self.lookupSetId(selrow.lookUpSetId);
            self.flag("1");
            if (selrow.lookUpFlag == "Y") {
              self.lookupFlag(["checked"]);
            }

            console.log("selrow" + JSON.stringify(selrow));
            document.querySelector("#srchDailog").close();
            getLookupSetValues();
          }
        }
      }
    };

    function getLookupSetValues() {
      if (self.lookupSetId()) {
        let url =
          riteUTils.riteProps.getLookUpValuesBySetId + self.lookupSetId();
        getDetails(url)
          .then((res) => {
            $(".progress").show();
            if (res) {
              while (self.ColsObservableArray().length > 0) {
                self.ColsObservableArray.pop();
              }
              $(".progress").hide();
              for (let i = 0; i < res.length; i++) {
                self.ColsObservableArray.push({
                  rowid: i + 1,
                  attribute1: res[i].attribute1,
                  attribute2: res[i].attribute2,
                  attribute3: res[i].attribute3,
                  attribute4: res[i].attribute4,
                  attribute5: res[i].attribute5,
                  actualValue: res[i].actualValue,
                  lookUpSetId: res[i].lookUpSetId,
                  lookUpValue: res[i].lookUpValue,
                  lookUpValueId: res[i].lookUpValueId,
                  enabledFlag: [
                    res[i].enabledFlag == "Y" ? "checked" : "unchecked",
                  ],
                });
              }
            }
          })
          .catch((error) => {
            $(".progress").hide();
          });
      }
    }

    function getLOVData() {
      $(".progress").show();
      let url = riteUTils.riteProps.getAllLookUpSets;
      while (self.searchdataArray().length > 0) {
        self.searchdataArray.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            $(".progress").hide();
            for (let i = 0; i < res.length; i++) {
              self.searchdataArray.push({
                rowid: i + 1,
                lookUpSetId: res[i].lookUpSetId,
                lookUpSetName: res[i].lookUpSetName,
                lookUpSetCode: res[i].lookUpSetCode,
                description: res[i].description,
                relatedTo: res[i].relatedTo,
                lookUpFlag: res[i].lookUpFlag,
                attribute1: res[i].attribute1,
                attribute2: res[i].attribute2,
                attribute3: res[i].attribute3,
                attribute4: res[i].attribute4,
                attribute5: res[i].attribute5,
              });
            }
          }
        })
        .catch((error) => {
          $(".progress").hide();
          console.log(error);
        });
    }

    this.srchvalueChanged = function () {
      this.searchfilter(document.getElementById("filter").rawValue);
      console.log("inside searchdataprovider");
    }.bind(this);

    this.searchdataprovider = ko.computed(function () {
      const filterRegEx = new RegExp(this.searchfilter(), "i");
      const filterCriterion = {
        op: "$or",
        criteria: [
          { op: "$regex", value: { lookUpSetName: filterRegEx } },
          { op: "$regex", value: { lookUpSetId: filterRegEx } },
          { op: "$regex", value: { lookUpSetCode: filterRegEx } },
          { op: "$regex", value: { description: filterRegEx } },
          { op: "$regex", value: { relatedTo: filterRegEx } },
        ],
      };
      const arrayDataProvider = new ArrayDataProvider(self.searchdataArray, {
        keyAttributes: "lookUpSetId",
      });
      return new ListDataProviderView(arrayDataProvider, {
        filterCriterion: filterCriterion,
      });
    }, this);

    self.resetLookups = function () {
      self.flag("0");
      self.lookUpSetName("");
      self.lookUpSetCode("");
      self.description("");
      self.relatedTo("");
      self.lookupSetId("");
      self.lookupFlag([]);
      self.btnLbl("Save");
      while (self.ColsObservableArray().length > 0) {
        self.ColsObservableArray.pop();
      }
    };

    self.saveLookups = function () {
      const valid = _checkValidationGroup();
      if (valid) {
        let url = riteUTils.riteProps.saveLookUpSet;
        let obj = {
          lookUpSetId: self.lookupSetId() ? self.lookupSetId() : null,
          lookUpFlag: self.lookupFlag()[0] == "checked" ? "Y" : "N",
          lookUpSetName: self.lookUpSetName(),
          lookUpSetCode: self.lookUpSetCode(),
          description: self.description(),
          relatedTo: self.relatedTo(),
          attribute1: null,
          attribute2: null,
          attribute3: null,
          attribute4: null,
          attribute5: null,
        };

        postDetails(url, obj)
          .then((res) => {
            $(".progress").show();
            if (res) {
              self.lookupSetId(res.lookUpSetId);
              self.flag("1");
              self.messages.push({
                severity: "confirmation",
                summary: "Lookup Sets Headers Saved Successfully",
                autoTimeout: 0,
              });
              self.btnLbl("Update");

              saveLookupLines();
            } else {
              self.messages.push({
                severity: "error",
                summary: " Use Unique Lookup Set & Code",
                autoTimeout: 0,
              });
            }
          })
          .catch((error) => {
            $(".progress").hide();
            if (error.response.status == 417) {
              self.messages.push({
                severity: "error",
                summary: "Lookup Sets already Exists",
                autoTimeout: 0,
              });
            }
          });
      }
    };

    function saveLookupLines() {
      if (self.lookupSetId()) {
        var editItems = self.dataprovider.getSubmittableItems();
        console.log(editItems);
        let url = riteUTils.riteProps.saveallLookUpvalues + self.lookupSetId();
        let data = [];
        editItems.forEach((itm) => {
          let obj = {
            lookUpSetId: self.lookupSetId() ? self.lookupSetId() : null,
            lookUpValue: itm.item.data.lookUpValue,
            lookUpValueId: itm.item.data.lookUpValueId,
            actualValue: itm.item.data.actualValue,
            enabledFlag: itm.item.data.enabledFlag[0] == "checked" ? "Y" : "N",
            attribute1: itm.item.data.attribute1,
            attribute2: itm.item.data.attribute2,
            attribute3: itm.item.data.attribute3,
            attribute4: itm.item.data.attribute4,
            attribute5: itm.item.data.attribute5,
            insertOrDelete: itm.item.data.type == "I" ? "I" : "U",
          };
          data.push(obj);
        });
        postDetails(url, data)
          .then((res) => {
            while (self.ColsObservableArray().length > 0) {
              self.ColsObservableArray.pop();
            }
            if (res) {
              $(".progress").hide();
              for (let i = 0; i < res.length; i++) {
                self.ColsObservableArray.push({
                  rowid: i + 1,
                  attribute1: res[i].attribute1,
                  attribute2: res[i].attribute2,
                  attribute3: res[i].attribute3,
                  attribute4: res[i].attribute4,
                  attribute5: res[i].attribute5,
                  actualValue: res[i].actualValue,
                  lookUpSetId: res[i].lookUpSetId,
                  lookUpValue: res[i].lookUpValue,
                  lookUpValueId: res[i].lookUpValueId,
                  enabledFlag: [
                    res[i].enabledFlag == "Y" ? "checked" : "unchecked",
                  ],
                });
              }

              self.messages.push({
                severity: "confirmation",
                summary: "Lookup Set Lines Saved Successfully",
                autoTimeout: 0,
              });
            }
          })
          .catch((error) => {
            $(".progress").hide();
            console.log(error);
          });
      }
    }

    self.uploadCsvFile = (event) => {
      $(".progress").show();
      var formdata = new FormData();
      formdata.append("file", event.detail.files[0]);
      formdata.append("lookupSetId", self.lookupSetId());
      var extRegEx = /(?:\.([^.]+))?$/;
      let fileExtn = extRegEx.exec(event.detail.files[0].name)[1];
      if (fileExtn == "csv" || fileExtn == "CSV") {
        var config = {
          method: "Post",
          url: riteUTils.riteProps.loadLookUpfromfile,
          headers: {
            "Content-Type": "text/csv",
            "X-TENANT-ID": sessionStorage.getItem("X-TENANT-ID"),
            userId: sessionStorage.getItem("userId"),
          },
          data: formdata,
        };
        axios(config)
          .then(function (response) {
            if (response) {
              $(".progress").hide();
              // self.fileName(response.data.fileName);
              getLookupSetValues();
              self.messages.push({
                severity: "confirmation",
                summary: "File Upload Successfully",
                autoTimeout: 0,
              });
            } else {
              $(".progress").hide();
              self.messages.push({
                severity: "error",
                summary: response.data.message,
                autoTimeout: 0,
              });
            }
          })
          .catch(function (error) {
            if (error.response) {
              $(".progress").hide();
              if (error.response.status == 401) {
                self.messages.push({
                  severity: "error",
                  summary: "Your session has expired. Please relogin",
                  autoTimeout: 0,
                });
                setTimeout(() => {
                  sessionStorage.clear();
                  window.location = "?ojr=Login";
                }, 300);
              } else {
                self.messages.push({
                  severity: "error",
                  summary: error.response.data.error,
                  autoTimeout: 0,
                });
              }
            }
            console.log(error);
          });
      } else {
        $(".progress").hide();
        self.messages.push({
          severity: "error",
          summary: "Upload only CSV files !",
          autoTimeout: 0,
        });
      }
    };

    this.handleUpdate = (event, context) => {
      this.editRow({ rowKey: context.item.data.rowid });
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
          if (itm.rowid == self.deleteRid()) {
            if (itm.lookUpSetId) {
              deleteLookUpSetValue(itm, itm.lookUpSetId);
            } else {
              const deleteRowId = self.deleteRid();

              const indexToDelete = self
                .ColsObservableArray()
                .findIndex((item) => item.rowid === deleteRowId);

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
          }
        });
      }
    };

    function deleteLookUpSetValue(data, looksetid) {
      if (data && looksetid) {
        $(".progress").show();
        let url = riteUTils.riteProps.saveallLookUpvalues + looksetid;
        data.insertOrDelete = "D";
        data.enabledFlag = data.enabledFlag[0] == "checked" ? "Y" : "N";
        postDetails(url, [data])
          .then((res) => {
            console.log(res);
            $(".progress").hide();
            document.querySelector("#confirmDailog").close();
            self.messages.push({
              severity: "confirmation",
              summary: "Deleted Successfully",
              autoTimeout: 0,
            });
            getLookupSetValues();
          })
          .catch((error) => {
            $(".progress").hide();
            console.log(error);
          });
      }
    }

    function _checkValidationGroup() {
      const tracker = document.getElementById("tracker");
      if (tracker.valid === "valid") {
        return true;
      } else {
        // show messages on all the components that are invalidHiddden, i.e., the
        // required fields that the user has yet to fill out.
        tracker.showMessages();
        Context.getPageContext()
          .getBusyContext()
          .whenReady()
          .then(() => tracker.focusOn("@firstInvalidShown"));
        return false;
      }
    }
    this.connected = () => {
      accUtils.announce("Lookup Sets page loaded.", "assertive");
      document.title = "Lookup Sets";
      // Implement further logic if needed
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
  return Lookup_SetsViewModel;
});
