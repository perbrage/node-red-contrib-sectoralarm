const sectoralarm = require('sectoralarm');

module.exports = function(RED) {

    function SiteNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this._currentStatus = 'unknown';

        if (!validateConfig(node, this.credentials, config))
            return;
        
        connect(node, this.credentials, config)
            .then((site) => {
                node.status({fill:"green", shape:"ring", text:"Connected"});
                this._site = site;
            })
            .catch((err) => {
                node.status({fill:"red", shape:"ring", text:err.code});
                return;
            })


        node.on('input', function(msg) {
            if (msg.payload == 'check') {
                check(node);
                return;
            }

            if (msg.payload == 'status') {
                status(node);
                return;
            }

            if (msg.payload == 'history') {
                history(node);
                return;
            }
        });
    }

    function check(node) {
        node._site.status()
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
            .catch((err) => {
                if (err.code = 'ERR_INVALID_SESSION') {
                    node._site.login();
                    status();
                }
                else
                    node.status({fill:"red", shape:"ring", text:err.code});
            });

    }

    function status(node) {
        node._site.status()
            .then(status => {
                node.send({ payload: status });
            })
            .catch((err) => {
                if (err.code = 'ERR_INVALID_SESSION') {
                    node._site.login();
                    status();
                }
                else
                    node.status({fill:"red", shape:"ring", text:err.code});
            });
    }

    function history(node) {
        node._site.history()
            .then(history => {
                node.send({ payload: history });
            })
            .catch((err) => {
                if (err.code = 'ERR_INVALID_SESSION') {
                    node._site.login();
                    history();
                }
                else
                    node.status({fill:"red", shape:"ring", text:err.code});
            });
    }

    function validateConfig(node, credentials, config) {

        if ((credentials.email == undefined || !credentials.email.trim()) || 
            (credentials.password == undefined || !credentials.password.trim()) || 
            (config.siteId == undefined || !config.siteId.trim()))
        {
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
            password: {type:"password"}
        }
    });
}