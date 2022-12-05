module.exports = function (RED) {

    function cmd(config) {
        var node;
        var send_count = 0;
        var send_count_stat = [];
        var connstate = "unknown";

        RED.nodes.createNode(this, config);

        let picnic = RED.nodes.getNode(config.picnicinstance);

        node = this;

        function updateStatus() {
            if (connstate == "connected") {
                node.status({ fill: "green", shape: "dot", text: "connected"});
            } else if (connstate == "disconnected") {
                node.status({ fill: "red", shape: "dot", text: "disconnected\n" + parseInt((sum / send_count_stat.length) * 6) + "/Min" });
            }
        }
        node.on('input', function (msg) {
            //this.log(msg.cmd);
            if ( !msg.topic ) {
                node.status({ fill: "red", shape: "ring", text: "topic property empty" });
            }
            msg.source = node.id;
            msg.request = msg.topic;

            //picnic.eventEmitter.emit("request_send", {"source": node.id, "request": msg.topic, "payload": msg.payload});
            picnic.eventEmitter.emit("request_send", msg);
        });
        picnic.eventEmitter.on("response", (response) => {
            //console.log(response);
            if ( response.source==node.id ) {
                delete response.source;
                this.send([response]);
            }
        });
        picnic.eventEmitter.on("cmd_connected", () => {
            connstate = "connected";
            this.status({ fill: "green", shape: "dot", text: "connected" });
        });
        picnic.eventEmitter.on("cmd_disconnected", () => {
            connstate = "disconnected";
            this.status({ fill: "red", shape: "dot", text: "disconnected" });
        });
        picnic.eventEmitter.on("cmd_data_received", (data) => {
            this.log( data );
            //this.status({ fill: "green", shape: "dot", text: "connected" });
            var msg = { payload: data }
            send_count++;
            this.send(msg);
        });

        setInterval(updateStatus, 10000);
    }
            
    RED.nodes.registerType("picnic-action", cmd);


}