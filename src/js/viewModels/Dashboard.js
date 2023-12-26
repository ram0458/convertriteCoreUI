/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['../accUtils','knockout', "ojs/ojarraydataprovider",'appController',"ojs/ojchart",],
 function(accUtils,ko,ArrayDataProvider,app) {
    function DashboardViewModel() {
      var self = this;
      if (!sessionStorage.getItem("userId")) {
        window.location = "?ojr=Login";
      }
      self.loginAccName = ko.observable("");
      self.isView = ko.observable(false);
      self.podName = ko.observable("");
      self.projects = ko.observable("");
      self.sourceTemp = ko.observable("");
      self.cloudTemp = ko.observable("");
      self.objects = ko.observable("");
      self.parentObjects = ko.observable("");
      self.podName(sessionStorage.getItem("podName"));
      self.chartData = ko.observableArray([]);
      self.openPodDtls = function (event) {
        app.goToPage("POD_Details");
        location.reload();
      };

      self.openProjects = function (event) {
        app.goToPage("Manage_Your_Project");
        location.reload();
      };

      self.openObjects = function (event) {
        app.goToPage("Object_Details");
        location.reload();
      };


      self.openCloudTemp = function (event) {
        app.goToPage("Cloud_Template");
        location.reload();
      };

      self.openSourceTemp = function (event) {
        app.goToPage("Source_Template");
        location.reload();
      };

      function getAllTilesCount(){
        getProjectsLOVData();
        getObjectSetupDtls();
        getSrcTempLOVData();
        getCldTempLOVData();
      }

      function getProjectsLOVData() {
        let url = riteUTils.riteProps.getAllProjectHeaders;
        getDetails(url)
          .then((res) => {
            if (res) {
              self.projects(res.length);
            }
          })
        }

      function  getSrcTempLOVData() {
        let url = riteUTils.riteProps.getsourcetemplates;
        getDetails(url)
          .then((res) => {
            if (res) {
              self.sourceTemp(res.length);

            }
          })
        }


        function getCldTempLOVData() {
          let url = riteUTils.riteProps.getallcloudtemplates;
          getDetails(url)
            .then((res) => {
              if (res) {
                self.cloudTemp(res.length);

              }
            })
          };

          function getObjectSetupDtls() {
            let url = riteUTils.riteProps.getObjectsByUserId+"/"+sessionStorage.getItem('userVal');
            getDetails(url).then((res) => {
              if (res.statusCode=="OK") {

              self.objects(res.payload.length);
              self.parentObjects(res.payload.length);
              }
            })
          }
          getChartStatic();
          function getChartStatic() {
            let url = riteUTils.riteProps.gettemplatestatistics;
          
            getDetails(url).then((res) => {
            if(res){
              for(let i=0;i<res.length;i++){
               let obj= {
                  id: i,
                  series: "Success",
                  group: res[i].criteriaName,
                  value: res[i].success,
                }
                let obj1= {
                  id: i+1,
                  series: "Failed",
                  group: res[i].criteriaName,
                  value: res[i].failed,
                }
                let obj2= {
                  id: i+2,
                  series: "Unverified",
                  group: res[i].criteriaName,
                  value: res[i].unverified,
                }
                self.chartData.push(obj);   
                self.chartData.push(obj1); 
                self.chartData.push(obj2);              
              }
            }
            });
          }
  

      // this.chartData = [
      //   {
      //     id: 0,
      //     series: "Series 1",
      //     group: "Group A",
      //     value: 42,
      //   },
      //   {
      //     id: 1,
      //     series: "Series 1",
      //     group: "Group B",
      //     value: 34,
      //   },
      //   {
      //     id: 2,
      //     series: "Series 2",
      //     group: "Group A",
      //     value: 55,
      //   },
      //   {
      //     id: 3,
      //     series: "Series 2",
      //     group: "Group B",
      //     value: 30,
      //   },
      //   {
      //     id: 4,
      //     series: "Series 3",
      //     group: "Group A",
      //     value: 36,
      //   },
      //   {
      //     id: 5,
      //     series: "Series 3",
      //     group: "Group B",
      //     value: 50,
      //   },
      //   {
      //     id: 6,
      //     series: "Series 4",
      //     group: "Group A",
      //     value: 22,
      //   },
      //   {
      //     id: 7,
      //     series: "Series 4",
      //     group: "Group B",
      //     value: 46,
      //   },
      //   {
      //     id: 8,
      //     series: "Series 5",
      //     group: "Group A",
      //     value: 22,
      //   },
      //   {
      //     id: 9,
      //     series: "Series 5",
      //     group: "Group B",
      //     value: 46,
      //   },
      // ];
      this.dataProvider = new ArrayDataProvider(self.chartData, {
        keyAttributes: 'id'
    });

    this.bubleChart= [
      {
        "id": 0,
        "series": "Series 1",
        "group": "Group A",
        "x": 15,
        "y": 25,
        "z": 5
      },
      {
        "id": 1,
        "series": "Series 1",
        "group": "Group B",
        "x": 25,
        "y": 30,
        "z": 12
      },
      {
        "id": 2,
        "series": "Series 1",
        "group": "Group C",
        "x": 25,
        "y": 45,
        "z": 12
      },
      {
        "id": 3,
        "series": "Series 2",
        "group": "Group A",
        "x": 15,
        "y": 15,
        "z": 8
      },
      {
        "id": 4,
        "series": "Series 2",
        "group": "Group B",
        "x": 20,
        "y": 35,
        "z": 14
      },
      {
        "id": 5,
        "series": "Series 2",
        "group": "Group C",
        "x": 40,
        "y": 55,
        "z": 35
      },
      {
        "id": 6,
        "series": "Series 3",
        "group": "Group A",
        "x": 10,
        "y": 10,
        "z": 8
      },
      {
        "id": 7,
        "series": "Series 3",
        "group": "Group B",
        "x": 18,
        "y": 55,
        "z": 10
      },
      {
        "id": 8,
        "series": "Series 3",
        "group": "Group C",
        "x": 40,
        "y": 50,
        "z": 18
      },
      {
        "id": 9,
        "series": "Series 4",
        "group": "Group A",
        "x": 8,
        "y": 20,
        "z": 6
      },
      {
        "id": 10,
        "series": "Series 4",
        "group": "Group B",
        "x": 11,
        "y": 30,
        "z": 8
      },
      {
        "id": 11,
        "series": "Series 4",
        "group": "Group C",
        "x": 30,
        "y": 40,
        "z": 15
      }
    ]

    this.bubledataProvider = new ArrayDataProvider(this.bubleChart, {
      keyAttributes: "id",
    });
      this.connected = () => {
        accUtils.announce('Dashboard page loaded.', 'assertive');
        document.title = "Dashboard";    
        getAllTilesCount();
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
    return DashboardViewModel;
  }
);
