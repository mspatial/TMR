define(['dojo/_base/declare', 'jimu/BaseWidget', 'esri/layers/FeatureLayer', "esri/tasks/query", "esri/tasks/QueryTask","./utils"],
    function (declare, BaseWidget, FeatureLayer, Query, QueryTask, utils) {
        //To create a widget, you need to derive from BaseWidget.
        return declare([BaseWidget], {
            // Custom widget code goes here 
            baseClass: 'jimu-widget-bus-route-manager',
            postCreate: function () {
                this.inherited(arguments);
                console.log("postCreate")
            },
            startup: function () {
                this.inherited(arguments);
                console.log("startup");
            },
            onOpen: function () {
                console.log("Open Bus Route Manager Widget");
                this._setOperatorsSelect()

            },
            onClose: function () {
                console.log("onClose")
            },

            _setOperatorsSelect: function () {
                console.log('Querying Operators');
                var defaultOption = document.createElement('option');
                defaultOption.value="";
                defaultOption.text="Please select..."
                defaultOption.selected = true;
                defaultOption.disabled=true;
                this.operatorSelect.appendChild(defaultOption);

                var query = new Query();
                var queryTask = new QueryTask(this.config.busOperatorServices.url);
                query.returnGeometry = false;
                query.outFields = ["operator_id", "operator_name"];
                query.where = "objectid>0";
                query.orderByFields = ["operator_name"];
                queryTask.execute(query, function (result) {
                    console.log(result)
                    var operators = [];
                    for (operator of result.features) {
                        if (operator.attributes.operator_name) {
                            //console.log(operator.attributes.operator_name);
                            if (!operators.includes(operator.attributes.operator_id)) {
                                operators.push(operator.attributes.operator_id);
                                var option = document.createElement('option');
                                option.value = operator.attributes.operator_id;
                                option.text = utils.toTitleCase(operator.attributes.operator_name);
                                this.operatorSelect.appendChild(option);
                            }
                        }
                    }
                })
                this.serviceNumberSelect.disabled=true;
                this.scheduleNameSelect.disabled=true;
            },
            _operatorSelectChanged: function (e) {
                console.log("Querying operator_id:" + e.target.selectedOptions[0].value + " services");
                if(e.target.selectedOptions[0].value!==""){
                    this.operatorSelect.style.color = "#000";
                    this.serviceNumberSelect.disabled=false;
                    this.serviceNumberSelect.options.length = 0;
                    this.scheduleNameSelect.options.length = 0;                        
    
                    var defaultOption = document.createElement('option');
                    defaultOption.value="";
                    defaultOption.text="Please select..."
                    defaultOption.selected = true;
                    defaultOption.disabled=true;
                    this.serviceNumberSelect.appendChild(defaultOption);
    
                    var query = new Query();
                    var queryTask = new QueryTask(this.config.busOperatorServices.url);
                    query.returnGeometry = false;
                    query.outFields = ["service_uid", "service_no"];
                    query.where = "operator_id='"+e.target.selectedOptions[0].value+"'";
                    query.orderByFields = ["service_no"];
                    queryTask.execute(query, function (result) {
                        //console.log(result)
                        var services = [];
                        for (service of result.features) {
                            if (service.attributes.service_no) {
                                console.log(service.attributes.service_no);
                                if (!services.includes(service.attributes.service_uid)) {
                                    services.push(service.attributes.service_uid);
                                    var option = document.createElement('option');
                                    option.value = service.attributes.service_uid;
                                    option.text = service.attributes.service_no;
                                    this.serviceNumberSelect.appendChild(option);
                                }
                            }
                        }
                    })
                } else {
                    this.serviceNumberSelect.disabled=true;
                    this.serviceNumberSelect.options.length = 0;
                }
                this.scheduleNameSelect.disabled=true;
            },
            _serviceNumberSelectChanged: function(e){
                console.log(e.target.selectedOptions[0].value);
                if(e.target.selectedOptions[0].value!==""){
                    this.scheduleNameSelect.disabled=false;
                    this.scheduleNameSelect.options.length = 0;
                    this.serviceNumberSelect.style.color = "#000";
    
                    var defaultOption = document.createElement('option');
                    defaultOption.value="";
                    defaultOption.text="Please select..."
                    defaultOption.selected = true;
                    defaultOption.disabled=true;
                    this.scheduleNameSelect.appendChild(defaultOption);
    
                    var query = new Query();
                    var queryTask = new QueryTask(this.config.busScheduledServices.url);
                    query.returnGeometry = false;
                    query.outFields = ["schedule_uid", "schedule_name"];
                    query.where = "service_uid='"+e.target.selectedOptions[0].value+"'";
                    query.orderByFields = ["schedule_name"];
                    queryTask.execute(query, function (result) {
                        //console.log(result)
                        var schedules = [];
                        for (schedule of result.features) {
                            if (schedule.attributes.schedule_name) {
                                console.log(schedule.attributes.schedule_name);
                                if (!schedules.includes(schedule.attributes.schedule_uid)) {
                                    schedules.push(schedule.attributes.schedule_uid);
                                    var option = document.createElement('option');
                                    option.value = schedule.attributes.schedule_uid;
                                    option.text = schedule.attributes.schedule_name;
                                    this.scheduleNameSelect.appendChild(option);
                                }
                            }
                        }
                    })
                } else {
                    this.scheduleNameSelect.disabled=true;
                    this.scheduleNameSelect.options.length = 0;
                }

            },
            _scheduleNameSelectChanged: function(e){
                console.log(e.target.selectedOptions[0].value);
                this.scheduleNameSelect.style.color = "#000";

            }
                        /*,
            _getOperatorsOld: function () {
                console.log('gettopetaors')
                console.log(this.config.busOperatorsServicesUrl)
                console.log(this.map.id)
                operatorsFS = new FeatureLayer(
                    this.config.busOperatorServices.url,
                    {   
                        id: this.config.busOperatorServices.alias,
                        outFields: ["*"]
                    }
                )
                this.map.addLayer(operatorsFS);
            }*/

        });
    });