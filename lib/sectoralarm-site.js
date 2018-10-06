const sectoralarm = require('sectoralarm');

module.exports = function(RED) {

    const _PARTIALARM = "PARTIALARM",
          _ARM = "ARM",
          _DISARM = "DISARM",
          _CHECK = "CHECK",
          _STATUS = "STATUS",
          _HISTORY = "HISTORY",
          _ANNEXARM = "ANNEXARM",
          _ANNEXDISARM = "ANNEXDISARM",
          _ERR_INVALID_SESSION = "ERR_INVALID_SESSION",
          _ERR_INVALID_CODE = "ERR_INVALID_CODE",
          _ERR_INVALID_CONFIGURATION = "ERR_INVALID_CONFIGURATION",
          _ERR_INVALID_INPUT= "ERR_INVALID_INPUT";

    function SiteNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this._currentStatus = 'unknown';

        if (!validateConfig(node, this.credentials, config))
            return;
        
        node.log('Configuration is valid, trying to connect');

        connect(node, this.credentials, config)
            .then((site) => {
                node.status({fill:"green", shape:"ring", text:"Connected"});
                node.log('Connected successfully');
                this._site = site;
            })
            .catch(error => {
                node.status({fill:"red", shape:"ring", text:error.code});
                node.error(error);
                return;
            });


        node.on('input', function(msg) {

            node.log("Received '" + msg.payload + "' command");

            switch(msg.payload) {
                case 'check':
                    check(node);
                    break;
                case 'status':
                    status(node);
                    break;
                case 'history':
                    history(node, config);
                    break;
                case 'arm':
                    arm(node, this.credentials);
                    break;
                case 'partialArm':
                    partialArm(node, this.credentials);
                    break;
                case 'disarm':
                    disarm(node, this.credentials);
                    break;
                case 'annexArm':
                    annexArm(node, this.credentials);
                    break;
                case 'annexDisarm':
                    annexDisarm(node, this.credentials);
                    break;
                default:
                    sendError(node, "ON_INPUT", _ERR_INVALID_INPUT, "Invalid input payload. Use 'arm', 'partialArm', 'disarm', 'status', 'history', 'check', 'annexArm' or 'annexDisarm'");
                    node.error("Invalid input payload. Use 'arm', 'partialArm', 'disarm', 'status', 'history', 'check', 'annexArm' or 'annexDisarm'")
                    return;
            }            

            node.status({fill:"green", shape:"ring", text:"Connected"});

        });
    }

    function sendError(node, action, code, message, nostatus, error) {
        
        if (!nostatus)
            node.status({fill:"yellow", shape:"ring", text:"Check error output"});

        var payload = {
            "code": code,
            "action": action,
            "message": message
        }

        if (error != undefined && error.originalError != undefined) {
            payload.originalError = error.originalError;
        }

        node.send([null, null, null, { payload: payload }]);
        node.error(payload);
    }

    function arm(node, credentials) {

        if ((credentials.code == undefined || !credentials.code.trim())) {
            sendError(node, _ARM, _ERR_INVALID_CODE, "The arm feature needs a 'Code' configured in node settings");
            return;
        }

        node.status({fill:"yellow", shape:"ring", text:"Working ..."});

        node._site.arm(credentials.code)
            .then(output => {
                node.send([null, null, { payload: output }]);
                node.status({fill:"green", shape:"ring", text:"Connected"});
            })
            .catch(error => {
                if (error.code == _ERR_INVALID_SESSION) {
                    node._site.login()
                        .then(() => arm(node, credentials));
                }
                else {
                    node.error(error.toJson());
                    sendError(node, _ARM, error.code, error.message, error);
                }
            });
    }

    function partialArm(node, credentials) {

        if ((credentials.code == undefined || !credentials.code.trim())) {
            sendError(node, _PARTIALARM, _ERR_INVALID_CODE, "The partialArm feature needs a 'Code' configured in node settings");
            return;
        }

        node.status({fill:"yellow", shape:"ring", text:"Working ..."});

        node._site.partialArm(credentials.code)
            .then(output => {
                node.send([null, null, { payload: output }]);
                node.status({fill:"green", shape:"ring", text:"Connected"});
            })
            .catch(error => {
                if (error.code == _ERR_INVALID_SESSION) {
                    node._site.login()
                        .then(() => partialArm(node, credentials));
                }
                else {
                    node.error(error.toJson());
                    sendError(node, _PARTIALARM, error.code, error.message, error);
                }
            });
    }

    function disarm(node, credentials) {

        if ((credentials.code == undefined || !credentials.code.trim())) {
            sendError(node, _DISARM, _ERR_INVALID_CODE, "The disarm feature needs a 'Code' configured in node settings");
        }

        node.status({fill:"yellow", shape:"ring", text:"Working ..."});

        node._site.disarm(credentials.code)
            .then(output => {
                node.send([null, null, { payload: output }]);
                node.status({fill:"green", shape:"ring", text:"Connected"});
            })
            .catch(error => {
                if (error.code == _ERR_INVALID_SESSION) {
                    node._site.login()
                        .then(() => disarm(node, credentials));
                }
                else {
                    node.error(error.toJson());
                    sendError(node, _DISARM, error.code, error.message, error);
                }
            });
    }

    function check(node) {
        node._site.status(node)
            .then(status => {
                if (node._currentStatus == 'unknown')
                {
                    node._currentStatus = status.armedStatus;
                    return;
                }
    
                if (node._currentStatus != status.armedStatus)
                {
                    node._currentStatus = status.armedStatus;
                    node.send([null, { payload: status }]);
                }
            })
            .catch(error => {
                if (error.code == _ERR_INVALID_SESSION) {
                    node._site.login()
                        .then(() => check(node));
                }
                else {
                    node.error(error.toJson());
                    sendError(node, _CHECK, error.code, error.message, error);
                }
            });
    }

    function status(node) {
        node._site.status()
            .then(status => {
                node.send({ payload: status });
            })
            .catch(error => {
                if (error.code == _ERR_INVALID_SESSION) {
                    node._site.login()
                        .then(() => status(node));
                }
                else {
                    node.error(error.toJson());
                    sendError(node, _STATUS, error.code, error.message, error);
                }
            });
    }

    function history(node, config) {
        node._site.history(config.historyCount)
            .then(history => {
                node.send({ payload: history });
            })
            .catch(error => {
                if (error.code == _ERR_INVALID_SESSION) {
                    node._site.login()
                        .then(() => history(node));
                }
                else {
                    node.error(error.toJson());
                    sendError(node, _HISTORY, error.code, error.message, error);
                }
            });
    }

    function annexArm(node, credentials) {

        if ((credentials.code == undefined || !credentials.code.trim())) {
            sendError(node, _ANNEXARM, _ERR_INVALID_CODE, "The annex arm feature needs a 'Code' configured in node settings");
            return;
        }

        node.status({fill:"yellow", shape:"ring", text:"Working ..."});

        node._site.annexArm(credentials.code)
            .then(output => {
                node.send([null, null, { payload: output }]);
                node.status({fill:"green", shape:"ring", text:"Connected"});
            })
            .catch(error => {
                if (error.code == _ERR_INVALID_SESSION) {
                    node._site.login()
                        .then(() => annexArm(node, credentials));
                }
                else {
                    node.error(error.toJson());
                    sendError(node, _ANNEXARM, error.code, error.message, error);
                }
            });
    }

    function annexDisarm(node, credentials) {

        if ((credentials.code == undefined || !credentials.code.trim())) {
            sendError(node, _ANNEXDISARM, _ERR_INVALID_CODE, "The annex disarm feature needs a 'Code' configured in node settings");
        }

        node.status({fill:"yellow", shape:"ring", text:"Working ..."});

        node._site.annexDisarm(credentials.code)
            .then(output => {
                node.send([null, null, { payload: output }]);
                node.status({fill:"green", shape:"ring", text:"Connected"});
            })
            .catch(error => {
                if (error.code == _ERR_INVALID_SESSION) {
                    node._site.login()
                        .then(() => annexDisarm(node, credentials));
                }
                else {
                    node.error(error.toJson());
                    sendError(node, _ANNEXDISARM, error.code, error.message, error);
                }
            });
    }

    function validateConfig(node, credentials, config) {

        if ((credentials.email == undefined || !credentials.email.trim()) || 
            (credentials.password == undefined || !credentials.password.trim()) || 
            (config.siteId == undefined || !config.siteId.trim()))
        {
            sendError(node, "CONFIGURATION", _ERR_INVALID_CONFIGURATION, "Node is not configured with atleast email, password and site id", true);
            node.status({fill:"red", shape:"ring", text:"Not configured"});
            return false;
        }

        node.status({fill:"red", shape:"ring", text:"Disconnected"});

        return true;
    }

    function connect(node, credentials, config) {
        return Promise.resolve()
            .then(() => sectoralarm.connect(credentials.email, credentials.password, config.siteId))
    }

    RED.nodes.registerType("sectoralarm-site",SiteNode, {
        credentials: {
            email: {type:"text"},
            password: {type:"password"},
            code: {type:"password"}
        }
    });
}