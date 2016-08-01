module.exports = function (app) {
    var express = require('express');
    var campaignsRouter = express.Router();

    // Use the body-parser library in this service
    var bodyParser = require('body-parser');
    campaignsRouter.use(bodyParser.json());

    var campaignsDB = app.campaignsDB;

    campaignsRouter.get('/', function (req, res) {

        var take = parseInt(req.query.take);
        var skip = parseInt(req.query.skip);
        var page = req.query.page;
        var pageSize = req.query.pageSize;
        var sortField = req.query.sort ? req.query.sort[0].field : null;
        var sortDir = req.query.sort ? req.query.sort[0].dir : null;

        console.log("take " + take + " skip " + skip + " page " + page + " pageSize " + pageSize +
            " sortField " + sortField + " sortDir " + sortDir);

        if (isNaN(take)) take = Number.MAX_SAFE_INTEGER;
        if (isNaN(skip)) skip = 0;

        delete req.query["_"];
        delete req.query["take"];
        delete req.query["skip"];
        delete req.query["page"];
        delete req.query["pageSize"];
        delete req.query["sort"];

        var sort = {};
        if (sortField) sort[sortField] = (sortDir.toLowerCase() == 'asc' ? 1 : -1);

        campaignsDB.find(req.query).sort(sort).skip(skip).limit(take).exec(function (error, campaigns) {
                campaignsDB.count(req.query).exec(function (error, count) {
                    res.send(
                        {
                            'status': "ok",
                            'data': campaigns,
                            'total': count
                        }
                    )
                })
            }
        );
    });

    campaignsRouter.post('/', function (req, res) {
        // Look for the most recently created record
        campaignsDB.find({}).sort({id: -1}).limit(1).exec(function (err, campaigns) {

            if (campaigns.length != 0)
                req.body.campaign.id = campaigns[0].id + 1;
            else
                req.body.campaign.id = 1;

            // Insert the new record
            campaignsDB.insert(req.body.campaign, function (err, newcampaign) {
                res.status(201);
                res.send({'status': 'ok', 'data': [newcampaign]});
            })
        });
    });

    campaignsRouter.get('/:id', function (req, res) {
        campaignsDB.find({id: req.params.id}).exec(function (error, campaigns) {
            if (campaigns.length > 0)
                res.send({
                    campaigns
                });
            else {
                res.status(404);
            }
        });
    });

    campaignsRouter.put('/:id', function (req, res) {
        var campaign = req.body.campaign;

        campaignsDB.update({id: req.params.id}, campaign, {}, function (err, count) {
            res.send({'status': 'ok', 'data': [campaign]});
        });
    });

    campaignsRouter.delete('/:id', function (req, res) {
        campaignsDB.remove({id: req.params.id}, {}, function (err, count) {
            res.status(204).end();
        });
    });

    app.use('/api/campaigns', campaignsRouter);
};
