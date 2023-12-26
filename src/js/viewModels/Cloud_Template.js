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
  "ojs/ojcontext",
  "ojs/ojbufferingdataprovider",
  "ojs/ojarraydataprovider",
  "ojs/ojlistdataproviderview",
  "ojs/ojasyncvalidator-regexp",
  "ojs/ojinputtext",
  "ojs/ojbutton",
  "ojs/ojtable",
  "ojs/ojcheckboxset",
  "ojs/ojselectsingle",
  "ojs/ojselectcombobox",
  "ojs/ojformlayout",
  "ojs/ojvalidationgroup",
  "ojs/ojdefer",
  "oj-c/select-multiple",
  "ojs/ojdialog",
  "ojs/ojmessages",
], function (
  accUtils,
  ko,
  axios,
  Context,
  BufferingDataProvider,
  ArrayDataProvider,
  ListDataProviderView,
  AsyncRegExpValidator
) {
  function Cloud_TemplateViewModel() {
    var self = this;
    this.groupValid = ko.observable();
    this.editRow = ko.observable();
    self.templateName = ko.observable();
    self.templateCode = ko.observable();
    self.projectname = ko.observable();
    self.temp = ko.observable("0");
    self.parentobject = ko.observable();
    self.objectcode = ko.observable();
    self.metaDataTableId = ko.observable();
    self.version = ko.observable();
    self.scrollPos = ko.observable({ rowIndex: 0 });
    self.messages = ko.observableArray();
    self.projectsNameArray = ko.observableArray([]);
    self.parentobjsuggest = ko.observableArray([]);
    self.objsuggest = ko.observableArray([]);
    self.versionArray = ko.observableArray([]);
    self.cloudMetaDataArray = ko.observableArray([]);
    self.sourceTemplateArray = ko.observableArray([]);
    self.ColsObservableArray = ko.observableArray([]);
    self.messagesDataProvider = new oj.ArrayDataProvider(self.messages);
    self.searchdataArray = ko.observableArray([]);
    this.searchfilter = ko.observable("");
    self.srchfilter = ko.observable("");
    self.srccolsLOV = ko.observableArray([]);
    self.mappingSetDisabled = ko.observable(false);
    self.mappingSetLov = ko.observableArray([]);
    self.mappingValueDisabled = ko.observable(false);
    self.mappingVal = ko.observable();
    self.mappingColArray = ko.observableArray([]);
    self.toggle = ko.observable(true);
    self.templateId = ko.observable("");
    self.projectId = ko.observable("");
    self.parentobjectName = ko.observable("");
    self.objectName = ko.observable("");
    self.objectCode = ko.observable("");
    self.cloudmetadatatableName = ko.observable("");
    self.sourcetemplateName = ko.observable("");
    self.sourceTemplateId = ko.observable("");
    self.formulaSetArray = ko.observableArray([]);
    self.mappingSetArray = ko.observableArray([]);
    self.parentObjectId = ko.observable("");
    self.objectId = ko.observable("");
    self.stagingTableName = ko.observable("");
    self.preTransfomHook = ko.observable("");
    self.PostTransformHook = ko.observable("");
    self.FBDIHDLgenerationHook = ko.observable("");
    self.userHooksArray = ko.observableArray([]);
    self.userHooksData = ko.observableArray([]);
    self.btnLbl = ko.observable("Save");
    self.objectCompId = ko.observable("");

    // Please reference the oj-module jsDoc for additional information.

    /**
     * Optional ViewModel method invoked after the View is inserted into the
     * document DOM.  The application can put logic that requires the DOM being
     * attached here.
     * This method might be called multiple times - after the View is created
     * and inserted into the DOM and after the View is reconnected
     * after being disconnected.
     */

    self.loadMore = function () {
      self.scrollPos({ rowIndex: self.scrollPos._latestValue.rowIndex + 5 });
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

    this.searchanyvalueChanged = function () {
      this.searchfilter(document.getElementById("filter").rawValue);
    }.bind(this);

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

    function getProjectData() {
      $(".progress").show();
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
          console.log(error);
        });
    }
    this.projectNamedata = new ArrayDataProvider(self.projectsNameArray, {
      keyAttributes: "id",
    });

    self.projnameValueChange = function (event) {
      if (event.detail.value) {
        const templateName = self
          .searchdataArray()
          .find((item) => self.templateName() === item.templateName);
        const templateCode = self
          .searchdataArray()
          .find((item) => self.templateCode() === item.templateCode);

        if (templateName && !templateCode && self.temp() == "0") {
          self.messages.push({
            severity: "info",
            summary: "Template Name Already Exists",
            autoTimeout: 0,
          });
        }
        if (templateCode && !templateName && self.temp() == "0") {
          self.messages.push({
            severity: "info",
            summary: "Template Code  Already Exists",
            autoTimeout: 0,
          });
        }

        if (templateCode && templateName && self.temp() == "0") {
          self.messages.push({
            severity: "info",
            summary: "Template  Name & Code Already Exists",
            autoTimeout: 0,
          });
        }

        if (self.projectsNameArray()) {
          self.projectsNameArray().forEach((itm) => {
            if (itm.id == event.detail.value) {
              self.projectname(itm.value);
            }
          });
        }
        getParentObject();
      }
    };
    function getParentObject() {
      if (self.projectId()) {
        $(".progress").show();
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
    }
    this.parentobjectdata = new ArrayDataProvider(self.parentobjsuggest, {
      keyAttributes: "value",
    });

    self.pobjCodeValueChange = function (event) {
      if (event.detail.value) {
        $(".progress").show();
        self.parentobjectName(event.detail.value);
        self.parentobjsuggest().forEach((item) => {
          if (event.detail.value == item.value) {
            self.objectCode(item.objectCode);
            self.objectCompId(item.id);
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
      if (event.detail.value && self.objectcode()) {
        const parentObjectCode = self
          .searchdataArray()
          .find((item) => self.objectCompId() === item.parentObjectId);
        const ObjectCode = self
          .searchdataArray()
          .find((item) => self.objectcode() === item.objectId);

        if (parentObjectCode && ObjectCode && self.temp() == "0") {
          self.messages.push({
            severity: "info",
            summary:
              "Template Already Exists for the given Project and Object combination",
            autoTimeout: 0,
          });
          resetCloudTemplates();
        }

        if (self.objsuggest()) {
          self.objsuggest().forEach((itm) => {
            if (itm.id == event.detail.value) {
              self.objectName(itm.value);
            }
          });
        }

        // if (event.detail.value && self.objectcode() && self.searchdataArray().length!==0  ) {
        //  // self.searchdataArray().forEach((itm)=>{
        //   //if(itm.objectId == self.objectcode() ){
        //     checkIsObjectCodeExist()
        //  }
        //  else{
        getSourceTempColumns();
        //  }
        // });
      }
    };
    // };

    function checkIsObjectCodeExist() {
      if (self.objectcode() && self.searchdataArray()) {
        let isObjCreated = false;
        self.searchdataArray().forEach((itm) => {
          if (itm.objectId == self.objectcode()) {
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
    function getSourceTempColumns(parentObjectId) {
      if (self.objectcode() && self.parentobject() && self.projectId()) {
        $(".progress").show();
        let parobj;
        if (parentObjectId == null) {
          self.parentobjsuggest().forEach((itm) => {
            if (itm.value == self.parentobject()) {
              parobj = itm.id;
            }
          });
        } else {
          parobj = parentObjectId;
        }
        self.sourceTemplateArray([]);
        self.cloudMetaDataArray([]);
        let url =
          riteUTils.riteProps.getCloudTablesTemplates +
          "?objectId=" +
          self.objectcode() +
          "&parentObjectId=" +
          parobj +
          "&projectId=" +
          self.projectId();
        getDetails(url)
          .then((res) => {
            if (res) {
              for (let i = 0; i < res.sourceTemplateHeaders.length; i++) {
                self.sourceTemplateArray.push({
                  value: res.sourceTemplateHeaders[i].templateName,
                  id: res.sourceTemplateHeaders[i].templateId,
                  label: res.sourceTemplateHeaders[i].templateName,
                });
              }
              for (let i = 0; i < res.cloudTables.length; i++) {
                self.cloudMetaDataArray.push({
                  value: res.cloudTables[i].tableName,
                  id: res.cloudTables[i].tableId,
                  label: res.cloudTables[i].tableName,
                });
              }
            }
            $(".progress").hide();
          })
          .catch((error) => {
            console.log(error);
            $(".progress").hide();
          });
      }
    }

    this.sourceTempData = new ArrayDataProvider(self.sourceTemplateArray, {
      keyAttributes: "id",
    });
    this.cloudMetaData = new ArrayDataProvider(self.cloudMetaDataArray, {
      keyAttributes: "id",
    });

    self.showViewPopup = function () {
      const popup = document.getElementById("viewPopup");
      popup.open("#go");
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
                return workpackid === item.templateId;
              }
            );
            self.btnLbl("Update");
            getFormulaSets();
            getMappingSets();
            self.temp("1");
            self.templateName(selrow.templateName);
            self.templateCode(selrow.templateCode);
            self.projectname(selrow.projectName);
            self.projectId(selrow.projectId);
            getParentObject();
            self.templateId(selrow.templateId);
            self.parentobjectName(selrow.parentObjectCode);
            self.parentobject(selrow.parentObjectCode);
            // self.parentobject(selrow.parentObjectId);
            self.objectcode(selrow.objectId);
            self.parentObjectId(selrow.parentObjectId);
            self.objectId(selrow.objectId);
            self.objectName(selrow.objectCode);
            self.metaDataTableId(selrow.metaDataTableId);
            self.cloudmetadatatableName(selrow.metaDataTableName);
            // self.sourceTemplateId(selrow.sourceTemplateId)
            setTimeout(() => {
              getSourceTempColumns(selrow.parentObjectId);
            }, 500);

            // self.sourcetemplateName(selrow.sourceTemplateName);
            self.version(selrow.version);
            self.stagingTableName(selrow.stagingTableName);
            setTimeout(() => {
              self.sourceTemplateId(selrow.sourceTemplateId);
              getMappingColums();
            }, 2000);

            templinesTable();
            getUserHooks();
            setTimeout(() => {
              getUserHooksByTempId();
            }, 2000);
            document.querySelector("#srchDailog").close();
          }
        }
      }
    };

    getMappingSets();
    self.resetCludTemplate = function () {
      resetCloudTemplates();
    };

    function resetCloudTemplates() {
      self.temp("0");
      self.templateName("");
      self.templateCode("");
      self.projectname("");
      self.projectId("");
      self.parentobject("");
      self.templateId("");
      self.objectcode("");
      self.parentObjectId("");
      self.objectId("");
      self.metaDataTableId("");
      self.stagingTableName("");
      self.sourceTemplateId("");
      self.version("");
      self.btnLbl("Save");

      while (self.ColsObservableArray().length > 0) {
        self.ColsObservableArray.pop();
      }
    }

    this.dataprovider = new BufferingDataProvider(
      new ArrayDataProvider(self.ColsObservableArray, {
        keyAttributes: "columnId",
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
      // while (self.mappingSetLov().length) {
      //   self.mappingSetLov.pop();
      // }
      if (this.rowData.mappingType === "As-Is") {
        self.mappingSetDisabled(true);
        self.mappingValueDisabled(true);
      }
      if (
        this.rowData.mappingType === "Prefix" ||
        this.rowData.mappingType === "Suffix" ||
        this.rowData.mappingType === "Constant"
      ) {
        self.mappingSetDisabled(true);
        self.mappingValueDisabled(false);
        // this.rowData.mappingVal = "";
      }
      if (
        this.rowData.mappingType === "One to One" ||
        this.rowData.mappingType === "Two to One" ||
        this.rowData.mappingType === "Three to One" ||
        this.rowData.mappingType === "Formula"
      ) {
        self.mappingSetDisabled(false);
        self.mappingValueDisabled(false);
        // this.rowData.mappingVal = [];
      }
    }.bind(this);

    this.beforeRowEditEndListener = function (event) {
      var detail = event.detail;
      if (!self.templateId()) {
        self.messages.push({
          severity: "error",
          summary: "please Save Template Lines Before Edit",
          autoTimeout: 0,
        });
        self.dataprovider.resetAllUnsubmittedItems();
      } else {
        if (!detail.cancelEdit) {
          if (hasValidationErrorInRow(event.target)) {
            event.preventDefault();
          } else {
            if (isRowDataUpdated()) {
              var key = detail.rowContext.status.rowKey;

              // if (this.rowData.mappingType === 'One to One' || this.rowData.mappingType === 'Two to One' || this.rowData.mappingType === 'Three to One' || this.rowData.mappingType === 'Formula') {
              //   self.mappingSetDisabled(false);
              //   self.mappingValueDisabled(true);
              // }
              // else if (this.rowData.mappingType === 'Prefix' || this.rowData.mappingType === 'Suffix' || this.rowData.mappingType === 'Constant') {
              //   this.rowData.mappingSetName = "";
              //   this.rowData.mappingSetId = "";
              //   this.rowData.mappingVal="";

              // } else if (this.rowData.mappingType === 'As-Is') {
              //   self.mappingSetDisabled(true);
              //   self.mappingValueDisabled(true);
              //   this.rowData.mappingSetName = "";
              //   this.rowData.mappingSetId = "";
              //   this.rowData.mappingVal=[];
              // }

              this.dataprovider.updateItem({
                metadata: { key: key },
                data: this.rowData,
              });
            }
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

    self.showSrchDailog = function () {
      document.querySelector("#srchDailog").open();
      getLOVData();
    };

    self.closeSrchDailog = function () {
      document.querySelector("#srchDailog").close();
    };

    function templinesTable() {
      if (self.templateId()) {
        $(".progress").show();
        let url =
          riteUTils.riteProps.getcloudtemplatecolumns +
          "?templateId=" +
          self.templateId();
        while (self.ColsObservableArray().length !== 0) {
          self.ColsObservableArray.pop();
        }
        getDetails(url)
          .then((res) => {
            if (res) {
              console.log(res);
              for (let i = 0; i < res.length; i++) {
                let mapvalue = [];
                if (res[i].mappingValue1) {
                  mapvalue.push(res[i].mappingValue1);
                }
                if (res[i].mappingValue2) {
                  mapvalue.push(res[i].mappingValue2);
                }
                if (res[i].mappingValue3) {
                  mapvalue.push(res[i].mappingValue3);
                }
                if (res[i].mappingValue4) {
                  mapvalue.push(res[i].mappingValue4);
                }
                if (res[i].mappingValue5) {
                  mapvalue.push(res[i].mappingValue4);
                }
                let srcid;
                let srcclums;
                if (res[i].uniqueTransRef == "Y") {
                  srcid = 999;
                  srcclums = "ORIG_TRANS_ID";
                } else {
                  srcid = res[i].sourceColumnId;
                  srcclums = res[i].sourceColumnName;
                }
                self.ColsObservableArray.push({
                  rowId: i + 1,
                  columnId: res[i].columnId,
                  columnName: res[i].columnName,
                  templateId: res[i].templateId,
                  description: res[i].description,
                  columnType: res[i].columnType,
                  width: res[i].width,
                  nullAllowedFlag: res[i].nullAllowedFlag,
                  uniqueTransRef: [
                    res[i].uniqueTransRef === "Y" ||
                    res[i].uniqueTransRef === "N"
                      ? "checked"
                      : "unchecked",
                  ],
                  selected: [
                    res[i].selected === "Y" || res[i].selected === "N"
                      ? "checked"
                      : "unchecked",
                  ],
                  sourceColumnId: srcid,
                  sourceColumnName: srcclums,
                  mappingType: res[i].mappingType,
                  mappingSetId: res[i].mappingSetId,
                  mappingSetName: res[i].mappingSetName,
                  seq: res[i].seq,
                  mappingVal: mapvalue,
                });
              }
            }
            $(".progress").hide();
          })
          .catch((error) => {
            $(".progress").hide();
            console.log(error);
          });
      }
    }
    function getLOVData() {
      $(".progress").show();
      let url = riteUTils.riteProps.getallcloudtemplates;
      while (self.searchdataArray().length !== 0) {
        self.searchdataArray.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            console.log(res);
            for (let i = 0; i < res.length; i++) {
              self.searchdataArray.push({
                templateId: res[i].templateId,
                templateName: res[i].templateName,
                templateCode: res[i].templateCode,
                version: res[i].version,
                projectId: res[i].projectId,
                projectName: res[i].projectName,
                parentObjectId: res[i].parentObjectId,
                parentObjectCode: res[i].parentObjectCode,
                objectId: res[i].objectId,
                objectCode: res[i].objectCode,
                metaDataTableId: res[i].metaDataTableId,
                metaDataTableName: res[i].metaDataTableName,
                sourceTemplateId: res[i].sourceTemplateId,
                sourceTemplateName: res[i].sourceTemplateName,
                stagingTableName: res[i].stagingTableName,
                viewName: res[i].viewName,
                primaryTemplateFlag: res[i].primaryTemplateFlag,
                attribute1: res[i].attribute1,
                attribute2: res[i].attribute2,
                attribute3: res[i].attribute3,
                attribute4: res[i].attribute4,
                attribute5: res[i].attribute5,
              });
            }
            $(".progress").hide();
          }
        })
        .catch((error) => {
          $(".progress").hide();
          console.log(error);
        });
    }

    this.checkmand = function (CloudColumnName) {
      var matchparent = ko.utils.arrayFirst(
        self.ColsObservableArray(),
        function (item) {
          return CloudColumnName === item.columnName;
        }
      );
      if (matchparent != null) {
        if (matchparent.nullAllowedFlag == "N") {
          return true;
        }
      } else {
        return false;
      }
    };
    this.checkdatatype = function (CloudColumnName) {
      var matchparent = ko.utils.arrayFirst(
        self.ColsObservableArray(),
        function (item) {
          return CloudColumnName === item.columnName;
        }
      );
      if (matchparent != null) {
        if (matchparent.columnType == "V") {
          return matchparent.columnType + "(" + matchparent.width + ")";
        } else {
          return matchparent.columnType;
        }
      } else {
        return "";
      }
    };

    function getVersions() {
      $(".progress").show();
      let url = riteUTils.riteProps.getVersionData;
      while (self.versionArray().length !== 0) {
        self.versionArray.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            self.versionArray(res);
            $(".progress").hide();
          }
        })
        .catch((error) => {
          $(".progress").hide();
        });
    }
    this.versionData = new ArrayDataProvider(self.versionArray, {
      keyAttributes: "id",
    });

    self.saveMsg = function () {
      const valid = _checkValidationGroup();
      if (valid) {
        $(".progress").show();
        let editItems = self.dataprovider.getSubmittableItems();
        let parobj;
        if (self.parentobjsuggest()) {
          self.parentobjsuggest().forEach((itm) => {
            if (itm.value == self.parentobject()) {
              parobj = itm.id;
            }
          });
        }
        let obj = {
          templateId: self.templateId() ? self.templateId() : null,
          templateName: self.templateName(),
          templateCode: self.templateCode(),
          projectId: self.projectId(),
          parentObjectId: parobj,
          objectId: self.objectcode(),
          metaDataTableId: self.metaDataTableId(),
          sourceTemplateId: self.sourceTemplateId(),
          version: self.version(),
          stagingTableName: self.stagingTableName()
            ? self.stagingTableName()
            : "",
        };
        let url = riteUTils.riteProps.savecloudtemplateheaders;
        postDetails(url, obj)
          .then((res) => {
            if (res) {
              if (self.temp()) {
                self.templateId(res.templateId);
                self.messages.push({
                  severity: "confirmation",
                  summary:
                    " Cloud Template headers  Saved/Updated Successfully",
                  autoTimeout: 0,
                });
                self.btnLbl("Update");
                if (self.temp() == "0") {
                  saveTemplateLines();
                  self.temp("1");
                } else {
                  saveTemplatedEditedItems();
                }
              }
            }
            $(".progress").hide();
          })
          .catch((err) => {
            console.log(err);
            if (err.response.status == "417") {
              self.messages.push({
                severity: "error",
                summary: "Template Code and Name Should be Unique",
                autoTimeout: 0,
              });
            }
            $(".progress").hide();
          });
      }
    };

    function saveTemplateLines() {
      if (self.templateId()) {
        $(".progress").show();
        data = [];
        if (self.ColsObservableArray()) {
          self.ColsObservableArray().forEach((itm) => {
            let srcid = "";
            let srcclum = "";
            if (self.mappingColArray()) {
              if (itm.mappingType == "As-Is") {
                self.mappingColArray().forEach((srcitm) => {
                  if (srcitm.value == itm.columnName) {
                    srcid = srcitm.id;
                    srcclum = srcitm.value;
                  }
                });
              }
            }
            let obj = {
              columnName: itm.columnName,
              templateId: self.templateId(),
              description: itm.description,
              columnType: itm.columnType,
              width: itm.width,
              nullAllowedFlag: itm.nullAllowedFlag == "N" ? "N" : "Y",
              uniqueTransRef: "",
              selected: "Y",
              sourceColumnId: srcid,
              sourceColumnName: srcclum,
              mappingType: itm.mappingType,
              mappingSetId: "",
              mappingSetName: "",
              mappingValue1: "",
              mappingValue2: "",
              mappingValue3: "",
              mappingValue4: "",
              mappingValue5: "",
              seq: null,
              insertOrDelete: "I",
            };
            data.push(obj);
          });
        } //save cloud source columns
        if (data.length !== 0) {
          let url = riteUTils.riteProps.saveallcloudtemplatecolumns;
          postDetails(url, data)
            .then((res) => {
              if (res) {
                self.messages.push({
                  severity: "confirmation",
                  summary: "Cloud Template Lines Saved/Updated Successfully",
                  autoTimeout: 0,
                });
                templinesTable();
                getSourceTempColumns();
              }
              $(".progress").hide();
            })
            .catch((err) => {
              console.log(err);
            });
        }
        $(".progress").hide();
      }
    }

    function saveTemplatedEditedItems() {
      let editItems = self.dataprovider.getSubmittableItems();
      let data = [];
      if (editItems.length !== 0) {
        $(".progress").show();
        editItems.forEach((editItem) => {
          if (editItem.item.data.mappingVal) {
            if (
              editItem.item.data.mappingType == "Constant" ||
              editItem.item.data.mappingType == "Prefix" ||
              editItem.item.data.mappingType == "Suffix"
            ) {
              var map1 = editItem.item.data.mappingVal;
            } else if (editItem.item.data.mappingType == "One to One") {
              var map1 = editItem.item.data.mappingVal[0];
            } else if (editItem.item.data.mappingType == "Two to One") {
              var map1 = editItem.item.data.mappingVal[0];
              var map2 = editItem.item.data.mappingVal[1];
            } else if (editItem.item.data.mappingType == "Three to One") {
              var map1 = editItem.item.data.mappingVal[0];
              var map2 = editItem.item.data.mappingVal[1];
              var map3 = editItem.item.data.mappingVal[2];
            } else {
              var [map1, map2, map3, map4, map5] =
                editItem.item.data.mappingVal;
            }
          }
          let srcId = "";
          let srcClu = "";
          let uniq = "";
          if (editItem.item.data.sourceColumnId == "999") {
            srcId = "";
            srcClu = "";
            uniq = "Y";
          } else {
            srcId = editItem.item.data.sourceColumnId;
            srcClu = editItem.item.data.sourceColumnName;
          }
          let obj = {
            columnId: editItem.item.data.columnId,
            columnName: editItem.item.data.columnName,
            templateId: editItem.item.data.templateId,
            description: editItem.item.data.description,
            columnType: editItem.item.data.columnType,
            width: editItem.item.data.width,
            nullAllowedFlag:
              editItem.item.data.nullAllowedFlag == "N" ? "N" : "Y",
            uniqueTransRef: uniq,
            selected: editItem.item.data.selected[0] === "checked" ? "Y" : "N",
            sourceColumnId: srcId,
            sourceColumnName: srcClu,
            mappingType: editItem.item.data.mappingType,
            mappingSetId: editItem.item.data.mappingSetId,
            mappingSetName: editItem.item.data.mappingSetName,
            mappingValue1: map1 ? map1 : "",
            mappingValue2: map2 ? map2 : "",
            mappingValue3: map3 ? map3 : "",
            mappingValue4: map4 ? map4 : "",
            mappingValue5: map5 ? map5 : "",
            seq: editItem.item.data.seq ? parseInt(editItem.item.data.seq) : "",
            insertOrDelete: "I",
          };
          data.push(obj);
        });

        if (data.length !== 0) {
          //save cloud source columns
          let url = riteUTils.riteProps.saveallcloudtemplatecolumns;
          postDetails(url, data)
            .then((res) => {
              if (res) {
                self.messages.push({
                  severity: "confirmation",
                  summary: "Cloud Tempalte Lines Saved/Updated Successfully",
                  autoTimeout: 0,
                });
                templinesTable();
                getSourceTempColumns();
              }
              $(".progress").hide();
            })
            .catch((err) => {
              console.log(err);
              $(".progress").hide();
            });
        }
      }
    }

    self.onMetadataTableChange = function (event) {
      if (event.detail.value) {
        $(".progress").show();
        let metaDataTable = "";
        self.cloudMetaDataArray().forEach((itm) => {
          if (itm.id == event.detail.value) {
            metaDataTable = itm.value;
            self.cloudmetadatatableName(itm.value);
          }
        });
        while (self.ColsObservableArray().length !== 0) {
          self.ColsObservableArray.pop();
        }
        let url =
          riteUTils.riteProps.getcloudsourcecolumns +
          "?cloudTableName=" +
          metaDataTable;
        getDetails(url)
          .then((res) => {
            if (res) {
              $(".progress").hide();
              let maptype = "";
              for (let i = 0; i < res.cloudColumns.length; i++) {
                let cloname = res.cloudColumns[i].columnName;
                if (
                  cloname == "LAST_UPDATE_DATE" ||
                  cloname == "OBJECT_VERSION_NUMBER" ||
                  cloname == "LAST_UPDATED_BY" ||
                  cloname == "CREATION_DATE" ||
                  cloname == "CREATED_BY"
                ) {
                  if (cloname == "OBJECT_VERSION_NUMBER") {
                    maptype = "Constant";
                  } else {
                    maptype = "Constant";
                  }
                } else {
                  maptype = "As-Is";
                }
                let obj = {
                  rowId: i + 1,
                  columnName: res.cloudColumns[i].columnName,
                  templateId: self.templateId(),
                  description: res.cloudColumns[i].description,
                  columnType: res.cloudColumns[i].columnType,
                  width: res.cloudColumns[i].width,
                  nullAllowedFlag:
                    res.cloudColumns[i].nullAllowedFlag == "N" ? "N" : "Y",
                  uniqueTransRef: "",
                  selected: ["checked"],
                  sourceColumnId: "",
                  sourceColumnName: "",
                  mappingType: maptype,
                  mappingSetId: "",
                  mappingSetName: "",
                  mappingValue1: "",
                  mappingValue2: "",
                  mappingValue3: "",
                  mappingValue4: "",
                  mappingValue5: "",
                  seq: "",
                  insertOrDelete: "I",
                };
                self.ColsObservableArray.push(obj);
              }
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

    self.createStagingTable = function () {
      if (
        self.metaDataTableId() &&
        self.templateId() &&
        self.metaDataTableId()
      ) {
        $(".progress").show();
        let url =
          riteUTils.riteProps.createstgtable +
          "?environment=CLOUD" +
          "&templateId=" +
          self.templateId() +
          "&templateCode=" +
          self.templateCode() +
          "&tableId=" +
          self.metaDataTableId();
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
            $(".progress").hide();
          })
          .catch((error) => {
            console.log(error);
            $(".progress").hide();
          });
      }
    };

    self.MappingTypevalueChanged = function (event) {
      if (event.detail.value && self.mappingSetArray()) {
        self.mappingSetLov([]);
        if (
          self.mappingSetArray() &&
          (event.detail.value === "One to One" ||
            event.detail.value === "Two to One" ||
            event.detail.value === "Three to One")
        ) {
          self.mappingSetArray().forEach((itm) => {
            if (itm.type == event.detail.value) {
              self.mappingSetLov.push(itm);
            }
          });
        } else if (self.formulaSetArray() && event.detail.value === "Formula") {
          self.mappingSetLov(self.formulaSetArray());
        }
      }
    };

    this.mappingSetNameLOVdata = new ArrayDataProvider(self.mappingSetLov, {
      keyAttributes: "id",
    });

    //change this when ;u required

    this.MappingNamevalueChanged = function (event) {
      if (typeof event.detail.data !== "undefined") {
        this.rowData.mappingSetId = event.detail.data.id;
      } else {
        this.rowData.mappingSetId = null;
      }
    }.bind(this);

    this.sourceColumnvaluechange = function (event) {
      if (event.detail.value) {
        self.mappingColArray().forEach((itm) => {
          if (itm.value == event.detail.value) {
            this.rowData.sourceColumnId = itm.id;
          }
        });
        // this.rowData.sourceColumnId = event.detail.data.id;
      } else {
        this.rowData.sourceColumnId = null;
      }
    }.bind(this);

    self.getSourceClumns = function (event) {
      if (event.detail.value) {
        getMappingColums();
      }
    };
    self.togglelink = function () {
      self.toggle(!self.toggle());
    };

    function getMappingColums() {
      if (self.sourceTemplateId()) {
        let url =
          riteUTils.riteProps.getsourcetemplatecolumns +
          "?templateId=" +
          self.sourceTemplateId();
        getDetails(url)
          .then((res) => {
            if (res) {
              self.mappingColArray([]);
              $(".progress").hide();
              for (let i = 0; i < res[0].length; i++) {
                self.mappingColArray.push({
                  id: res[0][i].columnId,
                  value: res[0][i].columnName,
                  label: res[0][i].columnName,
                });
              }
              let obj = {
                id: 999,
                value: "ORIG_TRANS_ID",
                label: "ORIG_TRANS_ID",
              };
              self.mappingColArray.push(obj);
            }
          })
          .catch((error) => {
            $(".progress").hide();
          });
      }
    }

    this.mappingDb = new ArrayDataProvider(self.mappingColArray, {
      keyAttributes: "value",
    });
    this.srccolsLOVdata = new ArrayDataProvider(self.mappingColArray, {
      keyAttributes: "value",
    });

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

    this.onMappingValueChange = (event) => {
      console.log(event.detail.value);
    };

    function getFormulaSets() {
      let url = riteUTils.riteProps.getAllFormulaSets;
      while (self.formulaSetArray().length > 0) {
        self.formulaSetArray.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            $(".progress").hide();
            for (let i = 0; i < res.length; i++) {
              self.formulaSetArray.push({
                id: res[i].formulaSetId,
                value: res[i].formulaSetName,
                label: res[i].formulaSetName,
              });
            }
          }
        })
        .catch((error) => {
          $(".progress").hide();
        });
    }

    function getMappingSets() {
      $(".progress").show();
      let url = riteUTils.riteProps.getAllMappingSets;
      while (self.mappingSetArray().length > 0) {
        self.mappingSetArray.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            $(".progress").hide();
            for (let i = 0; i < res.length; i++) {
              self.mappingSetArray.push({
                id: res[i].mapSetId,
                value: res[i].mapSetName,
                label: res[i].mapSetName,
                type: res[i].mapSetType,
              });
            }
          }
        })
        .catch((error) => {
          $(".progress").hide();
        });
    }

    self.openUserHooks = function () {
      document.querySelector("#userHookDailog").open();
    };

    self.closeUserHooks = function () {
      document.querySelector("#userHookDailog").close();
    };

    function getUserHooks() {
      $(".progress").show();
      let url = riteUTils.riteProps.getAllUserHooks;
      while (self.userHooksData().length > 0) {
        self.userHooksData.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            $(".progress").hide();
            for (let i = 0; i < res.length; i++) {
              self.userHooksData.push({
                attribute1: res[i].attribute1,
                attribute2: res[i].attribute2,
                attribute3: res[i].attribute3,
                attribute4: res[i].attribute4,
                attribute5: res[i].attribute5,
                hookId: res[i].hookId,
                hookName: res[i].hookName,
                hookCode: res[i].hookCode,
                description: res[i].description,
                hookType: res[i].hookType,
                hookText: res[i].hookText,
                id: res[i].hookId,
                label: res[i].hookName,
                value: res[i].hookName,
              });
            }
          }
        })
        .catch((error) => {
          $(".progress").hide();
        });
    }
    this.hookData = new ArrayDataProvider(self.userHooksData, {
      keyAttributes: "id",
    });

    function getUserHooksByTempId() {
      if (self.templateId()) {
        $(".progress").show();
        let url = riteUTils.riteProps.getTemplateHooks + self.templateId();
        getDetails(url)
          .then((res) => {
            if (res) {
              $(".progress").hide();
              for (let i = 0; i < res.length; i++) {
                self.userHooksArray.push({
                  hookUsageId: res[i].hookUsageId,
                  hookId: res[i].hookId,
                  templateId: res[i].templateId,
                  usageType: res[i].usageType,
                  attribute1: res[i].attribute1,
                  attribute2: res[i].attribute2,
                  attribute3: res[i].attribute3,
                  attribute4: res[i].attribute4,
                  attribute5: res[i].attribute5,
                });
                if (res[i].usageType == "PRE_HOOK") {
                  self.userHooksData().forEach((item) => {
                    if (item.hookId == res[i].hookId) {
                      self.preTransfomHook(res[i].hookId);
                    }
                  });
                } else if (res[i].usageType == "POST_HOOK") {
                  self.userHooksData().forEach((item) => {
                    if (item.hookId == res[i].hookId) {
                      self.PostTransformHook(res[i].hookId);
                    }
                  });
                } else if (res[i].usageType == "FBDI_GEN_HOOK") {
                  self.userHooksData().forEach((item) => {
                    if (item.hookId == res[i].hookId) {
                      self.FBDIHDLgenerationHook(res[i].hookId);
                    }
                  });
                }
              }
            }
          })
          .catch((error) => {
            $(".progress").hide();
          });
      }
    }
    self.saveUserHooks = function () {
      if (
        self.preTransfomHook() ||
        self.PostTransformHook() ||
        self.FBDIHDLgenerationHook()
      ) {
        let url = riteUTils.riteProps.saveTemplateHooks + self.templateId();
        let data = [];
        if (
          self.preTransfomHook() ||
          self.PostTransformHook() ||
          self.FBDIHDLgenerationHook()
        ) {
          self.userHooksData().forEach((itm) => {
            if (itm.hookId == self.preTransfomHook()) {
              let hUsageId;
              self.userHooksArray().forEach((itm) => {
                if (itm.hookId == self.preTransfomHook()) {
                  hUsageId = itm.hookUsageId;
                }
              });
              let obj = {
                hookUsageId: hUsageId,
                hookId: itm.hookId,
                templateId: self.templateId(),
                usageType: "PRE_HOOK",
                attribute1: itm.attribute1,
                attribute2: itm.attribute2,
                attribute3: itm.attribute3,
                attribute4: itm.attribute4,
                attribute5: itm.attribute5,
                insertOrDelete: hUsageId ? "U" : "I",
              };
              data.push(obj);
            }
            if (itm.hookId == self.PostTransformHook()) {
              let hUsageId;
              self.userHooksArray().forEach((itm) => {
                if (itm.hookId == self.PostTransformHook()) {
                  hUsageId = itm.hookUsageId;
                }
              });
              let obj = {
                hookUsageId: hUsageId,
                hookId: itm.hookId,
                templateId: self.templateId(),
                usageType: "POST_HOOK",
                attribute1: itm.attribute1,
                attribute2: itm.attribute2,
                attribute3: itm.attribute3,
                attribute4: itm.attribute4,
                attribute5: itm.attribute5,
                insertOrDelete: hUsageId ? "U" : "I",
              };
              data.push(obj);
            }
            if (itm.hookId == self.FBDIHDLgenerationHook()) {
              let hUsageId;
              self.userHooksArray().forEach((itm) => {
                if (itm.hookId == self.FBDIHDLgenerationHook()) {
                  hUsageId = itm.hookUsageId;
                }
              });
              let obj = {
                hookUsageId: hUsageId,
                hookId: itm.hookId,
                templateId: self.templateId(),
                usageType: "FBDI_GEN_HOOK",
                attribute1: itm.attribute1,
                attribute2: itm.attribute2,
                attribute3: itm.attribute3,
                attribute4: itm.attribute4,
                attribute5: itm.attribute5,
                insertOrDelete: hUsageId ? "U" : "I",
              };
              data.push(obj);
            }
          });
        }
        postDetails(url, data)
          .then((res) => {
            if (res) {
              self.messages.push({
                severity: "confirmation",
                summary: "User Hook Saved Successfully",
                autoTimeout: 0,
              });
              document.querySelector("#userHookDailog").close();
            }
            $(".progress").hide();
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        self.messages.push({
          severity: "error",
          summary: "Please Fill any one of the User Hook",
          autoTimeout: 0,
        });
      }
    };
    self.checkSpaces = function (event) {
      if (event.detail.value) {
        if (hasWhiteSpace(event.detail.value)) {
          self.messages.push({
            severity: "error",
            summary: "Template Code can't contain spaces",
            autoTimeout: 0,
          });
        }
      }
    };

    self.generateSequence = function () {
      if (self.templateId() && self.objectcode() && self.version()) {
        $(".progress").show();
        let url =
          riteUTils.riteProps.generatesequence +
          "?templateId=" +
          self.templateId() +
          "&objectId=" +
          self.objectcode() +
          "&version=" +
          self.version();
        postDetails(url)
          .then((res) => {
            if (res) {
              while (self.ColsObservableArray().length !== 0) {
                self.ColsObservableArray.pop();
              }
              for (let i = 0; i < res.length; i++) {
                self.ColsObservableArray.push({
                  rowId: i + 1,
                  columnId: res[i].columnId,
                  columnName: res[i].columnName,
                  templateId: res[i].templateId,
                  description: res[i].description,
                  columnType: res[i].columnType,
                  width: res[i].width,
                  nullAllowedFlag: res[i].nullAllowedFlag,
                  uniqueTransRef: [
                    res[i].uniqueTransRef === "Y" ||
                    res[i].uniqueTransRef === "N"
                      ? "checked"
                      : "unchecked",
                  ],
                  selected: [
                    res[i].selected === "Y" || res[i].selected === "N"
                      ? "checked"
                      : "unchecked",
                  ],
                  sourceColumnId: res[i].sourceColumnId,
                  sourceColumnName: res[i].sourceColumnName,
                  mappingType: res[i].mappingType,
                  mappingSetId: res[i].mappingSetId,
                  mappingSetName: res[i].mappingSetName,
                  seq: res[i].seq,
                });
              }
                $(".progress").hide();

              self.messages.push({
                severity: "confirmation",
                summary: "Sequence Generated Successfully",
                autoTimeout: 0,
              });
            } else {
              self.messages.push({
                severity: "error",
                summary: "Sequence Generation Failed",
                autoTimeout: 0,
              });
            }
          })
          .catch((err) => {
            self.messages.push({
              severity: "error",
              summary: "Sequence Generation Failed",
              autoTimeout: 0,
            });
          });
      }
    };

    this.connected = () => {
      accUtils.announce("Cloud Template page loaded.", "assertive");
      document.title = "Cloud Template ";
      getProjectData();
      getVersions();
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
  return Cloud_TemplateViewModel;
});
