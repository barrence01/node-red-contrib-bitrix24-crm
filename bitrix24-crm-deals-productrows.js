module.exports = function(RED) {
    function Bitrix24CrmDealsProductRows(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Dynamically import the Bitrix module
        import('@2bad/bitrix').then(({ Bitrix }) => {
            const bitrix_webhook = Bitrix(config.webhook);

            node.on('input', (msg, send, done) => {
                // Get updated values from msg or config
                const operationType = msg.operationType || config.operationType; 
                const webhook = msg.webhook || config.webhook; // Get updated webhook if provided
                
                // Use the current webhook for the request
                bitrix_webhook.deals = Bitrix(webhook).deals; // Reinitialize with updated webhook

                switch (operationType) {
                    case '1':
                        get(msg, send, done);
                        break;
                    case '2':
                        set(msg, send, done);
                        break;
                    default:
                        done(new Error("Invalid operation type"));
                        break;
                }
            });

            function set(msg, send, done) {

                if (!msg.id) {
                    node.warn("The 'id' property is required.");
                    done();
                    return;
                }
                if (!msg.rows) {
                    node.warn("The 'rows' property is required.");
                    done();
                    return;
                }

                bitrix_webhook.dealsProductRows.set(msg.id, msg.rows)
                    .then(({ result }) => {
                        msg['payload'] = result;
                        node.send(msg);
                        done();
                    })
                    .catch(err => {
                        node.error("Failed to update productrow: " + err.message);
                        done(err);
                    });
            }

            function get(msg, send, done) {

                if (!msg.id) {
                    node.warn("The 'id' property is required.");
                    done();
                    return;
                }

                bitrix_webhook.dealsProductRows.get(msg.id)
                    .then(({ result }) => {
                        msg['payload'] = result;
                        node.send(msg);
                        done();
                    })
                    .catch(err => {
                        node.error("Failed to get productrow: " + err.message);
                        done(err);
                    });
            }
        }).catch(err => {
            node.error("Failed to load Bitrix module:", err);
        });
    }

    RED.nodes.registerType("bitrix24-crm-deals-productrows", Bitrix24CrmDealsProductRows);
};
