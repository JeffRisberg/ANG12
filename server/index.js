var path = require('path');
var globSync = require('glob').sync;
var express = require('express');
var app = express();

var mocks = globSync('./mocks/**/*.js', {cwd: __dirname}).map(require);

const PATH_FONTS = path.resolve(__dirname, '../app/fonts');
const PATH_STYLES = path.resolve(__dirname, '../app/styles');
const PATH_IMAGES = path.resolve(__dirname, '../app/images');
const PATH_JS = path.resolve(__dirname, '../app/js');

const PATH_DIST = path.resolve(__dirname, '../dist');

app.use('/fonts', express.static(PATH_FONTS));
app.use('/styles', express.static(PATH_STYLES));
app.use('/images', express.static(PATH_IMAGES));
app.use('/js', express.static(PATH_JS));
app.use(express.static(PATH_DIST));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../app/index.html'));
});

var nedb = require('nedb');

app.campaignsDB = new nedb({filename: 'campaigns', autoload: true});
app.adGroupsDB = new nedb({filename: 'adGroups', autoload: true});

mocks.forEach(function (route) {
    route(app);
});

var server = app.listen(process.env.PORT || 3000, () => {
    var port = server.address().port;

    console.log('Server is listening at %s', port);
});
