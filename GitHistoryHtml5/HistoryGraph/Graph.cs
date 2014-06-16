namespace GitHistoryHtml5.HistoryGraph
{
    using System.Collections.Generic;

    /// <summary>
    /// Graph class.
    /// </summary>
    public class Graph
    {
        public IList<Line> Lines { get; set; }

        public IList<Commit> Commits { get; set; }

        public IList<Label> Labels { get; set; }

        public IList<Text> Texts { get; set; }

        public int Height { get; set; }
    }
}
