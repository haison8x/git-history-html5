/*global createjs */
/*jshint bitwise: false*/

var GITHISTORYGRAPH = (function ($) {
    "use strict";
    var canvas, stage, actualStageHeight;
    var pageHeight, currentPage, pageCount;
    var manifestLoader, commitSprite;
    var gitHistoryGraphObject = {};
    var textLocationStorage = {};

    gitHistoryGraphObject.options = {
        canvasSelector: "#history-graph-canvas",
        inactiveLineColor: "#9b9997",
        activeLineColor: "#5592f0",
        highlightLineColor: "#d74c2f",
        textFont: "14px Arial",
        textColor: "#333",
        labelFont: "bold 14px Arial",
        branchBackground: "#c4e3fc",
        branchBorder: "#9dc8ea",
        branchTextColor: "#333",
        headBackground: "#c3fb9e",
        headBorder: "#82c56d",
        headTextColor: "#008000"
    };

    gitHistoryGraphObject.initialize = function () {
        textLocationStorage = {};
        canvas = $(gitHistoryGraphObject.options.canvasSelector).get(0);
        stage = new createjs.Stage(canvas);
        stage.enableMouseOver();

        var manifest = [{ src: "/images/git-commit.png", id: "git-commit"}];

        manifestLoader = new createjs.LoadQueue(false);
        manifestLoader.addEventListener("complete", gitHistoryGraphObject.handleManifestLoaderComplete);
        manifestLoader.loadManifest(manifest);

        $("#next").click(function () { gitHistoryGraphObject.next(); });
        $("#previous").click(function () { gitHistoryGraphObject.previous(); });
    };

    gitHistoryGraphObject.handleManifestLoaderComplete = function () {
        commitSprite = new createjs.SpriteSheet({
            "images": [manifestLoader.getResult("git-commit")],
            "frames": { "regX": 0, "height": 26, "count": 3, "regY": 0, "width": 26 },
            "animations": { "inactive": [0, 0, "inactive"], "active": [1, 1, "active"], "highlight": [2, 2, "highlight"] }
        });
        var graph = $(canvas).data("graph");
        gitHistoryGraphObject.renderHistoryGraph(graph);

    };

    gitHistoryGraphObject.clearStage = function () {
        stage.removeAllChildren();
    };

    gitHistoryGraphObject.renderHistoryGraph = function (graph) {

        gitHistoryGraphObject.clearStage();

        $(graph.Lines).each(function (index, element) {
            gitHistoryGraphObject.drawLine(element);
        });

        $(graph.Commits).each(function (index, element) {
            gitHistoryGraphObject.drawCommit(element);
        });

        $(graph.Labels).each(function (index, element) {
            gitHistoryGraphObject.drawLabel(element);
        });
        $(graph.Texts).each(function (index, element) {
            gitHistoryGraphObject.drawText(element);


        });

        actualStageHeight = graph.Height + 50;
        pageHeight = $(gitHistoryGraphObject.options.canvasSelector).height();
        pageCount = actualStageHeight % pageHeight == 0
         ? actualStageHeight / pageHeight
         : Math.floor(actualStageHeight % pageHeight) + 1;

        currentPage = 0;
        stage.y = 0;
        stage.update();
    };

    gitHistoryGraphObject.drawLabel = function (labelData) {

        var textColor = labelData.LabelState === "head"
        ? gitHistoryGraphObject.options.headTextColor
        : gitHistoryGraphObject.options.branchTextColor;

        var backgroundColor = labelData.LabelState === "head"
        ? gitHistoryGraphObject.options.headBackground
        : gitHistoryGraphObject.options.branchBackground;

        var borderColor = labelData.LabelState === "head"
        ? gitHistoryGraphObject.options.headBorder
        : gitHistoryGraphObject.options.branchBorder;

        var fontFamily = labelData.LabelState === "head"
        ? gitHistoryGraphObject.options.labelFont
        : gitHistoryGraphObject.options.textFont;

        var text = new createjs.Text(labelData.Text, fontFamily, textColor);
        text.textBaseline = "top";
        var textLocation = gitHistoryGraphObject.getTextLocation(labelData.Y);
        textLocation = textLocation === 0 ? labelData.X : textLocation;
        text.x = textLocation;
        text.y = labelData.Y - 8;

        var target = new createjs.Shape();
        target.x = textLocation - 12;
        target.y = labelData.Y - 15;

        target.graphics.beginFill(backgroundColor).drawRoundRect(0, 0, text.getMeasuredWidth() + 24, 28, 4).endFill();
        target.graphics.beginStroke(borderColor).setStrokeStyle(1).drawRoundRect(0, 0, text.getMeasuredWidth() + 24, 28, 4).endStroke();

        textLocation += text.getMeasuredWidth() + 32;
        gitHistoryGraphObject.updateTextLocation(labelData.Y, textLocation);

        stage.addChild(target);
        stage.addChild(text);
    };

    gitHistoryGraphObject.drawText = function (textData) {
        var textLocation = gitHistoryGraphObject.getTextLocation(textData.Y);
        textLocation = textLocation === 0 ? textData.X : textLocation - 5;

        var text = new createjs.Text(textData.Message, gitHistoryGraphObject.options.textFont, gitHistoryGraphObject.options.textColor);
        text.x = textLocation;
        text.y = textData.Y - 8;
        text.textBaseline = "top";
        stage.addChild(text);
    };

    gitHistoryGraphObject.drawLine = function (lineData) {

        var color = lineData.LineState === "active"
        ? gitHistoryGraphObject.options.activeLineColor
        : gitHistoryGraphObject.options.inactiveLineColor;

        var line = new createjs.Shape();
        line.graphics.setStrokeStyle(lineData.Width);
        line.graphics.beginStroke(color);
        line.graphics.moveTo(lineData.X1, lineData.Y1);
        line.graphics.lineTo(lineData.X2, lineData.Y2);

        stage.addChild(line);
    };

    gitHistoryGraphObject.drawCommit = function (commitData) {

        var target = new createjs.Sprite(commitSprite, commitData.CommitState);
        target.setTransform(commitData.X, commitData.Y);

        stage.addChild(target);

        target.commitHash = commitData.CommitHash;
        target.commitMessage = commitData.CommitMessage;
        target.cursor = 'pointer';
        target.on("click", gitHistoryGraphObject.handleCommitClick);
    };

    gitHistoryGraphObject.drawArrow = function (start, end) {

        if (start.X === end.X && start.Y === end.Y) {
            return;
        }

        var line = new createjs.Shape();
        line.graphics.setStrokeStyle(2);
        line.graphics.beginStroke(gitHistoryGraphObject.options.highlightLineColor);
        line.graphics.moveTo(start.X + 13, start.Y + 13);
        line.graphics.lineTo(end.X + 13, end.Y + 13);

        // draw the ending arrowhead
        var originalRadians = end.X - start.X === 0
        ? (end.Y - start.Y > 0 ? -Math.PI / 2 : Math.PI / 2)
        : Math.atan((end.Y - start.Y) / (end.X - start.X));

        var endRadians = originalRadians * 180 / Math.PI + ((end.X > start.X) ? 90 : -90);
        this.drawArrowhead(end.X, end.Y, endRadians);

        stage.addChild(line);
    };

    gitHistoryGraphObject.drawArrowhead = function (x, y, rotation) {
        var arrowHead = new createjs.Shape();
        arrowHead.setTransform(x + 13, y + 13);
        arrowHead.rotation = rotation;
        arrowHead.graphics.beginFill(gitHistoryGraphObject.options.highlightLineColor)
                     .moveTo(0, 0)
                     .lineTo(5, 20)
                     .lineTo(-5, 20)
                     .lineTo(0, 0);

        stage.addChild(arrowHead);
    };

    gitHistoryGraphObject.updateTextLocation = function (y, location) {
        textLocationStorage[y.toString()] = location;
    };

    gitHistoryGraphObject.getTextLocation = function (y) {
        return textLocationStorage[y.toString()] === undefined ? 0 : textLocationStorage[y.toString()];
    };

    gitHistoryGraphObject.handleCommitClick = function (event) {
        var target = event.target;
        var commitHash = target.commitHash;
        var commitMessage = target.commitMessage;

        alert(commitHash + "-" + commitMessage);
    };

    gitHistoryGraphObject.next = function () {
        if (currentPage <= pageCount) {
            currentPage++;
            stage.y = -currentPage * pageHeight;
            stage.update();
        }
    };

    gitHistoryGraphObject.previous = function () {
        if (currentPage > 0) {
            currentPage--;
            stage.y = -currentPage * pageHeight;
            stage.update();
        }
    };

    return gitHistoryGraphObject;

} (jQuery));


GITHISTORYGRAPH.defined = true;
GITHISTORYGRAPH.initialize();