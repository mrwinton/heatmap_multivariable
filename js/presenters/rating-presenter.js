var RatingPresenter = function() {

    var _closest = function (array, number) {
        var num = 0;
        for (var i = array.length - 1; i >= 0; i--) {
            if (Math.abs(number - array[i]) < Math.abs(number - array[num])) {
                num = i;
            }
        }
        return array[num];
    };

    var rating_values = Object.keys(RATING_STATE).map(function(key) { return RATING_STATE[key].value; });

    var rating = function(sentiment){
        var closest_value = _closest(rating_values, sentiment);
        for (var key in RATING_STATE) {
            if(RATING_STATE[key].value == closest_value){
                return RATING_STATE[key];
            }
        }
    };

    return {
        rating: function(sentiment){
            return rating(sentiment);
        }
    };
}();