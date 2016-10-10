var TagDataHelper = function() {

    var calculateTemperature = function(relativeHumidity, dewPoint) {
        var tA = Math.pow(relativeHumidity/100,1/8);
        return (dewPoint - (112*tA) + 112) / ((0.9 * tA) + 0.1);
    };
    var calculateRelativeHumidity = function(temperature, dewPoint) {
        return 100 * (Math.pow((112-(0.1*temperature) + dewPoint) / (112 + (0.9 * temperature)),8));
    };
    var calculateDewPoint = function(temperature, relativeHumidity) {
        var tA = Math.pow(relativeHumidity/100,1/8);
        return ((112 + (0.9 * temperature))) * tA + (0.1 * temperature) - 112;
    };

    var calculatePreservationIndex = function(temperature, relativeHumidity) {
        return PreservationIndexHelper.get(((temperature<-23 ? -23 : temperature>65 ? 65 : Math.round(temperature))+23) * 90 + (relativeHumidity<6 ? 6 : relativeHumidity >95 ? 95 : Math.round(relativeHumidity)) - 6);
    };

    var calculateMoldRisk = function(temperature, relativeHumidity) {
        if(temperature > 45 || temperature < 2 || relativeHumidity < 65) return 0;
        return PreservationIndexHelper.get(8010 + (Math.round(temperature) - 2) * 36 + Math.round(relativeHumidity) - 65);
    };

    var calculateEquilibriumMoistureContent = function(temperature, relativeHumidity) {
        return EquilibriumMoistureContentHelper.get((Math.max(-20,Math.min(65,Math.round(temperature)))+20) * 101 + Math.round(relativeHumidity));
    };

    return {
        calculateTemperature: function(relativeHumidity, dewPoint) {
            return calculateTemperature(relativeHumidity, dewPoint);
        },
        calculateRelativeHumidity: function (temperature, dewPoint) {
            return calculateRelativeHumidity(temperature, dewPoint);
        },
        calculateDewPoint: function (temperature, relativeHumidity) {
            return calculateDewPoint(temperature, relativeHumidity);
        },
        calculatePreservationIndex: function (temperature, relativeHumidity) {
            return calculatePreservationIndex(temperature, relativeHumidity);
        },
        calculateMoldRisk: function (temperature, relativeHumidity) {
            return calculateMoldRisk(temperature, relativeHumidity);
        },
        calculateEquilibriumMoistureContent: function (temperature, relativeHumidity) {
            return calculateEquilibriumMoistureContent(temperature, relativeHumidity);
        }
    };
}();
