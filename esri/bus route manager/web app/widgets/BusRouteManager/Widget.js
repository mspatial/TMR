define(['dojo/_base/declare',
    'jimu/BaseWidget',
    'esri/layers/FeatureLayer',
    'esri/tasks/query',
    'esri/tasks/QueryTask',
    'esri/geometry/Point',
    'esri/renderers/SimpleRenderer',
    'esri/tasks/PrintTask',
    'esri/tasks/PrintParameters',
    "esri/tasks/PrintTemplate",
    "esri/request",
    'dojo/Deferred',
    './utils'],
    function (declare, BaseWidget, FeatureLayer, Query, QueryTask, Point, SimpleRenderer, PrintTask, PrintParameters, PrintTemplate, esriRequest, Deferred, utils) {
        //To create a widget, you need to derive from BaseWidget.

        return declare([BaseWidget], {
            // Custom widget code goes here 
            baseClass: 'jimu-widget-bus-route-manager',
            layoutTemplateDefs: '',
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
                this._addBusScheduledServicesLayers()
                this._getLayerTemplatesInfo().then(function (result) {
                    console.log(result)
                    this.layoutTemplateDefs = result.results[0].value;

                    this.printButton.disabled = true
                    this.layoutTemplateSelect.disabled = true

                    this.layoutTemplateSelect.options.length = 0;
                    var defaultOption = document.createElement('option');
                    defaultOption.value = "";
                    defaultOption.text = "Select Layout Template..."
                    defaultOption.selected = true;
                    defaultOption.disabled = true;
                    this.layoutTemplateSelect.appendChild(defaultOption);
                    for (template of this.layoutTemplateDefs) {
                        console.log(template.layoutTemplate)
                        var option = document.createElement('option');
                        option.value = template.layoutTemplate;
                        option.text = template.layoutTemplate;
                        this.layoutTemplateSelect.appendChild(option);
                    }
                })
            },
            onClose: function () {
                console.log("onClose")
            },
            _addBusScheduledServicesLayers: function () {
                var blueLinestyle = {
                    type: "simple",
                    symbol: {
                        "color": [
                            0,
                            92,
                            230,
                            255
                        ],
                        width: 2.25,
                        type: "esriSLS",
                        style: "esriSLSSolid"
                    }
                }
                var blueLineRender = new SimpleRenderer(blueLinestyle)

                var busServicesFL = new FeatureLayer(
                    this.config.busScheduledServices.url,
                    {
                        id: this.config.busScheduledServices.id,
                        outFields: ["*"],
                        visible: false,
                        title: "Bus Routes"
                    }
                )
                busServicesFL.setRenderer(blueLineRender)
                this.map.addLayer(busServicesFL)

                var pinkLineStyle = {
                    type: "simple",
                    symbol: {
                        color: [
                            247,
                            137,
                            216,
                            255
                        ],
                        width: 3.25,
                        type: "esriSLS",
                        style: "esriSLSShortDot"
                    }
                }
                var pinkLineRender = new SimpleRenderer(pinkLineStyle)
                var busServicesStartFL = new FeatureLayer(
                    this.config.busScheduledServices.url,
                    {
                        id: this.config.busScheduledServices.sid,
                        outFields: ["*"],
                        visible: false,
                        title: "Start Routes"
                    }
                )
                busServicesStartFL.setRenderer(pinkLineRender)
                this.map.addLayer(busServicesStartFL)

            },
            _onSearchService: function (e) {
                this.layoutTemplateSelect.disabled = true
                this.printButton.disabled = true
                console.log(e.target.value.length)
                var val = this.searchInput.value;
                var opts = this.searchInput.list.childNodes;
                for (var i = 0; i < opts.length; i++) {
                    if (opts[i].value === val) {
                        this._onServiceSelected()
                        return;
                    }
                }
                this.searchInput.list.innerHTML = ''
                if (e.target.value.length > 2) {
                    console.log(e)
                    e.target.value = e.target.value.toUpperCase()
                    var query = new Query();
                    var queryTask = new QueryTask(this.config.busScheduledServices.url);
                    query.returnGeometry = false;
                    query.outFields = ["service_uid", "service_no", "schedule_uid", "schedule_name"];
                    query.where = "service_no like '" + e.target.value + "%'";
                    query.orderByFields = ["service_no", "schedule_name"];
                    queryTask.execute(query, function (result) {
                        console.log(result)
                        var services = [];
                        for (service of result.features) {
                            if (service.attributes.service_no) {
                                //console.log(operator.attributes.operator_name);
                                if (!services.includes(service.attributes.service_no + ' ' + service.attributes.schedule_name)) {
                                    services.push(service.attributes.service_no + ' ' + service.attributes.schedule_name);
                                    var option = document.createElement('option');
                                    option.value = service.attributes.service_no + ' ' + service.attributes.schedule_name;
                                    //option.text = utils.toTitleCase(operator.attributes.operator_name);
                                    this.servicesList.appendChild(option);
                                }
                            }
                        }
                    })
                }
            },
            _onServiceSelected: async function () {

                var searchValues = this.searchInput.value.split(' ')
                console.log('select service ' + searchValues)
                var busStartRoutesFL = this.map.getLayer(this.config.busScheduledServices.sid)
                busStartRoutesFL.setDefinitionExpression("(service_no='" + searchValues[0] + "') AND (schedule_name='" + searchValues[1] + "') AND (segment_label_from = 'St' OR segment_label_to = 'St')")
                busStartRoutesFL.setVisibility(true)
                var busRoutesFL = this.map.getLayer(this.config.busScheduledServices.id)
                busRoutesFL.setDefinitionExpression("service_no='" + searchValues[0] + "' AND schedule_name='" + searchValues[1] + "'")
                busRoutesFL.setVisibility(true)

                var query = new Query();
                query.where = "service_no ='" + searchValues[0] + "' AND schedule_name='" + searchValues[1] + "'";
                var ext = await busRoutesFL.queryExtent(query).then(function (result) {
                    return result;
                })
                centrePoint = ext.extent.getCenter();
                console.log(centrePoint)
                console.log(this.map.spatialReference);
                this.map.centerAndZoom(centrePoint, 12);
                this.layoutTemplateSelect.disabled = false
                this.printButton.disabled = false
            },
            _getLayerTemplatesInfo: function () {
                var def = new Deferred();
                var url = this.config.printSettings.printServiceUrl + '/' + this.config.printSettings.getLayoutTemplatesInfoTask + "/execute";
                esriRequest({
                    url: url,
                    content: {
                        Layout_Templates_Folder: this.config.printSettings.printTemplatesFolder,
                        f: "pjson",
                    },
                    callbackParamName: "callback",
                    handleAs: "json",
                    timeout: 60000
                }).then(function (info) {
                    def.resolve(info);
                }).catch(function (err) {
                    def.resolve({
                        error: err
                    });
                });
                return def;
            },
            _print: async function () {
                this.printWait.style.display = 'block';
                console.log(layoutTemplateDefs)
                //var printServiceUrl = this.config.printSettings.printServiceUrl + '/' + this.config.printSettings.exportWebMapTask + "/execute";
                var printServiceUrl = this.config.printSettings.printServiceUrl + '/' + this.config.printSettings.exportWebMapTask
                console.log(printServiceUrl)
                var customElements = await this._setCustomElements();
                console.log(customElements)
                var printTask = new PrintTask(printServiceUrl, { async: true })
                var printParams = new PrintParameters();
                printParams.map = this.map;
                var template = new PrintTemplate();
                template.outScale = this.map.getScale();
                template.format = "PDF"
                template.preserveScale = true
                template.layout = this.layoutTemplateSelect.value
                template.layoutOptions = {
                    authorText: "TransLink",
                    copyrightText: "",
                    legendLayers: null,
                    titleText: this.searchInput.value,
                    customTextElements: customElements,
                    scalebarUnit: "Kilometers"
                };

                printParams.template = template;
                printParams.extraParameters = { // come from source code of jsapi
                    Layout_Templates_Folder: "C:/arcgisprinttemplates"
                };
                console.log(template)
                console.log('start printing....')
                printTask.execute(printParams)
                    .then(function (result) {
                        window.open(result.url);
                        this.printWait.style.display = 'none';
                    }).catch(function (err) {
                        console.log(err);
                        this.printWait.style.display = 'none';
                    })

            },
            _setCustomElements: function () {
                var def = new Deferred();
                var elements = []
                elements.push({ disclaimer: this.config.printSettings.customElements.disclaimer })

                var searchValues = this.searchInput.value.split(' ')
                var query = new Query();
                query.outFields = ['*']
                query.where = "service_no ='" + searchValues[0] + "' AND schedule_name='" + searchValues[1] + "'";
                var queryTask = new QueryTask(this.config.busScheduledServices.url);
                queryTask.execute(query).then(function (result) {
                    console.log(result)
                    if (result.features.length > 0) {
                        var val = result.features[0].attributes
                        elements.push({ map_title: this.searchInput.value })
                        elements.push({ service_number: val.service_no })
                        elements.push({ operator_name: val.public_name })
                        elements.push({ service_description: val.service_description })
                        elements.push({ terminus: val.terminus })
                        elements.push({ base_school: val.base_school })
                        elements.push({ other_schools: val.other_school })
                        elements.push({ effective_date: utils.formatDate(val.effective_date) })
                        elements.push({ measure_date: utils.formatDate(val.measure_date) })
                        elements.push({ measure_officer: val.measure_officer })
                        elements.push({ pml_notes: val.pml_notes })
                        elements.push({ schedule: val.schedule_name })
                        elements.push({ number_of_trips: "1" })
                        elements.push({ service_type: val.service_type })
                        elements.push({ schedule_comments: val.schedule_description })
                        elements.push({ express_running_description: val.express_running_description })
                        var tripDistanceLoaded = 0
                        var tripDistanceUnloaded = 0
                        var tripDistanceAdditional = 0
                        for (feature of result.features) {
                            if(feature.attributes.carriage_type ==='Loaded Stopping'){
                                tripDistanceLoaded = tripDistanceLoaded + feature.attributes.distance_km
                            }
                            if(feature.attributes.carriage_type ==='Unloaded'){
                                tripDistanceUnloaded = tripDistanceUnloaded + feature.attributes.distance_km
                            }
                        }
                        elements.push({ trip_distance_loaded: tripDistanceLoaded.toFixed(2) + 'km' })
                        elements.push({ trip_distance_unloaded: tripDistanceUnloaded.toFixed(2) + 'km' })
                        elements.push({ trip_distance_additional: tripDistanceAdditional.toFixed(2) + 'km' })
                        elements.push({ trip_distance_total: (tripDistanceLoaded + tripDistanceUnloaded + tripDistanceAdditional).toFixed(2) + 'km' })
                        elements.push({ daily_distance: (tripDistanceLoaded + tripDistanceUnloaded + tripDistanceAdditional ).toFixed(2) + 'km' })

                    }
                    def.resolve(elements);
                }).catch(function (err) {
                    console.log(err)
                    def.resolve({
                        error: err
                    });
                })
                return def
            }

        });
    });