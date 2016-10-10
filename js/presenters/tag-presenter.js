var TagPresenter = function() {

    var _percentage = function(value) {
        return (value * 100) + '%';
    };

    var tagHealthSentiment = function(tag) {
        if(!tag.alive ) {
            return { value: "sensor not alive", rating: RATING_STATE.RISK };
        } else if (tag.outOfRange) {
            return { value: "sensor out of range - please move closer to router", rating: RATING_STATE.RISK };
        } else if (tag.shorted) {
            return { value: "sensor shorted - replace asap", rating: RATING_STATE.RISK };
        } else if (tag.batteryRemaining < 0.20){
            return { value: _percentage(tag.batteryRemaining) + " battery - change battery asap", rating: RATING_STATE.RISK };
        } else {
            return { value: _percentage(tag.batteryRemaining) + " battery - good signal", rating: RATING_STATE.GOOD };
        }
    };

    return {
        tagHealthSentiment: function(tag) {
            return tagHealthSentiment(tag);
        },

    };
}();