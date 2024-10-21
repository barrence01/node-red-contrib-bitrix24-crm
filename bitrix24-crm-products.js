module.exports = function(RED) {
    function Bitrix24CrmProducts(config) {
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
                bitrix_webhook.products = Bitrix(webhook).products; // Reinitialize with updated webhook

                switch (operationType) {
                    case '1':
                        add(msg, send, done);
                        break;
                    case '2':
                        update(msg, send, done);
                        break;
                    case '3':
                        get(msg, send, done);
                        break;
                    case '4':
                        list(msg, send, done);
                        break;
                    case '5':
                        fields(msg, send, done);
                        break;
                    case '6':
                        deletes(msg, send, done);
                        break;
                    default:
                        done(new Error("Invalid operation type"));
                        break;
                }
            });

            function add(msg, send, done) {

                if (!msg.fields) {
                    node.warn("The 'fields' property is required.");
                    done();
                    return;
                }

                bitrix_webhook.products.create(msg.fields)
                    .then(({ result }) => {
                        node.warn('Lead created successfully with ID:', result);
                        msg['payload'] = result;
                        node.send(msg);
                        done();
                    })
                    .catch(err => {
                        node.error("Failed to create lead: " + err.message);
                        done(err);
                    });
            }

            function update(msg, send, done) {

                if (!msg.id) {
                    node.warn("The 'id' property is required.");
                    done();
                    return;
                }
                if (!msg.fields) {
                    node.warn("The 'fields' property is required.");
                    done();
                    return;
                }

                bitrix_webhook.products.update(msg.id, msg.fields)
                    .then(({ result }) => {
                        msg['payload'] = result;
                        node.send(msg);
                        done();
                    })
                    .catch(err => {
                        node.error("Failed to update lead: " + err.message);
                        done(err);
                    });
            }

            function get(msg, send, done) {

                if (!msg.id) {
                    node.warn("The 'id' property is required.");
                    done();
                    return;
                }

                bitrix_webhook.products.get(msg.id)
                    .then(({ result }) => {
                        msg['payload'] = result;
                        node.send(msg);
                        done();
                    })
                    .catch(err => {
                        node.error("Failed to get lead: " + err.message);
                        done(err);
                    });
            }

            function list(msg, send, done) {

                if (!msg.select) {
                    node.warn("The 'select' property is required.");
                    done();
                    return;
                }

                bitrix_webhook.products.list(msg.select)
                    .then(({ result }) => {
                        msg['payload'] = result;
                        node.send(msg);
                        done();
                    })
                    .catch(err => {
                        node.error("Failed to list products: " + err.message);
                        done(err);
                    });
            }

            function fields(msg, send, done) {

                if (!msg.id) {
                    node.warn("The 'id' property is required.");
                    done();
                    return;
                }

                bitrix_webhook.products.fields(msg.id)
                    .then(({ result }) => {
                        msg['payload'] = result;
                        node.send(msg);
                        done();
                    })
                    .catch(err => {
                        node.error("Failed to get fields: " + err.message);
                        done(err);
                    });
            }

            function deletes(msg, send, done) {

                if (!msg.id) {
                    node.warn("The 'id' property is required.");
                    done();
                    return;
                }

                bitrix_webhook.products.delete(msg.id)
                    .then(({ result }) => {
                        msg['payload'] = result;
                        node.send(msg);
                        done();
                    })
                    .catch(err => {
                        node.error("Failed to get lead: " + err.message);
                        done(err);
                    });
            }
        }).catch(err => {
            node.error("Failed to load Bitrix module:", err);
        });
    }

    

    RED.nodes.registerType("bitrix24-crm-products", Bitrix24CrmProducts);
};
