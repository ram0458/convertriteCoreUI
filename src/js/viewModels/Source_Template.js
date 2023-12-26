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
  "require",
  "knockout",
  "axios",
  "ojs/ojcontext",
  "ojs/ojbufferingdataprovider",
  "ojs/ojarraydataprovider",
  "ojs/ojlistdataproviderview",
  "ojs/ojasyncvalidator-regexp",
  "ojs/ojvalidationgroup",
  "ojs/ojpopup",
  "ojs/ojinputtext",
  "ojs/ojbutton",
  "ojs/ojradioset",
  "ojs/ojfilepicker",
  "ojs/ojtable",
  "ojs/ojcheckboxset",
  "ojs/ojinputsearch",
  "ojs/ojselectsingle",
  "oj-c/select-multiple",
  "ojs/ojformlayout",
  "ojs/ojmessages",
  "ojs/ojdialog",
  "ojs/ojdefer",
], function (
  accUtils,
  require,
  ko,
  axios,
  Context,
  BufferingDataProvider,
  ArrayDataProvider,
  ListDataProviderView,
  AsyncRegExpValidator
) {
  function Source_TemplateViewModel() {
    var self = this;
    if (!sessionStorage.getItem("user_role")) {
      window.location = "?ojr=Login";
    }
    self.projectId = ko.observable("");
    self.projectsNameArray = ko.observableArray([]);
    self.pobjcodedisabled = ko.observable(true);
    self.parentObjectId = ko.observable("");
    self.parentobjsuggest = ko.observableArray([]);
    self.objectId = ko.observable("");
    self.objectcodedisabled = ko.observable(true);
    self.objsuggest = ko.observableArray([]);
    self.metaDataTableId = ko.observable("");
    self.clouddatatabdisabled = ko.observable(true);
    self.cloudtablesuggest = ko.observableArray([]);
    self.srchfilter = ko.observable("");
    self.searchdataArray = ko.observableArray([]);
    this.searchfilter = ko.observable("");
    self.messages = ko.observableArray();
    self.templatename = ko.observable("");
    self.templateCode = ko.observable("");
    self.tablename = ko.observable("");
    self.viewName = ko.observable("");
    self.stagingTableName = ko.observable("");
    self.templateid = ko.observable("0");
    self.projectname = ko.observable("");
    self.parentobjectcode = ko.observable("");
    self.objectcode = ko.observable("");
    self.objectCode = ko.observable("");
    self.clouddatatable = ko.observable("");
    self.normalizeFlag = ko.observableArray(["checked"]);
    self.disableCheckBox = ko.observable(false);
    this.groupValid = ko.observable();
    this.editRow = ko.observable();
    self.ColsObservableArray = ko.observableArray([]);
    self.ColTypeArray = ko.observableArray([]);
    self.deleteColArray = ko.observableArray([]);
    self.batchName = ko.observable("");
    self.projId = ko.observable("");
    self.tempid = ko.observable("");
    self.scrollPos = ko.observable({ rowIndex: 0 });
    self.columnName = ko.observable("");
    // self.columnType = ko.observable("");
    self.opttype = ko.observable("INSERT");
    self.sequence = ko.observable();
    self.delColumn = ko.observable("");
    self.btnLbl = ko.observable("Save");
    self.btnLbl = ko.observable("Save");
    self.metaTableId = ko.observable("");
    self.loadType = ko.observable("external");
    self.selectedClumns = ko.observable(new Set([]));
    self.dupChkItem = ko.observableArray([]);

    self.loadMore = function () {
      self.scrollPos({ rowIndex: self.scrollPos._latestValue.rowIndex + 5 });
    };

    this.columnTypedata = new ArrayDataProvider(self.ColTypeArray, {
      keyAttributes: "value",
    });

    this.deleteClmnData = new ArrayDataProvider(self.deleteColArray, {
      keyAttributes: "value",
    });

    this.eatNonNumbers = (event) => {
      let charCode = event.which ? event.which : event.keyCode;
      let char = String.fromCharCode(charCode);
      let replacedValue = char.replace(/[^0-9\.]/g, "");
      if (char !== replacedValue) {
        event.preventDefault();
      }
    };

    this.templateNameValidator = ko.observableArray([
      new AsyncRegExpValidator({
        pattern: "^[A-Za-z0-9_]*$",
        hint: "Special characters & Spaces are not allowed",
        messageDetail: "The value must not contain Spaces & special characters",
      }),
    ]);

    this.templateCodeValidator = ko.observableArray([
      new AsyncRegExpValidator({
        pattern: "^[A-Za-z0-9_]*$",
        hint: "Special characters & Spaces are not allowed",
        messageDetail: "The value must not contain Spaces & special characters",
      }),
    ]);

    self.checkSpaces = function (event) {
      if (event.detail.value) {
      }
    };

    self.optTypeArray = ko.observableArray([
      {
        id: 1,
        value: "INSERT",
        label: "INSERT",
      },
      {
        id: 2,
        value: "DELETE",
        label: "DELETE",
      },
    ]);
    this.opttypedata = new ArrayDataProvider(self.optTypeArray, {
      keyAttributes: "value",
    });

    self.optTypeValueChange = function (event) {
      if (event.detail.value) {
        self.opttype(event.detail.value);
      }
    };

    self.clumnNameChanged = function (event) {
      self.columnName(event.detail.value);
    };

    self.srcColumnTypeChanged = function (event) {
      self.srcClumnType(event.detail.value);
    };

    self.showViewPopup = function () {
      const popup = document.getElementById("viewPopup");
      popup.open("#go");
    };

    self.openCheckDupDailog = function () {
      document.querySelector("#dupliDailog").open();
    };

    self.closeDuDailog = function () {
      document.querySelector("#dupliDailog").close();
    };

    self.closeLoadDailog = function () {
      document.querySelector("#loadDialog").close();
    };

    self.closeclumnDailog = function () {
      document.querySelector("#clumnDialog").close();
    };
    self.openclumnDailog = function () {
      self.columnName("");
      self.delColumn("");
      self.opttype("INSERT");
      self.sequence("");
      // self.columnType('');

      document.querySelector("#clumnDialog").open();
    };

    self.messagesDataProvider = new oj.ArrayDataProvider(self.messages);
    this.close = function (event) {
      document.getElementById("modalDialog1").close();
    };
    this.open = function (event) {
      document.getElementById("modalDialog1").open();
    };

    self.openDailog = function () {};

    function getProjectData() {
      while (self.projectsNameArray().length > 0) {
        self.projectsNameArray.pop();
      }
      let url = riteUTils.riteProps.getAllProjectHeaders;
      getDetails(url)
        .then((res) => {
          $(".progress").show();
          if (res) {
            for (let i = 0; i < res.length; i++) {
              self.projectsNameArray.push({
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
    this.projectNamedata = new ArrayDataProvider(self.projectsNameArray, {
      keyAttributes: "id",
    });

    self.projnameValueChange = function (event) {
      if (event.detail.value) {
        const templateName = self
          .searchdataArray()
          .find((item) => self.templatename() === item.templateName);
        const templateCode = self
          .searchdataArray()
          .find((item) => self.templateCode() === item.templateCode);

        if (templateName && !templateCode && self.templateid() == "0") {
          // this.templateNameInfo([{ summary: "", detail: "Template Name Already Exists", severity: "info" }]);
          self.messages.push({
            severity: "info",
            summary: "Template Name Already Exists",
            autoTimeout: 0,
          });
        }
        if (templateCode && !templateName && self.templateid() == "0") {
          // this.templateNameInfo([{ summary: "", detail: "Template Name Already Exists", severity: "info" }]);
          self.messages.push({
            severity: "info",
            summary: "Template Code  Already Exists",
            autoTimeout: 0,
          });

          // this.templateCodeInfo([{ summary: "", detail: "Template Code Already Exists", severity: "info" }]);
        }

        if (templateCode && templateName && self.templateid() == "0") {
          // this.templateCodeInfo([{ summary: "", detail: "Template Code Already Exists", severity: "info" }]);
          self.messages.push({
            severity: "info",
            summary: "Template  Name & Code Already Exists",
            autoTimeout: 0,
          });
        }

        $(".progress").show();
        self.projectsNameArray().forEach((itm) => {
          if (itm.id == event.detail.value) {
            self.projectname(itm.value);
          }
        });
        self.objsuggest([]);
        self.cloudtablesuggest([]);
        let url =
          riteUTils.riteProps.getParentObjectsByProjectId +
          "/" +
          self.projectId();
        getDetails(url)
          .then((res) => {
            if (res) {
              self.parentobjsuggest([]);
              for (let i = 0; i < res.length; i++) {
                self.parentobjsuggest.push({
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
    this.parentobjectdata = new ArrayDataProvider(self.parentobjsuggest, {
      keyAttributes: "id",
    });

    self.pobjCodeValueChange = function (event) {
      if (event.detail.value) {
        $(".progress").show();
        self.parentobjsuggest().forEach((item) => {
          if (event.detail.value == item.id) {
            self.objectCode(item.objectCode);
            self.parentobjectcode(item.label);
          }
        });
        let url =
          riteUTils.riteProps.getObjectsByObjectCode +
          "/" +
          self.projectId() +
          "/" +
          self.objectCode();
        getDetails(url)
          .then((res) => {
            if (res) {
              self.objsuggest([]);
              self.cloudtablesuggest([]);
              for (let i = 0; i < res.length; i++) {
                self.objsuggest.push({
                  value: res[i].objectName,
                  id: res[i].objectId,
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

    this.objectdata = new ArrayDataProvider(self.objsuggest, {
      keyAttributes: "id",
    });

    self.objCodeValueChange = function (event) {
      if (event.detail.value && self.objectId()) {
        const parentObjectCode = self
          .searchdataArray()
          .find((item) => self.parentObjectId() === item.parentObjectId);
        const ObjectCode = self
          .searchdataArray()
          .find((item) => self.objectId() === item.objectId);

        if (parentObjectCode && ObjectCode && self.templateid() == "0") {
          self.messages.push({
            severity: "info",
            summary:
              "Template Already Exists for the given Project and Object combination",
            autoTimeout: 0,
          });
          resetSourceTemplateHeadersCol();
        }

        self.objsuggest().forEach((itm) => {
          if ((itm.id = event.detail.value)) {
            if (event.detail.value && self.objectId()) {
              self.objsuggest().forEach((itm) => {
                if ((itm.id = event.detail.value)) {
                  self.objectcode(itm.value);
                }
              });
              //   checkIsObjectCodeExist()
              //  }
              //  else{
              getMetadataDetails();
              //  }
            }
          }
        });
      }
    };

    function getMetadataDetails() {
      if (self.objectId()) {
        let url =
          riteUTils.riteProps.getsourcetablenames +
          "?objectId=" +
          self.objectId();
        getDetails(url)
          .then((res) => {
            if (res) {
              self.cloudtablesuggest([]);
              for (let i = 0; i < res.length; i++) {
                self.cloudtablesuggest.push({
                  value: res[i].tableName,
                  id: res[i].tableId,
                  label: res[i].tableName,
                });
              }
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }

    this.clouddatatablenamedata = new ArrayDataProvider(
      self.cloudtablesuggest,
      { keyAttributes: "value" }
    );

    function checkIsObjectCodeExist() {
      if (self.objectId() && self.searchdataArray()) {
        let isObjCreated = false;
        self.searchdataArray().forEach((itm) => {
          if (itm.objectId == self.objectId()) {
            isObjCreated = true;
          }
        });
        if (isObjCreated) {
          self.messages.push({
            severity: "error",
            summary: "Template already created!",
            autoTimeout: 0,
          });
        } else {
          return isObjCreated;
        }
      }
    }

    self.resetSourceTemplate = function () {
      resetSourceTemplateHeadersCol();
    };
    function resetSourceTemplateHeadersCol() {
      self.templateid("0");
      self.templatename("");
      self.tempid("");
      self.templateCode("");
      self.projectname("");
      self.projectId("");
      self.parentObjectId("");
      self.parentobjectcode("");
      self.objectId("");
      self.objectcode("");
      self.metaDataTableId("");
      self.clouddatatable("");
      self.viewName("");
      self.stagingTableName("");
      self.btnLbl("Save");
      self.cloudtablesuggest([]);
      while (self.ColsObservableArray().length > 0) {
        self.ColsObservableArray.pop();
      }
    }

    self.saveMsg = function () {
      const valid = _checkValidationGroup();
      if (valid) {
        let editItems = self.dataprovider.getSubmittableItems();
        let parentObjId;

        // self.parentobjsuggest().forEach((itm) => {
        //   if (itm.value == self.parentObjectId()) {
        //     parentObjId = itm.id;
        //   }
        // });
        // self.projectsNameArray().forEach((item) => {
        //   self.projId(item.id);
        // });
        let metaId;
        if (!self.metaTableId()) {
          self.cloudtablesuggest().forEach((itm) => {
            if (itm.value == self.metaDataTableId()) {
              metaId = itm.id;
            }
          });
        } else {
          metaId = self.metaTableId();
        }
        let obj = {
          attribute1: "",
          attribute2: "",
          attribute3: "",
          attribute4: "",
          attribute5: "",
          metaDataTableId: metaId,
          objectId: self.objectId(),
          parentObjectId: self.parentObjectId(),
          templateCode: self.templateCode(),
          projectId: self.projectId(),
          stagingTableName: self.stagingTableName()
            ? self.stagingTableName()
            : null,
          templateId: self.tempid() ? self.tempid() : null,
          templateName: self.templatename(),
          viewName: "",
          lastUpdatedBy: sessionStorage.getItem("userName"),
          lastUpdatedDate: new Date().toISOString(),
        };

        let url = riteUTils.riteProps.savesourcetemplateheaders;
        postDetails(url, obj)
          .then((res) => {
            if (res) {
              if (res.templateId == "0" || res.templateId == null) {
                self.messages.push({
                  severity: "error",
                  summary: res.message,
                  autoTimeout: 0,
                });
              } else {
                self.tempid(res.templateId);
                self.messages.push({
                  severity: "confirmation",
                  summary: "Source Template Headers Saved/Updated Successfully",
                  autoTimeout: 0,
                });

                if (self.templateid() == "0") {
                  saveLines();
                  self.btnLbl("Update");
                  self.templateid("1");
                } else {
                  saveEditedItems();
                }
              }
            }
          })
          .catch((err) => {
            console.log(err);

            $(".progress").hide();
          });
        // templinesTable();
      }
    };

    function saveEditedItems() {
      var editItems = self.dataprovider.getSubmittableItems();
      if (editItems.length !== 0) {
        let url = riteUTils.riteProps.savesourcetemplatecolumns;
        let data = [];
        editItems.forEach((editItem) => {
          let obj = {
            columnId: editItem.item.data.columnId,
            attribute1: "",
            attribute2: "",
            attribute3: "",
            attribute4: "",
            attribute5: "",
            columnName: editItem.item.data.columnName,
            columnType: editItem.item.data.columnType,
            seq: editItem.item.data.seq,
            uniqueTransRef:
              editItem.item.data.uniqueTransRef[0] === "checked" ? "Y" : "N",
            selected: editItem.item.data.selected[0] === "checked" ? "Y" : "N",
            templateId: self.tempid(),
            width: parseInt(editItem.item.data.width),
            lastUpdatedBy: sessionStorage.getItem("userName"),
            lastUpdatedDate: new Date().toISOString(),
          };
          data.push(obj);
        });

        // editItems.forEach((editItem) =>{
        //   let obj={
        //     "columnId": editItem.item.data.rowId,
        //     "templateId": self.templateid(),
        //     "columnName": editItem.item.data.columnName,
        //     "selected": editItem.item.data.selected[0] === 'checked' ? 'Y' : 'N',
        //     "uniqueTransRef": editItem.item.data.uniqueTransRef[0] === 'checked' ? 'Y' : 'N',
        //     "seq": parseInt(editItem.item.data.seq),
        //     "columnType": "V",
        //     "width": parseInt(editItem.item.data.width),
        //     "attribute1": editItem.item.data.attribute1,
        //     "attribute2": editItem.item.data.attribute2,
        //     "attribute3": editItem.item.data.attribute3,
        //     "attribute4": editItem.item.data.attribute4,
        //     "attribute5": editItem.item.data.attribute5,
        //     "lastUpdatedBy": "ConvertRiteAdmin",
        //     "lastUpdatedDate": "2011-11-02T02:50:12.208Z",
        //     "creationDate": null,
        //     "createdBy": null
        //   };
        // data.push(obj);
        //});
        $(".progress").show();
        postDetails(url, data)
          .then((res) => {
            $(".progress").hide();
            self.messages.push({
              severity: "confirmation",
              summary: "Source Template Lines  Saved/Updated Successfully!",
              autoTimeout: 0,
            });
            templinesTable();
          })
          .catch((error) => {
            $(".progress").hide();
            console.log(error);
          });
      }
    }

    self.saveChkDuplicates = function () {
      let editItems = self.dataprovider.getSubmittableItems();
      let data = [];
      if (editItems.length == 0) {
        if (self.dupChkItem() && self.ColsObservableArray()) {
          self.dupChkItem().forEach((itm) => {
            self.ColsObservableArray().forEach((clitm) => {
              if (clitm.columnName == itm) {
                let obj = {
                  columnId: clitm.columnId,
                  attribute1: "",
                  attribute2: "",
                  attribute3: "",
                  attribute4: "",
                  attribute5: "",
                  columnName: clitm.columnName,
                  columnType: clitm.columnType,
                  seq: clitm.seq,
                  uniqueTransRef: "Y",
                  selected: clitm.selected[0] === "checked" ? "Y" : "N",
                  templateId: self.tempid(),
                  width: parseInt(clitm.width),
                  lastUpdatedBy: sessionStorage.getItem("userName"),
                  lastUpdatedDate: new Date().toISOString(),
                };
                data.push(obj);
              }
            });
          });
        }
        let url = riteUTils.riteProps.savesourcetemplatecolumns;
        $(".progress").show();
        postDetails(url, data)
          .then((res) => {
            $(".progress").hide();
            self.messages.push({
              severity: "confirmation",
              summary: "Source Template Lines  Saved/Updated Successfully!",
              autoTimeout: 0,
            });
            document.querySelector("#dupliDailog").close();
            templinesTable();
          })
          .catch((error) => {
            $(".progress").hide();
            console.log(error);
          });
      } else {
        self.messages.push({
          severity: "info",
          summary: "Please Save Edited Coloums before Updating Duplicates",
          autoTimeout: 0,
        });
      }
    };

    function saveLines() {
      // var editItems = self.dataprovider.getSubmittableItems();
      let url = riteUTils.riteProps.savesourcetemplatecolumns;
      let data = [];
      if (self.ColsObservableArray()) {
        let savData = self.ColsObservableArray();
        savData.forEach((itm) => {
          let obj = {
            columnId: "",
            attribute1: "",
            attribute2: "",
            attribute3: "",
            attribute4: "",
            attribute5: "",
            columnName: itm.columnName,
            columnType: itm.columnType,
            seq: itm.seq,
            uniqueTransRef: "",
            selected: itm.selected[0] === "checked" ? "Y" : "N",
            templateId: self.tempid(),
            width: parseInt(itm.width),
            lastUpdatedBy: sessionStorage.getItem("userName"),
            lastUpdatedDate: new Date().toISOString(),
          };
          data.push(obj);
        });
      }

      $(".progress").show();
      postDetails(url, data)
        .then((res) => {
          $(".progress").hide();
          self.messages.push({
            severity: "confirmation",
            summary: "Source Template Lines  Saved/Updated Successfully!",
            autoTimeout: 0,
          });
          templinesTable();
        })
        .catch((error) => {
          $(".progress").hide();
          console.log(error);
        });
    }

    self.saveUpdateColumns = function () {
      if (self.tempid() && self.opttype()) {
        let colName;
        let seq;
        if (self.opttype() == "INSERT") {
          colName = self.columnName();
          seq = parseInt(self.sequence());
        } else {
          colName = self.delColumn();
          seq = 0;
        }
        $(".progress").show();
        let url = riteUTils.riteProps.updateSourceTemplateColumns;
        let data = {
          columnName: colName,
          columnType: "V",
          templateId: self.tempid(),
          operationType: self.opttype(),
          displaySeq: seq,
        };
        postDetails(url, data)
          .then((res) => {
            if (res) {
              if (self.opttype() == "INSERT") {
                self.messages.push({
                  severity: "confirmation",
                  summary: "Column Added Successfully",
                  autoTimeout: 0,
                });
              } else {
                self.messages.push({
                  severity: "confirmation",
                  summary: "Column Deleted Successfully",
                  autoTimeout: 0,
                });
              }
              $(".progress").hide();
              document.querySelector("#clumnDialog").close();
              templinesTable();
            }
          })
          .catch((error) => {
            console.log(error);
            $(".progress").hide();
          });
      }
    };

    self.createStagingTable = function () {
      let metadataId;
      if (self.cloudtablesuggest()) {
        self.cloudtablesuggest().forEach((itm) => {
          if (itm.value == self.metaDataTableId()) {
            metadataId = itm.id;
          }
        });
      }

      let url =
        riteUTils.riteProps.createstgtable +
        "?environment=SOURCE" +
        "&templateId=" +
        self.tempid() +
        "&templateCode=" +
        self.templateCode() +
        "&tableId=" +
        metadataId;
      postDetails(url)
        .then((res) => {
          if (res) {
            self.messages.push({
              severity: "confirmation",
              summary: res.tableName,
              autoTimeout: 0,
            });
            let name = res.tableName;
            let parts = name.split(":").map((item) => item.trim());
            let value = parts[1];
            self.stagingTableName(value.trim());
          }
        })
        .catch((error) => {
          console.log(error);
        });
    };

    self.loadSourceDialog = function (event) {
      document.querySelector("#loadDialog").open();
    };
    self.fileName = ko.observable("");

    self.UploadForLoaddata = function (event) {
      $(".progress").show();
      var formdata = new FormData();
      formdata.append("file", event.detail.files[0]);
      formdata.append("type", "");

      var extRegEx = /(?:\.([^.]+))?$/;
      let fileExtn = extRegEx.exec(event.detail.files[0].name)[1];
      if (fileExtn == "csv" || fileExtn == "CSV") {
        var config = {
          method: "Post",
          url: riteUTils.riteProps.uploadFiles,
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
              self.fileName(response.data.fileName);
              self.messages.push({
                severity: "confirmation",
                // detail: response.data.count + " Records",
                summary: "File Upload Successfully",
                autoTimeout: 0,
              });
              postCreateTable();
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

    function postCreateTable() {
      if (self.fileName()) {
        let url =
          riteUTils.riteProps.loadSourceData +
          "?dataFileName=" +
          self.fileName() +
          "&templateId=" +
          self.tempid() +
          "&templateName=" +
          self.templatename() +
          "&batchName=" +
          self.batchName();
        postDetails(url).then((res) => {
          if (res) {
            self.messages.push({
              severity: "confirmation",
              summary: "Successfully Uploaded",
              autoTimeout: 0,
            });
            document.querySelector("#loadDialog").close();
          }
        });

        self.messages.push({
          severity: "confirmation",
          summary: "Save Successfully!",
          autoTimeout: 0,
        });
      }
    }

    // self.loadSourceData = function (event) {
    //   let url =
    //     riteUTils.riteProps.loadSourceData +
    //     "?dataFileName=Rite_Source_MD_JSB_Template.csv" +
    //     "&batchName=JSB_INT_Test" +
    //     "&templateId=" +
    //     self.templateid() +
    //     "&templateName=" +
    //     self.templatename();
    //   postDetails(url).then((res) => {
    //     if (res) {
    //     }
    //   });
    // };

    self.resetloadData = function (event) {};

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

    this.searchanyvalueChanged = function () {
      this.searchfilter(document.getElementById("filter").rawValue);
    }.bind(this);

    this.sequenceDisabled = ko
      .computed(function () {
        if (self.opttype() == "INSERT") {
          return false;
        } else {
          return true;
        }
      })
      .bind(this);

    self.loadSourceDisabled = ko
      .computed(function () {
        if (self.stagingTableName()) {
          return false;
        } else {
          return true;
        }
      })
      .bind(this);

    this.searchdataprovider = ko.computed(function () {
      const filterRegEx = new RegExp(this.searchfilter(), "i");
      const filterCriterion = {
        op: "$or",
        criteria: [
          { op: "$regex", value: { templateName: filterRegEx } },
          { op: "$regex", value: { templateCode: filterRegEx } },
        ],
      };
      const arrayDataProvider = new ArrayDataProvider(self.searchdataArray, {
        keyAttributes: "templateId",
      });
      return new ListDataProviderView(arrayDataProvider, {
        filterCriterion: filterCriterion,
      });
    }, this);

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
                return workpackid === item.templateId;
              }
            );
            self.btnLbl("Update");
            self.templatename(selrow.templateName);
            self.templateCode(selrow.templateCode);
            self.projectname(selrow.projectName);
            self.projectId(selrow.projectId);
            self.templateid("1");
            self.tempid(selrow.templateId);
            self.parentobjectcode(selrow.parentObjectCode);
            self.parentObjectId(selrow.parentObjectId);
            self.objectcode(selrow.objectCode);
            self.clouddatatable(selrow.metaDataTableName);
            self.metaDataTableId(selrow.metaDataTableName);
            self.metaTableId(selrow.metaDataTableId);
            self.objectId(selrow.objectId);
            self.viewName(selrow.viewName);
            self.stagingTableName(selrow.stagingTableName);
            tempSelectedFlag = true;
            getMetadataDetails();
            templinesTable();

            document.querySelector("#srchDailog").close();
          }
        }
      }
    };

    self.metaDataTabNameChange = function (event) {
      if (event.detail.value) {
        self.clouddatatable(event.detail.value);
        $(".progress").show();
        while (self.ColsObservableArray().length > 0) {
          self.ColsObservableArray.pop();
        }
        let url =
          riteUTils.riteProps.getsourcecolumnsbyname +
          "?sourceTableName=" +
          self.metaDataTableId();
        getDetails(url)
          .then((res) => {
            if (res) {
              for (let i = 0; i < res.length; i++) {
                self.ColsObservableArray.push({
                  rowId: i + 1,
                  columnId: "",
                  columnName: res[i].columnName,
                  nullAllowedFlag: res[i].nullAllowedFlag,
                  columnType: res[i].columnType,
                  seq: res[i].columnSequence,
                  width: res[i].width,
                  selected: ["checked"],
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
    };

    function templinesTable() {
      if (self.tempid()) {
        $(".progress").show();
        while (self.ColsObservableArray().length > 0) {
          self.ColsObservableArray.pop();
        }
        let url =
          riteUTils.riteProps.getsourcetemplatecolumns +
          "?templateId=" +
          self.tempid();
        getDetails(url)
          .then((res) => {
            if (res) {
              for (let i = 0; i < res[0].length; i++) {
                self.ColsObservableArray.push({
                  rowId: i + 1,
                  columnId: res[0][i].columnId,
                  templateId: res[0][i].templateId,
                  columnName: res[0][i].columnName,
                  selected: [
                    res[0][i].selected === "Y" || res[0][i].selected === "N"
                      ? "checked"
                      : "unchecked",
                  ],
                  uniqueTransRef: [
                    res[0][i].uniqueTransRef === "Y" ? "checked" : "unchecked",
                  ],
                  seq: res[0][i].seq,
                  columnType: res[0][i].columnType,
                  width: res[0][i].width,
                  attribute1: res[0][i].attribute1,
                  attribute2: res[0][i].attribute2,
                  attribute3: res[0][i].attribute3,
                  attribute4: res[0][i].attribute4,
                  attribute5: res[0][i].attribute5,
                  lastUpdatedBy: res[0][i].lastUpdatedBy,
                  lastUpdatedDate: res[0][i].lastUpdatedDate,
                  creationDate: res[0][i].creationDate,
                  createdBy: res[0][i].createdBy,
                });

                self.deleteColArray.push({
                  id: res[0][i].columnId,
                  value: res[0][i].columnName,
                  label: res[0][i].columnName,
                });
              }
              document.getElementById("configTable").refresh();
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

    this.srcTempDp = new ArrayDataProvider(self.deleteColArray, {
      keyAttributes: "value",
    });

    this.dataprovider = new BufferingDataProvider(
      new ArrayDataProvider(self.ColsObservableArray, {
        keyAttributes: "rowId",
      })
    );

    self.isTemplateUniqSelected = function (event) {
      if (event.detail.value) {
        self.dupChkItem([]);
        let chckitm = event.detail.value;
        chckitm.forEach((itm) => {
          self.dupChkItem.push(itm);
        });
        self.normalizeFlag(["unchecked"]);
      } else {
        self.normalizeFlag(["checked"]);
        self.dupChkItem([]);
      }
    };

    self.selectValText = ko.computed(() => {
      const selectVal = self.selectedClumns();
      return selectVal ? Array.from(selectVal).join(", ") : "";
    });

    //source template duplicates

    this.dataprovider.addEventListener(
      "submittableChange",
      function (event) {
        var submittable = event.detail;
        this.showSubmittableItems(submittable);
      }.bind(this)
    );

    self.showSrchDailog = function () {
      document.querySelector("#srchDailog").open();
      getLOVData();
    };

    self.closeSrchDailog = function () {
      document.querySelector("#srchDailog").close();
    };

    this.chckDupdataprovider = new ArrayDataProvider(self.cloudtablesuggest, {
      keyAttributes: "value",
    });

    function getLOVData() {
      $(".progress").show();
      let url = riteUTils.riteProps.getsourcetemplates;
      while (self.searchdataArray().length !== 0) {
        self.searchdataArray.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            for (let i = 0; i < res.length; i++) {
              self.searchdataArray.push({
                templateId: res[i].templateId,
                templateCode: res[i].templateCode,
                templateName: res[i].templateName,
                objectId: res[i].objectId,
                parentObjectId: res[i].parentObjectId,
                parentObjectCode: res[i].parentObjectName,
                objectCode: res[i].objectName,
                metaDataTableName: res[i].metaDataTableName,
                projectId: res[i].projectId,
                projectName: res[i].projectName,
                normalizeDataFlag: res[i].normalizeDataFlag,
                metaDataTableId: res[i].metaDataTableId,
                stagingTableName: res[i].stagingTableName,
                viewName: res[i].viewName,
                attribute1: res[i].attribute1,
                attribute2: res[i].attribute2,
                attribute3: res[i].attribute3,
                attribute4: res[i].attribute4,
                attribute5: res[i].attribute5,
                lastUpdatedBy: res[i].lastUpdatedBy,
                lastUpdatedDate: res[i].lastUpdatedDate,
                creationDate: res[i].creationDate,
                createdBy: res[i].createdBy,
              });
            }
          }
          $(".progress").hide();
        })
        .catch((error) => {
          $(".progress").hide();
        });
    }

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
          if (!self.tempid()) {
            self.messages.push({
              severity: "error",
              summary: "please Save Template Lines Before Edit",
              autoTimeout: 0,
            });
            self.dataprovider.resetAllUnsubmittedItems();
          }
        }
      }
    }.bind(this);

    var isRowDataUpdated = function () {
      var propNames = Object.getOwnPropertyNames(this.rowData);
      for (var i = 0; i < propNames.length; i++) {
        if (this.rowData[propNames[i]] !== this.originalData[propNames[i]]) {
          return true;
        }
      }
      return false;
    }.bind(this);

    self.checkboxselect = function (event) {
      var x3 = document.getElementById("clt3");
      if (x3.value[0] === "checked") {
        x3.value = ["unchecked"];
      } else if (x3.value[0] === "unchecked") {
        x3.value = ["checked"];
      }
    };
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
    this.showSubmittableItems = function (submittable) {
      var textarea = document.getElementById("bufferContent");
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

    function getSourceDetails(serName) {
      return new Promise((reslove, reject) => {
        axios
          .get(serName, riteUTils.riteHeader)
          .then((response) => {
            reslove(response.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    }

    this.connected = () => {
      accUtils.announce("Source Template .", "assertive");
      document.title = "Source Template ";
      getProjectData();
      getLOVData();
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
  return Source_TemplateViewModel;
});
