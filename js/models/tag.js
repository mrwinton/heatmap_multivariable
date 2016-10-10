//class Tag
function Tag(id, name, alive, outOfRange, shorted, batteryRemaining, tagLogs) {
    //PLACE ANY CONSTANTS HERE
    this.id               = id;
    this.name             = name;
    this.alive            = alive;
    this.outOfRange       = outOfRange;
    this.shorted          = shorted;
    this.batteryRemaining = batteryRemaining;
    this.tagLogs          = tagLogs;
}

// Tag.prototype.tagHealthSentiment = function() {
//     return TagPresenter.tagHealthSentiment(this);
// };
//
// Tag.prototype.naturalAgingSentiment = function() {
//     if(this.tagLogs.length == 0) { return RATING_STATE.NO_DATA }
//     var sentiment = RatingHelper.naturalAgingSentiment(this.tagLogs);
//     return RatingPresenter.rating(sentiment);
// };
//
// Tag.prototype.moldRiskSentiment = function () {
//     if(this.tagLogs.length == 0) { return RATING_STATE.NO_DATA }
//     var sentiment = RatingHelper.moldRiskSentiment(this.tagLogs);
//     return RatingPresenter.rating(sentiment);
// };
//
// Tag.prototype.mechanicalDamageSentiment = function () {
//     if(this.tagLogs.length == 0) { return RATING_STATE.NO_DATA }
//     var sentiment = RatingHelper.mechanicalDamageSentiment(this.tagLogs);
//     return RatingPresenter.rating(sentiment);
// };
//
// Tag.prototype.metalCorrosionSentiment = function () {
//     if(this.tagLogs.length == 0) { return RATING_STATE.NO_DATA }
//     var sentiment = RatingHelper.metalCorrosionSentiment(this.tagLogs);
//     return RatingPresenter.rating(sentiment);
// };
//
// Tag.prototype.condensationSentiment = function () {
//     if(this.tagLogs.length == 0) { return RATING_STATE.NO_DATA }
//     var sentiment = RatingHelper.condensationSentiment(this.tagLogs);
//     return RatingPresenter.rating(sentiment);
// };
