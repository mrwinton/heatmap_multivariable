var CreateTag = function(tagData) {
  this.tagData = tagData;
}

CreateTag.prototype = _.extend(CreateTag.prototype, {
  call: function() {
    return new Tag(this.tagData.id,
      this.tagData.name,
      this.tagData.alive,
      this.tagData.outOfRange,
      this.tagData.shorted,
      this.tagData.batteryRemaining,
      this._createTagLogs(this.tagData.tagLogs)
    );
  },

  _createTagLogs: function(tagLogs) {
    return tagLogs.map(function (tagLogDatum) {
      return new CreateTagLog(tagLogDatum).call();
    });
  }
});
