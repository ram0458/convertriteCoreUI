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
define(['../accUtils', 'require', 'knockout', 'axios', 'ojs/ojbufferingdataprovider', "ojs/ojarraydataprovider", 'ojs/ojlistdataproviderview', "ojs/ojvalidationgroup", "ojs/ojpopup", "ojs/ojinputtext", "ojs/ojbutton", "ojs/ojtable", "ojs/ojcheckboxset", "ojs/ojinputsearch",  "ojs/ojinputtext", 'ojs/ojselectsingle', "ojs/ojformlayout", 'ojs/ojmessages', 'ojs/ojdialog', 'ojs/ojdefer'],
  function (accUtils, require, ko, axios, BufferingDataProvider, ArrayDataProvider, ListDataProviderView) {
    function Cloud_Query_ParamsWorkBenchViewModel() {
      var self = this;
      if (!sessionStorage.getItem('user_role')) {
        window.location = '?ojr=Login';
      }
      self.podId = ko.observable('');
      self.destination = ko.observable('');
      self.destTable = ko.observable('');
      self.metaData = ko.observable('');
      self.sqlQuery = ko.observable('');
      self.projectId = ko.observable('');
      self.podDtlsArray = ko.observableArray([]);
      self.projectsNameArray = ko.observableArray([]);
      self.destDataArray = ko.observableArray([]);
      self.pobjcodedisabled = ko.observable(true);
      self.metaDataTableId = ko.observable('');
      self.clouddatatabdisabled = ko.observable(true);
      self.cloudtablesuggest = ko.observableArray([]);
      self.srchfilter = ko.observable('');
      self.searchdataArray = ko.observableArray([]);
      this.searchfilter = ko.observable('');
      self.messages = ko.observableArray();
      self.templatename = ko.observable('');
      self.tablename = ko.observable('');
      self.viewname = ko.observable('');
      self.templateid = ko.observable("0");
      self.projectname = ko.observable('');
      self.parentobjectcode = ko.observable('');
      self.objectcode = ko.observable('');
      self.clouddatatable = ko.observable('');
      self.normalizeFlag = ko.observableArray([]);
      self.disableCheckBox = ko.observable(false);
      self.templatenamedisabled = ko.observable(false);
      this.groupValid = ko.observable();
      this.editRow = ko.observable();
      self.ColsObservableArray= ko.observableArray([]);

      self.scrollPos = ko.observable({ rowIndex: 0 });
      self.loadMore = function () {
        self.scrollPos({ rowIndex: self.scrollPos._latestValue.rowIndex + 5 });
      };

      self.ColsObservableArray([
        {
          "SNo":1,
          "columnName":"VENDOR",
          "select":['checked'],
          "sequence" :1
        }
      ])


      this.dataprovider = new BufferingDataProvider(new ArrayDataProvider(self.ColsObservableArray, {
        keyAttributes: "SNo",
      }));

      self.resetDataSync = function(){
        self.sqlQuery('');
        self.destination('');
        self.destTable('');
        self.metaData('');
      }

      this.dataprovider.addEventListener('submittableChange', function (event) {
        var submittable = event.detail;
        this.showSubmittableItems(submittable);
      }.bind(this))

      

      self.showViewPopup = function () {
        const popup = document.getElementById('viewPopup');
        popup.open("#go");
      }
      self.openCheckDupDailog = function () {
        document.querySelector("#dupliDailog").open();
      }
      self.closeDuDailog = function () {
        document.querySelector("#dupliDailog").close();
      }

      self.messagesDataProvider = new oj.ArrayDataProvider(self.messages)
      this.close = function (event) {
        document.getElementById('modalDialog1').close();
      };
      this.open = function (event) {
        document.getElementById('modalDialog1').open();
        getLOVData();
      };

      self.openDailog = function () {
        // self.messages.push({
        //   severity: 'confirmation',
        //   summary: 'Source Template Created Successfully',
        //   autoTimeout: 500000
        // });
      }
      self.saveMsg = function () {
        const valid = _checkValidationGroup();
        if (valid) {
          // submit the form would go here
          self.messages.push({
            severity: 'confirmation',
            summary: "Save SuccessfullySave SuccessfullySave SuccessfullySave SuccessfullySave Successfully!",
            autoTimeout: 344440
          });
        }
      }

      function _checkValidationGroup() {
        const tracker = document.getElementById('tracker');
        if (tracker.valid === 'valid') {
          return true;
        }
        else {
          // show messages on all the components that are invalidHiddden, i.e., the
          // required fields that the user has yet to fill out.
          tracker.showMessages();
          Context.getPageContext()
            .getBusyContext()
            .whenReady()
            .then(() => tracker.focusOn('@firstInvalidShown'));
          return false;
        }
      }



      this.searchanyvalueChanged = function () {
        this.searchfilter(document.getElementById('filter').rawValue);
      }.bind(this);

      this.searchdataprovider = ko.computed(function () {
        const filterRegEx = new RegExp(this.searchfilter(), 'i');
        const filterCriterion = {
          op: '$or',
          criteria: [{ op: '$regex', value: { templateName: filterRegEx } },
          { op: '$regex', value: { podName: filterRegEx } },
          { op: '$regex', value: { projectName: filterRegEx } },
          { op: '$regex', value: { parentObjectCode: filterRegEx } },
          { op: '$regex', value: { objectCode: filterRegEx } },
          { op: '$regex', value: { bu: filterRegEx } },
          { op: '$regex', value: { clouddatatable: filterRegEx } }
          ]
        };
        const arrayDataProvider = new ArrayDataProvider(self.searchdataArray, { keyAttributes: 'templateId' });
        return new ListDataProviderView(arrayDataProvider, { filterCriterion: filterCriterion });
      }, this);

      self.selectionListener = function (event) {
        var data = event.detail;
        if (event.type == 'selectionChanged') {
          var eventTxt = "Triggered selectionChanged event: \n";
          var selectionObj = data['value'];
          if (selectionObj.length > 0) {

            var range = selectionObj[0];
            var startIndex = range.startIndex;
            if (startIndex != null && startIndex.row != null) {
              var workpackid = selectionObj[0].startKey.row;
              var selrow = ko.utils.arrayFirst(self.searchdataArray(), function (item) {
                return workpackid === item.templateId;
              });

              self.templatenamedisabled(true)
              self.templatename(selrow.templateName);
              self.projectname(selrow.projectName);
              self.projectId(selrow.projectId);
              self.templateid(selrow.templateId);
              self.parentobjectcode(selrow.parentObjectCode);

              if (selrow.attribute5) {
                if (selrow.attribute5 == "Y")
                  self.normalizeFlag(['checked'])
                if (selrow.attribute5 == "N")
                  self.normalizeFlag(['unchecked'])
              }
              else {
                self.normalizeFlag(['unchecked']);
              }

              self.objectcode(selrow.objectCode);
              self.clouddatatable(selrow.metaDataTableName);

              let tabName = "";
              if (selrow.stagingTableName) {
                if (selrow.stagingTableName.includes(':')) {
                  tabName = selrow.stagingTableName.split(':')[1];
                }
                else {
                  tabName = selrow.stagingTableName;
                }
              }
              self.tablename(tabName);
              self.viewname(selrow.viewName);
              tempSelectedFlag = true;
              // templinesTable();              

              //self.disabledPopupBtn(false);
              setTimeout(() => {
                document.getElementById('sourceSaveBtn').disabled = true;
              }, 200);



              // self.workpackidvar(workpackid);
              document.querySelector('#modalDialog1').close();// closing search dialog on load

            }
          }


        }
      }

      self.showSrchDailog = function () {
        document.querySelector("#srchDailog").open();
      }

      self.closeSrchDailog = function () {
        document.querySelector("#srchDailog").close();
      }

      self.openSqlDailog = function () {
        document.querySelector("#sqlDailog").open();
      };

      self.closeSqlDailog = function () {
        document.querySelector("#sqlDailog").close();
      };


      self.podnameValueChange = function(data){

      }
      this.podNamedata = new ArrayDataProvider(self.podDtlsArray, { keyAttributes: 'id' });


      self.destnameValueChange = function(event){

      }
      this.destNamedata = new ArrayDataProvider(self.destDataArray, { keyAttributes: 'id' });


      self.projnameValueChange = function (event) {
        if (event.detail.value) {
          let url = props.getparentobjectcodebyrole + "?projectId=" + self.projectId()
          getDetails(url).then((res) => {
            if (res) {
              self.pobjcodedisabled(false);
              self.parentobjsuggest([]);
              for (let i = 0; i < res.length; i++) {
                self.parentobjsuggest.push({
                  'id': res[i].parentObjectId,
                  'value': res[i].parentObjectCode,
                  'label': res[i].parentObjectCode
                });
              }

            }
          }).catch((error) => {
            console.log(error);
          })
        }

      }

      this.projNamedata = new ArrayDataProvider(self.projectsNameArray, { keyAttributes: 'projectName' });

self.sqlQueryChange = function(event){

}


   

      this.clouddatatablenamedata = new ArrayDataProvider(self.cloudtablesuggest, { keyAttributes: 'value' });




      function getLOVData() {
        let url = props.getsourcetemplates;
        getDetails(url).then((res) => {
          $(".progress").show();
          if (res) {
            if (res.hasOwnProperty('errorMessage')) {
              self.messages.push({
                severity: 'error',
                summary: res.errorMessage,
                autoTimeout: 0
              });
            }
            else {
              while (self.searchdataArray().length > 0) {
                self.searchdataArray.pop();
              }
              $(".progress").hide();
              for (let i = 0; i < res.length; i++) {
                self.searchdataArray.push({
                  "rowid": i + 1,
                  "attribute1": res[i].attribute1,
                  "attribute2": res[i].attribute2,
                  "attribute3": res[i].attribute3,
                  "attribute4": res[i].attribute4,
                  "attribute5": res[i].attribute5,
                  "metaDataTableId": res[i].metaDataTableId,
                  "metaDataTableName": res[i].metaDataTableName,
                  "normalizeDataFlag": res[i].normalizeDataFlag,
                  "objectCode": res[i].objectCode,
                  "objectId": res[i].objectId,
                  "parentObjectCode": res[i].parentObjectCode,
                  "parentObjectId": res[i].parentObjectId,
                  "projectId": res[i].projectId,
                  "projectName": res[i].projectName,
                  "roleId": res[i].roleId,
                  "stagingTableName": res[i].stagingTableName,
                  "templateCode": res[i].templateCode,
                  "templateId": res[i].templateId,
                  "templateName": res[i].templateName,
                  "viewName": res[i].viewName
                });
              }
            }
          }

        }).catch((error) => {
          $(".progress").hide();
        })
      }



      this.beforeRowEditListener = function (event) {
        var rowContext = event.detail.rowContext;
        var dataObj = rowContext.componentElement.getDataForVisibleRow(rowContext.status.rowIndex);
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
              this.dataprovider.updateItem({ metadata: { key: key }, data: this.rowData });
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
        var editables = table.querySelectorAll('.editable');
        for (i = 0; i < editables.length; i++) {
          var editable = editables.item(i);
          editable.validate();
          if (editable.valid !== 'valid') {
            return true;
          }
        }
        return false;
      };
      this.showSubmittableItems = function (submittable) {
        var textarea = document.getElementById('bufferContent');
        var textValue = "";
        submittable.forEach(function (editItem) {
          textValue += editItem.operation + " ";
          textValue += editItem.item.metadata.key + ": ";
          textValue += JSON.stringify(editItem.item.data);
          if (editItem.item.metadata.message) {
            textValue += " error: " + JSON.stringify(editItem.item.metadata.message);
          }
          textValue += "\n";
        });
      }

      function getSourceDetails(serName) {
        return new Promise((reslove, reject) => {
          axios.get(serName, riteUTils.riteHeader)
            .then(response => {
              reslove(response.data);
            }).catch((error) => {
              reject(error);
            });
        });
      }

      this.connected = () => {
        accUtils.announce('Data Sync Params', 'assertive');
        document.title = "Data Sync Params";

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
    return Cloud_Query_ParamsWorkBenchViewModel;
  }
);
