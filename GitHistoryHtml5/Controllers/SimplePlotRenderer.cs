namespace GitHistoryHtml5.Controllers
{
    using System.Collections.Generic;
    using System.Linq;
    using GitHistoryHtml5.HistoryGraph;
    using NGit;
    using NGit.Revplot;
    using System.Drawing;

    /// <summary>
    /// SimplePlotRenderer class.
    /// </summary>
    public class SimplePlotRenderer : SimpleAbstractPlotRenderer<PlotLane, Color>
    {
        private const int FontSize = 12;

        private const string FontFamily = "Arial";

        private const string ActiceLane = "active";

        private const string InactiveLane = "inactive";

        private const string HighLightLane = "highlight";

        private const string RemoteBranchLabel = "remote";

        private const string LocalHeadLabel = "head";

        private Graph _graph;

        public SimplePlotRenderer()
        {
            _graph = new Graph
            {
                Lines = new List<Line>(),
                Texts = new List<Text>(),
                Labels = new List<Label>(),
                Commits = new List<Commit>(),
            };
        }

        /// <summary>
        /// Build Graph.
        /// </summary>
        /// <param name="commitList">Commit List.</param>
        /// <returns>Graph information.</returns>
        public Graph BuildGraph(PlotCommitList<PlotLane> commitList)
        {
            ClearGraph();

            foreach (var commit in commitList)
            {
                PaintCommit(commitList, commit);
            }

            _graph.Height = LINE_HEIGHT / 2 * commitList.Count;
            return _graph;
        }

        public void ClearGraph()
        {
            _graph.Labels.Clear();
            _graph.Texts.Clear();
            _graph.Commits.Clear();
            _graph.Lines.Clear();
        }

        /// <summary>
        /// Implement method DrawLabel: Add label information to graph.
        /// </summary>
        /// <param name="x">X location.</param>
        /// <param name="y">Y location.</param>
        /// <param name="ref">Ref information.</param>
        /// <returns>Label width.</returns>
        protected override int DrawLabel(int x, int y, Ref @ref)
        {
            var text = @ref.GetName();

            var localHead = text == "HEAD";
            var originHead = text.StartsWith("refs/remotes/origin/HEAD");
            var remoteBranch = !originHead && text.StartsWith("refs/remotes/origin/");

            // Only process local head and remote branch
            if (!localHead && !remoteBranch)
            {
                return 0;
            }

            text = localHead ? "HEAD" : text.Replace("refs/remotes/", string.Empty);
            var label = new Label
            {
                LabelState = localHead ? LocalHeadLabel : RemoteBranchLabel,
                Text = text,
                X = x,
                Y = y
            };

            _graph.Labels.Add(label);

            return 0;
        }

        /// <summary>
        /// Implement method DrawLine: Add line information to graph.
        /// </summary>
        /// <param name="active">Indicating whether this line is active or not.</param>
        /// <param name="x1">X1 location.</param>
        /// <param name="y1">Y1 location.</param>
        /// <param name="x2">X2 location.</param>
        /// <param name="y2">Y2 location.</param>
        /// <param name="width">Line width.</param>
        protected override void DrawLine(bool active, int x1, int y1, int x2, int y2, int width)
        {
            var line = new Line
            {
                LineState = active ? ActiceLane : InactiveLane,
                X1 = x1,
                Y1 = y1,
                X2 = x2,
                Y2 = y2,
                Width = width
            };

            _graph.Lines.Add(line);
        }

        /// <summary>
        /// Implement method DrawCommitDot: Add commit information to graph.
        /// </summary>
        /// <param name="plotCommit">PlotCommit object.</param>
        /// <param name="x">X location.</param>
        /// <param name="y">Y location.</param>
        /// <param name="w">Commit width.</param>
        /// <param name="h">Commit height.</param>
        protected override void DrawCommitDot(PlotCommit<PlotLane> plotCommit, int x, int y, int w, int h)
        {
            var commitState = plotCommit.Active ? ActiceLane : InactiveLane;
            var commit = new Commit
            {
                CommitHash = plotCommit.Name,
                CommitMessage = plotCommit.GetShortMessage(),
                CommitState = commitState,
                X = x,
                Y = y
            };

            _graph.Commits.Add(commit);
        }

        protected override void DrawBoundaryDot(int x, int y, int w, int h)
        {
        }

        protected override void DrawText(string msg, int x, int y)
        {
            var text = new Text
            {
                Message = msg,
                X = x,
                Y = y,
            };

            _graph.Texts.Add(text);
        }    
    }
}
