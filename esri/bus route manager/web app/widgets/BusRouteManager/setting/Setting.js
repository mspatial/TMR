define([
    'dojo/_base/declare',
    'dojo/_base/html',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidgetSetting'
], function(declare, html, _WidgetsInTemplateMixin, BaseWidgetSetting){
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin],{
        baseClass: 'jimu-widget-bus-route-manager-setting',
        postCreate: function() {
            this.inherited(arguments);
        },
        startup: function() {
            this.inherited(arguments);
            console.log('Bus oute Manager Settings started');
        }

    })
})