module.exports = function (app) {
    var express = require('express');
    var adGroupsRouter = express.Router();

    // Use the body-parser library in this service
    var bodyParser = require('body-parser');
    adGroupsRouter.use(bodyParser.json());

    var adGroupsDB = app.adGroupsDB;

    adGroupsRouter.get('/', function (req, res) {
        delete req.query["_"];
        adGroupsDB.find(req.query).exec(function (error, adGroups) {
            res.send(
                adGroups
            )
        })
    });

    adGroupsRouter.post('/', function (req, res) {
        // Look for the most recently created record
        adGroupsDB.find({}).sort({id: -1}).limit(1).exec(function (err, adGroups) {

            if (adGroups.length != 0)
                req.body.adGroup.id = adGroups[0].id + 1;
            else
                req.body.adGroup.id = 1;

            // Insert the new record
            adGroupsDB.insert(req.body.adGroup, function (err, newadGroup) {
                res.status(201);
                res.send({'status': 'ok', 'data': [newadGroup]});
            })
        });
    });

    adGroupsRouter.get('/:id', function (req, res) {
        adGroupsDB.find({id: req.params.id}).exec(function (error, adGroups) {
            if (adGroups.length > 0)
                res.send({
                    adGroups
                });
            else {
                res.status(404);
            }
        });
    });

    adGroupsRouter.put('/:id', function (req, res) {
        var adGroup = req.body.adGroup;

        adGroupsDB.update({id: req.params.id}, adGroup, {}, function (err, count) {
            res.send({'status': 'ok', 'data': [adGroup]});
        });
    });

    adGroupsRouter.delete('/:id', function (req, res) {
        adGroupsDB.remove({id: req.params.id}, {}, function (err, count) {
            res.status(204).end();
        });
    });

    app.use('/api/adGroups', adGroupsRouter);
};
