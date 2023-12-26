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
  "ojs/ojfilepickerutils",
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
  function Mapping_SetsViewModel() {
    var self = this;
    if (!sessionStorage.getItem("userId")) {
      window.location = "?ojr=Login";
    }
    this.groupValid = ko.observable();
    self.mappingname = ko.observable();
    self.validationType = ko.observable("SQL Query");
    self.validationArray = ko.observableArray([
      {
        id: 1,
        label: "SQL Query",
        value: "SQL Query",
      },
      {
        id: 2,
        label: "Lookup Value",
        value: "Lookup Value",
      },

      {
        id: 3,
        label: "Basic",
        value: "Basic",
      },
    ]);
    self.lookupValue = ko.observable();
    self.lookupValuesArray = ko.observableArray([]);
    this.editRow = ko.observable();
    self.ColsObservableArray = ko.observableArray([]);
    self.mappdingDataArray = ko.observableArray([]);
    self.mappingType = ko.observable();
    self.mappingCode = ko.observable();
    self.messages = ko.observableArray();
    self.scrollPos = ko.observable({ rowIndex: 0 });
    self.srchfilter = ko.observable("");
    self.searchdataArray = ko.observableArray([]);
    this.searchfilter = ko.observable("");
    self.sqlQuery = ko.observable("");
    self.cloudDataArray = ko.observableArray([]);
    self.templateid = ko.observable("0");
    self.mappingSetId = ko.observable("");
    self.fileNames = ko.observable();
    self.lookupSetId = ko.observable();
    self.deleteRid = ko.observable();
    self.btnLbl = ko.observable("Save");
    self.loadMore = function () {
      self.scrollPos({ rowIndex: self.scrollPos._latestValue.rowIndex + 5 });
    };
    self.messagesDataProvider = new ArrayDataProvider(self.messages);

    this.validationData = new ArrayDataProvider(self.validationArray, {
      keyAttributes: "value",
    });
    self.validationTypeChange = function (event) {
      if (event.detail.value) {
        if (event.detail.value == "Lookup Value") {
          getLookupValues();
        }
      }
    };
    self.addNewRecord = function () {
      let i = self.ColsObservableArray().length;
      self.ColsObservableArray.push({
        rowid: i + 1,
        mapLineId: "",
        mapSetId: self.templateid(),
        sourceField1: "",
        sourceField2: "",
        sourceField3: "",
        targetValue: "",
        enabledFlag: ["checked"],
        insertOrDelete: "I",
      });
    };

    self.mappdingDataArray([
      { id: "One to One", value: "One to One", label: "One to One" },
      { id: "Two to One", value: "Two to One", label: "Two to One" },
      { id: "Three to One", value: "Three to One", label: "Three to One" },
    ]);
    this.mappingData = new ArrayDataProvider(self.mappdingDataArray, {
      keyAttributes: "id",
    });
    self.mappingTypeChange = function (event) {
      if (event.detail.value) {
      }
    };

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
    self.closeSqlDailog = function () {
      document.querySelector("#sqlDailog").close();
    };
    self.openSqlDailog = function () {
      document.querySelector("#sqlDailog").open();
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
                return workpackid === item.mapSetId;
              }
            );
            self.btnLbl("Update");
            self.mappingSetId(selrow.mapSetId);
            self.templateid(selrow.mapSetId);
            self.mappingname(selrow.mapSetName);
            self.mappingCode(selrow.mapSetCode);
            self.mappingType(selrow.mapSetType);
            self.validationType(selrow.validationType);
            self.lookupSetId(selrow.lookupSetId);
            self.sqlQuery(selrow.sqlQuery);

            console.log("selrow" + JSON.stringify(selrow));
            document.querySelector("#srchDailog").close();
            getMappingSetValues();
          }
        }
      }
    };

    function getMappingSetValues() {
      if (self.mappingSetId()) {
        let url =
          riteUTils.riteProps.getMappingValuesBySetId + self.mappingSetId();
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
                  mapLineId: res[i].mapLineId,
                  mapSetId: res[i].mapSetId,
                  sourceField1: res[i].sourceField1,
                  sourceField2: res[i].sourceField2,
                  sourceField3: res[i].sourceField3,
                  targetValue: res[i].targetValue,
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
      let url = riteUTils.riteProps.getAllMappingSets;
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
                attribute1: res[i].attribute1,
                attribute2: res[i].attribute2,
                attribute3: res[i].attribute3,
                attribute4: res[i].attribute4,
                attribute5: res[i].attribute5,
                mapSetId: res[i].mapSetId,
                mapSetName: res[i].mapSetName,
                mapSetCode: res[i].mapSetCode,
                mapSetType: res[i].mapSetType,
                validationType: res[i].validationType,
                lookupSetId: res[i].lookupSetId,
                sqlQuery: res[i].sqlQuery,
              });
            }
          }
        })
        .catch((error) => {
          $(".progress").hide();
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
          { op: "$regex", value: { mapSetId: filterRegEx } },
          { op: "$regex", value: { mapSetName: filterRegEx } },
          { op: "$regex", value: { mapSetCode: filterRegEx } },
          { op: "$regex", value: { mapSetType: filterRegEx } },
          { op: "$regex", value: { validationType: filterRegEx } },
        ],
      };
      const arrayDataProvider = new ArrayDataProvider(self.searchdataArray, {
        keyAttributes: "mapSetId",
      });
      return new ListDataProviderView(arrayDataProvider, {
        filterCriterion: filterCriterion,
      });
    }, this);

    self.restMappingSets = function () {
      self.mappingSetId("");
      self.mappingname("");
      self.mappingCode("");
      self.mappingType("");
      self.validationType("");
      self.templateid("0");
      self.sqlQuery("");
      self.deleteRid("");
      self.lookupValue("");
      self.lookupSetId();
      self.validationType("SQL Query");
      self.btnLbl("Save");
      while (self.ColsObservableArray().length > 0) {
        self.ColsObservableArray.pop();
      }
    };

    self.uploadCsvFile = (event) => {
      $(".progress").show();
      var formdata = new FormData();
      formdata.append("file", event.detail.files[0]);
      formdata.append("mappingSetId", self.mappingSetId());
      var extRegEx = /(?:\.([^.]+))?$/;
      let fileExtn = extRegEx.exec(event.detail.files[0].name)[1];
      if (fileExtn == "csv" || fileExtn == "CSV") {
        var config = {
          method: "Post",
          url: riteUTils.riteProps.loadmappingvalues,
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
              //self.fileName(response.data.fileName);
              getMappingSetValues();
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

    self.saveMappings = function () {
      const valid = _checkValidationGroup();
      if((self.validationType()=="SQL Query" && self.sqlQuery()=="") || (self.validationType()=="SQL Query" &&self.sqlQuery() == null) || (self.validationType()=="Lookup Value" &&self.lookupValue()=="") || (self.validationType()=="Lookup Value" &&self.lookupValue()==null)){
        self.messages.push({
          severity: "error",
          summary: "Please fill all mandatory Fields",
          autoTimeout: 0,
        });
      }
      else if (valid) {
        let url = riteUTils.riteProps.SaveMappingSetHeader;
        let obj = {
          mapSetId: self.mappingSetId() ? self.mappingSetId() : null,
          mapSetName: self.mappingname(),
          mapSetCode: self.mappingCode(),
          mapSetType: self.mappingType(),
          validationType: self.validationType(),
          lookupSetId: self.lookupSetId(),
          sqlQuery: self.sqlQuery(),
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
              self.mappingSetId(res.mapSetId);
              self.templateid(res.mapSetId);
            }
            self.messages.push({
              severity: "confirmation",
              summary: "Mapping Sets Headers Saved Successfully",
              autoTimeout: 0,
            });
            self.btnLbl("Update");
            saveMappingsLines();
            console.log(res);
          })
          .catch((error) => {
            $(".progress").hide();
            if (error.response.status == 417) {
              self.messages.push({
                severity: "error",
                summary: "Mapping Set Name already Exists",
                autoTimeout: 0,
              });
            }
          });
      }
      else{

      }
    };

    function saveMappingsLines() {
      if (self.mappingSetId()) {
        var editItems = self.dataprovider.getSubmittableItems();
        console.log(editItems);
        let url =
          riteUTils.riteProps.saveallmappingvalues + self.mappingSetId();
        let data = [];
        editItems.forEach((itm) => {
          let obj = {
            mapLineId: itm.item.data.mapLineId ? itm.item.data.mapLineId : null,
            mapSetId: self.mappingSetId(),
            sourceField1: itm.item.data.sourceField1,
            sourceField2: itm.item.data.sourceField2,
            sourceField3: itm.item.data.sourceField3,
            targetValue: itm.item.data.targetValue,
            enabledFlag: itm.item.data.enabledFlag[0] == "checked" ? "Y" : "N",
            attribute1: null,
            attribute2: null,
            attribute3: null,
            attribute4: null,
            attribute5: null,
            insertOrDelete: itm.item.data.insertOrDelete == "I" ? "I" : "U",
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
                  mapLineId: res[i].mapLineId,
                  mapSetId: res[i].mapSetId,
                  sourceField1: res[i].sourceField1,
                  sourceField2: res[i].sourceField2,
                  sourceField3: res[i].sourceField3,
                  targetValue: res[i].targetValue,
                  enabledFlag: [
                    res[i].enabledFlag == "Y" ? "checked" : "unchecked",
                  ],
                });
              }
            }

            self.messages.push({
              severity: "confirmation",
              summary: "Mapping Set Lines Saved Successfully",
              autoTimeout: 0,
            });
          })
          .catch((error) => {
            $(".progress").hide();
            console.log(error);
          });
      }
    }

    self.selectListener = (files) => {
      self.fileNames(
        Array.prototype.map.call(files, (file) => {
          return file.name;
        })
      );
    };
    self.selectFiles = (event) => {
      FilePickerUtils.pickFiles(this.selectListener, {
        accept: [],
        capture: "none",
        selectionMode: "single",
      });
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
            if (itm.mapLineId) {
              deleteMapSetValue(itm, itm.mapSetId);
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

    function deleteMapSetValue(data, mapsetid) {
      if (data && mapsetid) {
        $(".progress").show();
        let url = riteUTils.riteProps.saveallmappingvalues + mapsetid;
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
            getMappingSetValues();
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

    function getLookupValues() {
      $(".progress").show();
      let url = riteUTils.riteProps.getAllLookUpSets;
      while (self.lookupValuesArray().length > 0) {
        self.lookupValuesArray.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            $(".progress").hide();
            for (let i = 0; i < res.length; i++) {
              self.lookupValuesArray.push({
                id: res[i].lookUpSetId,
                value: res[i].lookUpSetName,
                label: res[i].lookUpSetName,
              });
            }
          }
        })
        .catch((error) => {
          $(".progress").hide();
          console.log(error);
        });
    }

    self.lookupValueChange = function (event) {
      if (event.detail.value) {
        self.lookupValuesArray().forEach((lok) => {
          if (lok.label == event.detail.value) {
            self.lookupSetId(lok.id);
            getLookupSetValues();
          }
        });
      }
    };

    this.lookupsDb = ko.computed(function () {
      return new ArrayDataProvider(self.lookupValuesArray, {
        keyAttributes: "value",
      });
    });

    function getLookupSetValues() {
      if (self.lookupSetId()) {
        let url =
          riteUTils.riteProps.getLookUpValuesBySetId + self.lookupSetId();
        getDetails(url)
          .then((res) => {
            $(".progress").show();
            if (res) {
              while (self.cloudDataArray().length > 0) {
                self.cloudDataArray.pop();
              }
              $(".progress").hide();
              for (let i = 0; i < res.length; i++) {
                self.cloudDataArray.push({
                  id: res[i].lookUpValueId,
                  value: res[i].lookUpValue,
                  label: res[i].lookUpValue,
                });
              }
            }
          })
          .catch((error) => {
            $(".progress").hide();
          });
      }
    }

    this.cloudData = new ArrayDataProvider(self.cloudDataArray, {
      keyAttributes: "value",
    });

    this.connected = () => {
      accUtils.announce("Mapping Sets page loaded.", "assertive");
      document.title = "Mapping Sets";
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
  return Mapping_SetsViewModel;
});
