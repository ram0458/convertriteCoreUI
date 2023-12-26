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
  "ojs/ojbufferingdataprovider",
  "ojs/ojarraydataprovider",
  "ojs/ojlistdataproviderview",
  "ojs/ojpopup",
  "ojs/ojselectsingle",
  "ojs/ojinputtext",
  "ojs/ojbutton",
  "ojs/ojtable",
  "ojs/ojformlayout",
  "ojs/ojmessages",
  "ojs/ojdialog",
], function (
  accUtils,
  ko,
  BufferingDataProvider,
  ArrayDataProvider,
  ListDataProviderView
) {
  function Object_DetailsViewModel() {
    var self = this;
    if (!sessionStorage.getItem("userId")) {
      window.location = "?ojr=Login";
    }

    self.messages = ko.observableArray([]);
    self.messagesDataProvider = new oj.ArrayDataProvider(self.messages);
    self.scrollPos = ko.observable({ rowIndex: 0 });
    self.scrollPos1 = ko.observable({ rowIndex: 0 });
    self.srchfilter = ko.observable("");
    this.searchfilter = ko.observable("");
    self.objectConfigArray = ko.observableArray([]);
    self.userName = ko.observable();
    self.password = ko.observable();
    self.objectId = ko.observable("");
    self.objectName = ko.observable("");
    self.objectCode = ko.observable("");
    self.userObjectName = ko.observable("");
    self.moduleCode = ko.observable("");
    self.parentObjectId = ko.observable("");
    self.fbdiSheet = ko.observable("");
    self.hdlSheet = ko.observable("");
    self.loaderEndpoint = ko.observable("");
    self.reConQuery = ko.observable("");
    self.sequenceInParent = ko.observable("");
    self.connections = ko.observable("");
    self.url = ko.observable("");
    self.podname = ko.observable("");
    self.podConnDtlArray = ko.observableArray([]);
    self.ColsObservableArray = ko.observableArray([]);
    self.deleteRid = ko.observable();
    this.editRow = ko.observable();
    self.podDtlsArray = ko.observableArray([]);
    self.clientId = ko.observable("");
    if (sessionStorage.getItem("clientId")) {
      self.clientId(sessionStorage.getItem("clientId"));
    }

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

    self.cancelDelete = function () {
      document.querySelector("#confirmDailog").close();
    };

    this.searchanyvalueChanged = function () {
      this.srchfilter(document.getElementById("filter").rawValue);
    }.bind(this);

    self.searchdataprovider = ko.computed(function () {
      const filterRegEx = new RegExp(this.srchfilter(), "i");
      const filterCriterion = {
        op: "$or",
        criteria: [
          { op: "$regex", value: { objectName: filterRegEx } },
          { op: "$regex", value: { userObjectName: filterRegEx } },
          { op: "$regex", value: { moduleCode: filterRegEx } },
          { op: "$regex", value: { parentObjectId: filterRegEx } },
          { op: "$regex", value: { fbdiSheet: filterRegEx } },
          { op: "$regex", value: { hdlSheet: filterRegEx } },
          { op: "$regex", value: { loaderEndpoint: filterRegEx } },
          { op: "$regex", value: { reConQuery: filterRegEx } },
        ],
      };
      const arrayDataProvider = new ArrayDataProvider(self.objectConfigArray, {
        keyAttributes: "SNo",
      });
      return new ListDataProviderView(arrayDataProvider, {
        filterCriterion: filterCriterion,
      });
    }, this);

    self.loadMore = function () {
      self.scrollPos({ rowIndex: self.scrollPos._latestValue.rowIndex + 10 });
    };

    this.objclose = function () {
      document.getElementById("objDailog").close();
    };

    self.editObjectConfig = function (event) {
      if (event.target.innerText) {
        document.getElementById("objDailog").open();
        if (self.objectConfigArray()) {
          self.objectConfigArray().forEach((itm) => {
            if (itm.objectId == event.target.innerText) {
              self.objectId(itm.objectId);
              self.objectName(itm.objectName);
              self.objectCode(itm.objectCode);
              self.userObjectName(itm.userObjectName);
              self.moduleCode(itm.moduleCode);
              self.parentObjectId(itm.parentObjectId);
              self.fbdiSheet(itm.fbdiSheet);
              self.hdlSheet(itm.hdlSheet);
              self.loaderEndpoint(itm.loaderEndpoint);
              self.reConQuery(itm.reConQuery);
              self.sequenceInParent(itm.sequenceInParent);
            }
          });
          getObjectInfo();
        }
      }
    };

    function getObjectSetupDtls() {
      let url =
        riteUTils.riteProps.getObjectsByUserId +
        "/" +
        sessionStorage.getItem("userVal");
      $(".progress").show();
      getDetails(url)
        .then((res) => {
          if (res.statusCode == "OK") {
            self.objectConfigArray([]);
            for (let i = 0; i < res.payload.length; i++) {
              let obj = {
                SNo: i + 1,
                objectId: res.payload[i].objectId,
                objectName: res.payload[i].objectName,
                objectCode: res.payload[i].objectCode,
                userObjectName: res.payload[i].userObjectName,
                moduleCode: res.payload[i].moduleCode,
                parentObjectId: res.payload[i].parentObjectName,
                fbdiSheet: res.payload[i].fbdiSheet,
                hdlSheet: res.payload[i].hdlSheet,
                loaderEndpoint: res.payload[i].loaderEndpoint,
                reConQuery: res.payload[i].reConQuery,
                sequenceInParent: res.payload[i].sequenceInParent,
              };
              self.objectConfigArray.push(obj);
            }
            $(".progress").hide();
          } else {
            $(".progress").hide();
            self.messages.push({
              severity: "error",
              summary: res.message,
              autoTimeout: 0,
            });
          }
        })
        .catch((err) => {
          console.log(err);
          $(".progress").hide();
          self.messages.push({
            severity: "error",
            summary: err.response.data.message,
            autoTimeout: 0,
          });
        });
    }

    self.addNewRecord = function () {
      let i = self.ColsObservableArray().length;
      self.ColsObservableArray.push({
        rowId: i + 1,
        type: "",
        value: "",
        description: "",
      });
    };

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
    function getObjectInfo() {
      if (self.objectId()) {
        while (self.ColsObservableArray().length !== 0) {
          self.ColsObservableArray.pop();
        }
        let url =
          riteUTils.riteProps.savegetobjectinformation +
          "/" +
          self.objectId() +
          "/objectinformation";

        getDetails(url)
          .then((res) => {
            if (res.statusCode == "OK") {
              for (let i = 0; i < res.payload.length; i++) {
                let obj = {
                  rowId: i + 1,
                  description: res.payload[i].info_description,
                  type: res.payload[i].info_type,
                  value: res.payload[i].info_value,
                  objInfoId: res.payload[i].objInfoId,
                  objectId: res.payload[i].objectId,
                };

                self.ColsObservableArray.push(obj);
              }
              $(".progress").hide();
            } else {
              $(".progress").hide();
              self.messages.push({
                severity: "error",
                summary: res.message,
                autoTimeout: 0,
              });
            }
          })
          .catch((err) => {
            console.log(err);
            $(".progress").hide();
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
          });
      }
    }

    self.saveObjectInfo = function () {
      let editItems = self.dataprovider.getSubmittableItems();
      let data = [];
      if (editItems) {
        editItems.forEach((editItem) => {
          let obj = {
            objInfoId: editItem.item.data.objInfoId
              ? editItem.item.data.objInfoId
              : null,
            objectId: self.objectId(),
            info_type: editItem.item.data.type,
            info_value: editItem.item.data.value,
            info_description: editItem.item.data.description,
            additional_information1: null,
            additional_information2: null,
            additional_information3: null,
            additional_information4: null,
            additional_information5: null,
            creation_date: null,
            created_by: null,
            last_update_date: null,
            last_update_by: null,
            insertOrDelete: "I",
          };
          data.push(obj);
        });
      }
      if (data.length !== 0) {
        //save cloud source columns
        let url =
          riteUTils.riteProps.savegetobjectinformation +
          "/" +
          self.objectId() +
          "/saveallobjectinformation";
        postDetails(url, data)
          .then((res) => {
            if (res) {
              self.messages.push({
                severity: "confirmation",
                summary: "Object Details Saved/Updated Successfully",
                autoTimeout: 0,
              });
            }
            $(".progress").hide();
          })
          .catch((err) => {
            console.log(err);
            $(".progress").hide();
          });
      }
    };

    this.connected = () => {
      accUtils.announce("Object Details page loaded.", "assertive");
      document.title = "Object Details";
      getObjectSetupDtls();
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
  return Object_DetailsViewModel;
});
