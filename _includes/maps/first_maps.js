Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};
    
L.TimeDimension.Layer.SODAHeatMap = L.TimeDimension.Layer.extend({

    initialize: function(data, options) {
        var heatmapCfg = {
            radius: 10,
            maxOpacity: .8,
            scaleRadius: false,
            useLocalExtrema: false,
            latField: 'lat',
            lngField: 'lng',
            valueField: 'intensity'
        };
        heatmapCfg = $.extend({}, heatmapCfg, {});
        var layer = new HeatmapOverlay(heatmapCfg);
        L.TimeDimension.Layer.prototype.initialize.call(this, layer, options);
        this._currentLoadedTime = 0;
        this._currentTimeData = {
            max: 10,
            data: []
        };
        this._period = this.options.period || "P1M";
        this._alldata = data;
    },

    onAdd: function(map) {
        L.TimeDimension.Layer.prototype.onAdd.call(this, map);
        map.addLayer(this._baseLayer);
        if (this._timeDimension) {
            this._getDataForTime(this._timeDimension.getCurrentTime());
        }
    },

    _onNewTimeLoading: function(ev) {
        this._getDataForTime(ev.time);
        return;
    },

    isReady: function(time) {
        return (this._currentLoadedTime == time);
    },

    _update: function() {
        this._baseLayer.setData(this._currentTimeData);
        return true;
    },

    _getDataForTime: function(time) {
        if (!this._map) {
            return;
        }
        var d = new Date(time);
        var key = d.format("yyyymmdd'T'HHMMss'Z'", true);
        //console.log(key);
        //make correct time
        data = this._alldata[key];
        //console.log(data);
        delete this._currentTimeData.data;
        this._currentTimeData.data = [];
        for (var i = 0; i < data.length; i++) {
            var marker = data[i];
            this._currentTimeData.data.push({
                lat: marker[0],
                lng: marker[1],
                intensity: marker[2]
            });
        }
        this._currentLoadedTime = time;
        if (this._timeDimension && time == this._timeDimension.getCurrentTime() && !this.   _timeDimension.isLoading()) {
                this._update();
        }
        this.fire('timeload', {
                time: time
        });
    }
    
});

L.timeDimension.layer.sodaHeatMap = function(data, options) {
    return new L.TimeDimension.Layer.SODAHeatMap(data, options);
};



var currentTime = new Date();
currentTime.setUTCDate(1, 0, 0, 0, 0);

var map_warm = L.map('map_warm', {
    zoom: 12,
    center: [40.73, -73.97],
    timeDimension: true,
    timeDimensionOptions: {
        timeInterval: "2016-08-05T04:00:00Z/2016-08-06T03:50:00Z",
        period: "PT10M"
    }
});


var layer = new L.StamenTileLayer("toner-lite");
map_warm.addLayer(layer);
d3.json("/files/warm_predictions.json", function(error, data){
    var options = {};
    var testSODALayer = L.timeDimension.layer.sodaHeatMap(data, options);
    testSODALayer.addTo(map_warm);

    L.Control.TimeDimensionCustom = L.Control.TimeDimension.extend({
        _getDisplayDateFormat: function(date){
           return date.format("HH:MM");
        }    
    });
    var timeDimensionControl = new L.Control.TimeDimensionCustom({
        playerOptions: {
            buffer: 1,
            minBufferReady: -1
        }
    });
    map_warm.addControl(timeDimensionControl);
});
var map_cold = L.map('map_cold', {
    zoom: 12,
    center: [40.73, -73.97],
    timeDimension: true,
    timeDimensionOptions: {
        timeInterval: "2016-08-05T04:00:00Z/2016-08-06T03:50:00Z",
        period: "PT10M"
    }
});


var layer2 = new L.StamenTileLayer("toner-lite");
map_cold.addLayer(layer2);
d3.json("/files/cold_predictions.json", function(error, data){
    var options = {};
    var testSODALayer2 = L.timeDimension.layer.sodaHeatMap(data, options);
    testSODALayer2.addTo(map_cold);

    L.Control.TimeDimensionCustom = L.Control.TimeDimension.extend({
        _getDisplayDateFormat: function(date){
           return date.format("HH:MM");
        }    
    });
    var timeDimensionControl = new L.Control.TimeDimensionCustom({
        playerOptions: {
            buffer: 1,
            minBufferReady: -1
        }
    });
    map_cold.addControl(timeDimensionControl);
});