
import sys
import os
import arcpy
import uuid
import json

# constants
SERVER_PROD_NAME = 'Server'
PRO_PROD_NAME = 'ArcGISPro'
PAGX_FILE_EXT = "pagx"

_productName = arcpy.GetInstallInfo()['ProductName']


def exportLayout(result, outfile):
    layout = result.ArcGISProject.listLayouts()[0]
    dpi = result.DPI

    try:
        layout.exportToPDF(outfile, dpi)
    except Exception as err:
        arcpy.AddError("error raised..." + str(err))
        raise

# generating a unique name for each output file


def generateUniqueFileName(outFormat):
    guid = str(uuid.uuid1())
    fileName = '{}.{}'.format(guid, outFormat)
    fullFileName = os.path.join(arcpy.env.scratchFolder, fileName)
    return fullFileName

# Main module


def main():

    # Get the value of the input parameter
    Web_Map_as_JSON = arcpy.GetParameterAsText(0)
    outfilename = arcpy.GetParameterAsText(1)
    format = arcpy.GetParameterAsText(2)
    layoutTemplatesFolder = arcpy.GetParameterAsText(3)
    layoutTemplateName = arcpy.GetParameterAsText(4)

    # Special logic while being executed in ArcGIS Pro
    # - so that a Geoprocessing result can be acquired without needing any json to begin to feed in
    # - this is to make the publishing experience easier
    arcpy.AddMessage(Web_Map_as_JSON)

    if (Web_Map_as_JSON == '#'):
        if (_productName == PRO_PROD_NAME):
            return
        elif (_productName == SERVER_PROD_NAME):
            arcpy.AddIDMessage('ERROR', 590, 'Web_Map_as_JSON')
        else:
            arcpy.AddIDMessage('ERROR', 120004, _productName)

    # generate a new output filename when the output_filename parameter is empty or the script is running on server
    if outfilename.isspace() or _productName == SERVER_PROD_NAME:
        outfilename = generateUniqueFileName('PDF')

    layoutTemplate = os.path.join(layoutTemplatesFolder, '{}.{}'.format(layoutTemplateName, PAGX_FILE_EXT))

    # Convert the webmap to a map document
    try:
        result = arcpy.mp.ConvertWebMapToArcGISProject(
            Web_Map_as_JSON, layoutTemplate)

        exportLayout(result, outfilename)

    except Exception as err:
        arcpy.AddError(str(err))
    # Set output parameter
    #
    arcpy.SetParameterAsText(1, outfilename)


if __name__ == "__main__":
    main()
