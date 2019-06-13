{
    /*
    read config from json file
    */
    var currentFolder = (new File($.fileName)).parent;
    //get the config file
    var configJson = new File(currentFolder.toString() + "/config.json");
    configJson.open('r');
    //try and parse JSON
    var config = JSON.parse(configJson.read());


    /*
    get current project and related items
    */
    var currentProject = app.project;
    //app.beginUndoGroup("script 1");
    var cItems = currentProject.items;

    for(var i = 1;i<= cItems.length;i++ ){
        if(cItems[i].typeName === 'Composition'){
           var comp  = cItems[i];
            //now go through the layers
            var compLayers = comp.layers;
            for(var j = 1;j<= compLayers.length;j++ ){
                if(compLayers[j].matchName === 'ADBE Text Layer'){
                    var txtLayer =  compLayers[j];
                    var txtDocument = new TextDocument("I wrote this");
                    txtLayer.property("Source Text").setValue(txtDocument);
                }
            }

            var renderQueue = currentProject.renderQueue;
            renderQueue.items.add(comp);//.applyTemplate("H264HighQuality");
            for(var x = 1; x <= renderQueue.length; x++){
                if(renderQueue.item(x).status == RQItemStatus.QUEUED){
                    var renderItem = renderQueue.item(x);
                    //now spin through output modules and set path etc.
                    for(var y = 1;y<=renderItem.outputModules.length;y++){
                        console.log("current path is " + renderItem.outputModule(y).file.path);
                        var newPath = renderItem.outputModule(y).file.path + "/" + renderItem.comp.name;
                        Folder(newPath).create();
                        newPath += "/" + renderItem.outputModule(y).file.name;
                        renderItem.outputModule(y).file = new File(newPath);
                    }
                }
            }

            currentProject.renderQueue.render();
            break;
        }
    }

    //app.endUndoGroup();

   
}