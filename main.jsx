{
    /*
    get current project and related items
    */
    var currentProject = (app.project) ? app.project: app.newProject();
    //app.beginUndoGroup("script 1");
    var cItems = currentProject.items;


    /*
    read config from json file
    */
    var currentFolder = (new File($.fileName)).parent.fsName;
    //get the config file
    var configJson = new File(currentFolder + "/config.json");
    configJson.open('r');
    //try and parse JSON
    var config = JSON.parse(configJson.read());
    configJson.close();

    /*
    get source data from csv
    https://github.com/ExtendScript/wiki/wiki/Read-CSV
    */
    var csvFile = new File(currentFolder + '/' + config.project.source_file);
    csvFile.encoding = 'UTF8';
    //file.lineFeed = 'Macintosh'; // set the linefeeds
    csvFile.open('r');
    var csv = csvFile.read();
    csvFile.close();

    var lines = csv.split('\n');// split the lines (windows should be '\r')
    var data = [];
    var keys = lines[0].split(','); // read the column names from first line
    // loop the data, start from 1 as first line has column headers
    for(var i = 1; i < lines.length;i++){
        var obj = {};
        var cells = lines[i].split(',');
        obj[keys[0]] = cells[0];
        obj[keys[1]] = cells[1];
        obj[keys[2]] = cells[2];
        data.push(obj);
    }

    //$.writeln(data.toSource()); // show what we got
    //app.beginUndoGroup("script 1");

    /*
    spin through data and create comp
    no forEach in extendScript :(
    */

    for(var i=0, max=data.length;i<max;i++){
        //create a comp
        //https://cgi.tutsplus.com/tutorials/introduction-to-the-basics-of-after-effects-scripting--ae-22518
        var item = data[i];
        var comp = app.project.items.addComp(item.firstname + '-' + item.surname + '-' + item.location, config.project.vw, config.project.vh, config.project.pixelratio, config.project.duration, config.project.framerate);
        comp.openInViewer();
        //add background
        var backgroundLayer = comp.layers.addSolid([0, 0, 0], "Background", config.project.vw, config.project.vh, config.project.pixelratio);
        //add a grid effect
        backgroundLayer.Effects.addProperty("Grid");
        backgroundLayer.property("Effects").property("Grid").property("Anchor").setValue([0,0]);
        backgroundLayer.property("Effects").property("Grid").property("Corner").expression = "[width/2, height/2]";
        backgroundLayer.property("Effects").property("Grid").property("Color").setValue([255,255,255]);
        backgroundLayer.property("Effects").property("Grid").property("Blending Mode").setValue(2);

        var imagePath = currentFolder + "/" + item.location + ".jpeg";  
        var imageFile = File(imagePath);  
        var importOptions = new ImportOptions(imageFile);  
        var image = app.project.importFile(importOptions); 
        
        var imageLayer = comp.layers.add(image);
        imageLayer.property("Opacity").setValueAtTime(0,0);
        imageLayer.property("Opacity").setValueAtTime(2,100);
        imageLayer.property("Opacity").setValueAtTime(8,100);
        imageLayer.property("Opacity").setValueAtTime(10,0);

        var videoPath = currentFolder + "/" + item.location + ".mp4";  
        var videoFile = File(videoPath);  
        importOptions = new ImportOptions(videoFile);  
        var video = app.project.importFile(importOptions); 
        
        var videoLayer = comp.layers.add(video);
        videoLayer.property("Scale").setValue([300,300]);
        videoLayer.property("Opacity").setValueAtTime(0,0);
        videoLayer.property("Opacity").setValueAtTime(2,100);
        videoLayer.property("Opacity").setValueAtTime(8,100);
        videoLayer.property("Opacity").setValueAtTime(10,0);

        /*var myOpacityExpression = "value;";

        var MasterComp = app.project.activeItem;
        var Precomp1 = app.project.items.addComp("Precomp1", 1920, 1080, 1, 60, 29.97);
        MasterComp.layers.add(Precomp1);

        var Item001Comp = app.project.items.addComp("Item 1", 1920, 1080, 1, 60, 29.97);

        Item001Layer = Precomp1.layers.add(Item001Comp);
        Item001Layer.property("Transform").property("Opacity").expression = myOpacityExpression;*/

        //create wipe layer
        var wipeLayer = comp.layers.addSolid([0.1, 0.1, 0.1], "Wipe", config.project.vw, config.project.vh, config.project.pixelratio);
        wipeLayer.Effects.addProperty("Radial Wipe");
        wipeLayer.property("Effects").property("Radial Wipe").property("Wipe").setValue(2); // Counterclockwise
        wipeLayer.property("Opacity").setValue(50);

        //set wipe transition animation
        wipeLayer.property("Effects").property("Radial Wipe").property("Transition Completion").setValueAtTime(0, 100);
        wipeLayer.property("Effects").property("Radial Wipe").property("Transition Completion").setValueAtTime(1, 0);
        wipeLayer.property("Effects").property("Radial Wipe").property("Transition Completion").expression = "loopOut('Cycle')";

        //add text layer
        var textLayer = comp.layers.addText(item.firstname + " " + item.surname);
        var textProperty = textLayer.property("Source Text");
        var textPropertyValue = textProperty.value;

        // Changing source text settings
        textPropertyValue.resetCharStyle();
        textPropertyValue.fontSize = 200;
        textPropertyValue.fillColor = [1, 1, 1];
        textPropertyValue.justification = ParagraphJustification.CENTER_JUSTIFY;
        textProperty.setValue(textPropertyValue);

        textLayer.property("Opacity").setValueAtTime(0,0);
        textLayer.property("Opacity").setValueAtTime(2,100);
        textLayer.property("Opacity").setValueAtTime(8,100);
        textLayer.property("Opacity").setValueAtTime(10,0);

        textLayer.property("Position").setValueAtTime(0,[-500,540]);
        textLayer.property("Position").setValueAtTime(2,[960,540]);
        textLayer.property("Position").setValueAtTime(8,[960,540]);
        textLayer.property("Position").setValueAtTime(10,[2400,540]);
        // Adding expression to source text
        //textProperty.expression = "Math.floor(10-time)";

        // Adjusting text layer anchor point
        var textLayerHeight = textLayer.sourceRectAtTime(0, false);
        textLayer.property("Anchor Point").setValue([0, textLayerHeight.height / 2 * -1]);

    }


    

    //app.endUndoGroup();

   
}