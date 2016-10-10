var CreateTagLog = function(tagLogDatum) {
  this.tagLogDatum = tagLogDatum;
}

CreateTagLog.prototype = _.extend(CreateTagLog.prototype, {
  call: function() {
    return new TagLog(this.tagLogDatum.id,
      this.tagLogDatum.temperature,
      this.tagLogDatum.relativeHumidity,
      this.tagLogDatum.readingAt);
  }
});
