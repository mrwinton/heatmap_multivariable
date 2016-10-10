var TagLogPresenter = function() {

    var naturalAgingRating = function(preservationIndex) {
        return preservationIndex < 45 ? RATING_STATE.RISK : preservationIndex >= 75 ? RATING_STATE.GOOD : RATING_STATE.OK;
    };

    var moldRiskRating = function(moldRisk){
        return moldRisk == 0 ? RATING_STATE.GOOD : RATING_STATE.RISK;
    };

    var mechanicalDamageRating = function(equilibriumMoistureContent){
        return equilibriumMoistureContent < 5 || equilibriumMoistureContent > 12.5 ? RATING_STATE.RISK : RATING_STATE.OK;
    };

    var metalCorrosionRating = function(equilibriumMoistureContent){
        return equilibriumMoistureContent < 7.0 ? RATING_STATE.GOOD : equilibriumMoistureContent > 10.5 ? RATING_STATE.RISK : RATING_STATE.OK
    };

    var condensationRating = function(temperature, dewPoint){
        var difference =  temperature - dewPoint;
        return difference > 3 ? RATING_STATE.GOOD : difference > 2.5 ? RATING_STATE.OK : RATING_STATE.RISK
    };

    return {
        naturalAgingRating: function(index) {
            return naturalAgingRating(index);
        },
        moldRiskRating: function(moldRisk){
            return moldRiskRating(moldRisk);
        },
        mechanicalDamageRating: function(equilibriumMoistureContent){
            return mechanicalDamageRating(equilibriumMoistureContent);
        },
        metalCorrosionRating: function(equilibriumMoistureContent){
            return metalCorrosionRating(equilibriumMoistureContent);
        },
        condensationRating: function(temperature, dewPoint){
            return condensationRating(temperature, dewPoint)
        }
    };
}();