import arcpy


aprx = arcpy.mp.ArcGISProject("CURRENT")

layout = aprx.listLayouts()[0]

arcpy.AddMessage(f"  {layout.name} ({layout.pageHeight} x {layout.pageWidth} {layout.pageUnits})")

elm = layout.listElements('TEXT_ELEMENT', '[map-title]')[0]

arcpy.AddMessage(elm.text)