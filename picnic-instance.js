var events = require('events');
//var net = require('net');
//const RECONNECT_MS = 5000;
const MAX_LISTENERS = 64;
const PicnicClient = require("picnic-api");



module.exports = function (RED) {

    function PicNicInstance(config) {
        var apiVersion = 17;
        if ( config.countrycode.toLowerCase()=="de" ) {
            apiVersion = 15;
        }
        const picnicClient = new PicnicClient({
            countryCode: config.countrycode,
            apiVersion: apiVersion
        });
        RED.nodes.createNode(this, config);

        this.eventEmitter = new events.EventEmitter();
        /*
            Default Limit is 10 listeners to avoid memory leaks
            We need it higher because of the shared connection
            to the fhem instance(s) for all nodes
        */
        this.eventEmitter.setMaxListeners(MAX_LISTENERS);

        var t = this;

        picnicClient.login(config.email, config.password).then(_ => {
            // send an authenticated request...
            //console.log(picnicClient.apiVersion);
            //console.log(picnicClient.authkey);
            t.eventEmitter.emit("connected");
            /*
            picnicClient.getUserDetails().then(userInfo => {
                console.log(userInfo);    
            });
            */
        });
        this.eventEmitter.on("request_send", (data) => {
            //console.log(data);
                //API 17 required
                const picnicClient17 = new PicnicClient({
                    countryCode: config.countrycode,
                    apiVersion: 17
                });
                switch(data.request) {
                    case "getUserDetails":
                        picnicClient.getUserDetails().then(userInfo => {
                            data.payload = userInfo;
                            t.eventEmitter.emit("response",data);
                        }).catch((error) => {
                            error.source = data.source;
                            t.eventEmitter.emit("error",error);
                        });
                        break;
                    case "getDeliverySlots":
                        picnicClient.getDeliverySlots().then(userInfo => {
                            data.payload = userInfo;
                            t.eventEmitter.emit("response",data);
                        }).catch((error) => {
                            error.source = data.source;
                            t.eventEmitter.emit("error",error);
                        });
                        break;
                    case "getDeliveries":
                        picnicClient17.login(config.email, config.password).then(_ => {
                            // send an authenticated request...
                            if ( data.payload == null || data.payload == "" )  data.payload = [];
                            picnicClient17.getDeliveries(data.payload).then(deliveries => {
                                data.payload = deliveries;
                                t.eventEmitter.emit("response",data);
                            }).catch((error) => {
                                error.source = data.source;
                                t.eventEmitter.emit("error",error);
                            });
                            
                        });
                        break;
                    case "getDelivery":
                        picnicClient17.login(config.email, config.password).then(_ => {
                            // send an authenticated request...
                            if ( data.payload == null || data.payload == "" )  data.payload = [];
                            picnicClient17.getDelivery(data.payload).then(userInfo => {
                                data.payload = userInfo;
                                t.eventEmitter.emit("response",data);
                            }).catch((error) => {
                                error.source = data.source;
                                t.eventEmitter.emit("error",error);
                            });
                            
                        });
                        break;
                    case "search":
                        picnicClient.search(data.payload).then(userInfo => {
                            data.payload = userInfo;
                            t.eventEmitter.emit("response",data);
                        }).catch((error) => {
                            error.source = data.source;
                            t.eventEmitter.emit("error",error);
                        });
                        break;
                    case "getProduct":
                        picnicClient.getProduct(data.payload).then(userInfo => {
                            data.payload = userInfo;
                            t.eventEmitter.emit("response",data);
                        }).catch((error) => {
                            error.source = data.source;
                            t.eventEmitter.emit("error",error);
                        });
                        break;
                    case "getDeliveryPosition":
                        picnicClient.getDeliveryPosition(data.payload).then(userInfo => {
                            data.payload = userInfo;
                            t.eventEmitter.emit("response",data);
                        }).catch((error) => {
                            console.log(error.message);
                            error.source = data.source;
                            t.eventEmitter.emit("error",error);
                        });
                        break;
                    case "getDeliveryScenario":
                        picnicClient.getDeliveryScenario(data.payload).then(userInfo => {
                            data.payload = userInfo;
                            t.eventEmitter.emit("response",data);
                        }).catch((error) => {
                            error.source = data.source;
                            t.eventEmitter.emit("error",error);
                        });
                        break;
                    case "getDeliverySlots":
                        picnicClient.getDeliverySlots().then(userInfo => {
                            data.payload = userInfo;
                            t.eventEmitter.emit("response",data);
                        }).catch((error) => {
                            error.source = data.source;
                            t.eventEmitter.emit("error",error);
                        });
                        break;
                    case "getMgmDetails":
                        picnicClient.getMgmDetails().then(userInfo => {
                            data.payload = userInfo;
                            t.eventEmitter.emit("response",data);
                        }).catch((error) => {
                            error.source = data.source;
                            t.eventEmitter.emit("error",error);
                        });
                        break;
                    case "getReminders":
                        picnicClient.getReminders().then(userInfo => {
                            data.payload = userInfo;
                            t.eventEmitter.emit("response",data);
                        }).catch((error) => {
                            error.source = data.source;
                            t.eventEmitter.emit("error",error);
                        });
                        break;
                    case "getMessages":
                        picnicClient.getMessages().then(userInfo => {
                            data.payload = userInfo;
                            t.eventEmitter.emit("response",data);
                        }).catch((error) => {
                            error.source = data.source;
                            t.eventEmitter.emit("error",error);
                        });
                        break;
                    default:
                        t.eventEmitter.emit("error");
                }
        });
    }
    RED.nodes.registerType('picnic-instance', PicNicInstance);

}