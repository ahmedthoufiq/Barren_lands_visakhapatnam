var countries = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017');
var india = countries.filter(ee.Filter.eq('country_na', 'India'));
var visakhapatnam = ee.Geometry.Rectangle([82.5, 17.3, 83.5, 18.2]);
var sentinel2 = ee.ImageCollection('COPERNICUS/S2')
                  .filterBounds(visakhapatnam)
                  .filterDate('2023-01-01', '2023-12-31')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                  .median();
var red = sentinel2.select('B4');
var nir = sentinel2.select('B8');
var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
var ndviParams = {
  min: -1,
  max: 1,
  palette: ['brown', 'red', 'yellow', 'green']
};
// Identifing barren lands using NDVI thresholds (0 <= NDVI < 0.2)
var barrenThresholdLow = 0;
var barrenThresholdHigh = 0.2;
var barrenLands = ndvi.gte(barrenThresholdLow).and(ndvi.lt(barrenThresholdHigh)).selfMask();
// Identify water bodies (NDVI < 0)
var waterThreshold = 0;
var waterBodies = ndvi.lt(waterThreshold).selfMask();
// Visualization parameters for barren lands and water bodies
var barrenParams = {
  palette: ['gray']
};
var waterParams = {
  palette: ['blue']
};
Map.centerObject(visakhapatnam, 10);
Map.addLayer(ndvi.clip(visakhapatnam), ndviParams, 'NDVI');
Map.addLayer(barrenLands.clip(visakhapatnam), barrenParams, 'Barren Lands');
Map.addLayer(waterBodies.clip(visakhapatnam), waterParams, 'Water Bodies');
Export.image.toDrive({
  image: ndvi.clip(visakhapatnam),
  description: 'Visakhapatnam_NDVI',
  scale: 10,
  region: visakhapatnam,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e9
});
Export.image.toDrive({
  image: barrenLands.clip(visakhapatnam),
  description: 'Visakhapatnam_Barren_Lands',
  scale: 10,
  region: visakhapatnam,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e9
});
Export.image.toDrive({
  image: waterBodies.clip(visakhapatnam),
  description: 'Visakhapatnam_Water_Bodies',
  scale: 10,
  region: visakhapatnam,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e9
});
