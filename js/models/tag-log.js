//class TagLog
function TagLog(id, temperature, relativeHumidity, readingAt) {
    this.id                         = id;
    this.temperature                = temperature;
    this.relativeHumidity           = relativeHumidity;
    this.readingAt                  = readingAt;
    this.dewPoint                   = TagDataHelper.calculateDewPoint(this.temperature, this.relativeHumidity);
    this.equilibriumMoistureContent = TagDataHelper.calculateEquilibriumMoistureContent(this.temperature, this.relativeHumidity);
    this.preservationIndex          = TagDataHelper.calculatePreservationIndex(this.temperature, this.relativeHumidity);
    this.moldRisk                   = TagDataHelper.calculateMoldRisk(this.temperature, this.relativeHumidity);
}
